import * as repo from "./fieldRepository.js";

const VARCHAR_MAX_LIMIT = 1000000000; // match frontend limit

function mapFieldTypeToSql(fieldType, maxLength = null) {
  switch (fieldType) {
    case "short_text": {
      const ml = Number(maxLength) || 255;
      return `VARCHAR(${ml})`;
    }

    case "long_text": {
      // if maxLength provided, use VARCHAR(maxLength), otherwise TEXT
      const ml = Number(maxLength);
      if (!Number.isNaN(ml) && ml > 0) {
        return `VARCHAR(${ml})`;
      }
      return `TEXT`;
    }

    case "number":
      return "NUMERIC";

    case "email":
      return "VARCHAR(255)";

    case "dropdown":
      return "TEXT";

    case "checkbox":
      return "TEXT";

    case "radio":
      return "VARCHAR(255)";

    case "decimal":
      return "NUMERIC(38,3)";

    case "star_rating":
      return "INTEGER";

    default:
      throw new Error("Unsupported field type");
  }
}

const ALLOWED = [
  "short_text",
  "long_text",
  "number",
  "checkbox",
  "dropdown",
  "radio",
  "email",
  "star_rating",
  "decimal",
];

export async function addFieldToObject(
  object,
  tableName,
  {
    field_name,
    field_label,
    field_description = null,
    field_type,
    field_order = null,
    created_by = "system",
    max_length = null,
    default_value = null,
    markdown = false,
  }
) {
  if (!field_name) throw new Error("field_name required");
  if (!field_label) throw new Error("field_label required");
  if (!field_type) throw new Error("field_type required");
  if (!ALLOWED.includes(field_type)) throw new Error("Invalid field_type");

  // validation for short_text and long_text max_length
  if (
    (field_type === "short_text" || field_type === "long_text") &&
    max_length != null
  ) {
    const ml = Number(max_length);
    if (Number.isNaN(ml) || ml <= 0) {
      throw new Error("Invalid max_length");
    }
    if (ml > VARCHAR_MAX_LIMIT) {
      throw new Error(
        `Max Length should not be greater than NVARCHAR(MAX) (i.e. ${VARCHAR_MAX_LIMIT})`
      );
    }
  }

  const exists = await repo.fieldNameExists(object.object_uuid, field_name);
  if (exists) {
    return { created: false, message: "Field name already exists" };
  }
  let order = Number(field_order ?? 0);
  if (!order || order <= 0) {
    order = await repo.getNextOrderForObject(object.object_uuid);
  }
  const meta = await repo.insertFieldMetadata({
    object_uuid: object.object_uuid,
    name: field_name,
    label: field_label,
    description: field_description ?? null,
    field_type,
    field_order: order,
    created_by,
    max_length:
      field_type === "short_text" || field_type === "long_text"
        ? max_length
          ? Number(max_length)
          : field_type === "short_text"
          ? 255
          : null
        : null,
    default_value: default_value ?? null,
    markdown: !!markdown,
  });

  const columnName = field_name;
  const sqlType = mapFieldTypeToSql(field_type, meta.max_length ?? null);
  const tableExists = await repo.tableExists(tableName);
  if (!tableExists) {
    await repo.createObjectDataTable(tableName);
  }
  await repo.addColumnToObjectTable(tableName, columnName, sqlType);
  return {
    created: true,
    tableCreated: !tableExists,
    tableName,
    columnName,
    metadata: meta,
  };
}

export async function listFieldsForObject(object) {
  const rows = await repo.getFieldsByObject(object.object_uuid);
  return rows;
}

export async function updateFieldForObject(
  object,
  tableName,
  field_uuid,
  updates = {},
  updated_by = "system"
) {
  if (!field_uuid) throw new Error("field_uuid required");
  const current = await repo.getFieldByUuid(field_uuid);
  if (!current) throw new Error("Field not found");

  if (updates.name && updates.name !== current.name) {
    const nameExists = await repo.fieldNameExistsExcept(
      object.object_uuid,
      updates.name,
      field_uuid
    );
    if (nameExists) {
      return {
        updated: false,
        message: "Field name already exists for this object",
      };
    }
  }

  if (updates.field_type && !ALLOWED.includes(updates.field_type)) {
    throw new Error("Invalid field_type");
  }

  // validate max_length when provided for short_text or long_text
  if (
    updates.field_type === "short_text" ||
    updates.field_type === "long_text" ||
    current.field_type === "short_text" ||
    current.field_type === "long_text"
  ) {
    const newType = updates.field_type ?? current.field_type;
    const newMax =
      typeof updates.max_length !== "undefined"
        ? updates.max_length
        : current.max_length;
    if (
      (newType === "short_text" || newType === "long_text") &&
      newMax != null
    ) {
      const ml = Number(newMax);
      if (Number.isNaN(ml) || ml <= 0) throw new Error("Invalid max_length");
      if (ml > VARCHAR_MAX_LIMIT) {
        throw new Error(
          `Max Length should not be greater than NVARCHAR(MAX) (i.e. ${VARCHAR_MAX_LIMIT})`
        );
      }
    }
  }

  const ddlResults = {
    renamedColumn: false,
    alteredType: false,
    addedColumnIfMissing: false,
    defaultChanged: false,
  };

  const tableExists = await repo.tableExists(tableName);
  const oldColumn = current.name;
  const newColumn = updates.name ? updates.name : oldColumn;

  //handle rename / add column if missing
  if (updates.name && tableExists) {
    if (oldColumn !== newColumn) {
      try {
        const renameRes = await repo.renameColumnInObjectTable(
          tableName,
          oldColumn,
          newColumn
        );
        if (renameRes.renamed) ddlResults.renamedColumn = true;
        else if (renameRes.reason === "old_column_not_found") {
          const sqlType = mapFieldTypeToSql(
            updates.field_type ?? current.field_type,
            updates.max_length ?? current.max_length
          );
          await repo.addColumnToObjectTable(tableName, newColumn, sqlType);
          ddlResults.addedColumnIfMissing = true;
        }
      } catch (err) {
        throw new Error("Failed to rename or add column: " + err.message);
      }
    }
  }

  // handle type change (including max length)
  if (updates.field_type && tableExists) {
    const targetColumn = newColumn;
    const sqlType = mapFieldTypeToSql(
      updates.field_type,
      updates.max_length ?? current.max_length
    );
    try {
      const alterRes = await repo.alterColumnTypeInObjectTable(
        tableName,
        targetColumn,
        sqlType
      );
      if (alterRes.altered) ddlResults.alteredType = true;
    } catch (err) {
      throw new Error("Failed to alter column type: " + err.message);
    }
  }

  // if table doesn't exist yet and name/type provided create table and add column
  if (!tableExists && (updates.name || updates.field_type)) {
    await repo.createObjectDataTable(tableName);
    const col = updates.name ?? current.name;
    const sqlType = mapFieldTypeToSql(
      updates.field_type ?? current.field_type,
      updates.max_length ?? current.max_length
    );
    await repo.addColumnToObjectTable(tableName, col, sqlType);
    ddlResults.addedColumnIfMissing = true;
  }

  // update metadata
  const updated = await repo.updateFieldMetadata(field_uuid, {
    name: updates.name ?? null,
    label: updates.label ?? null,
    description: updates.description ?? null,
    field_type: updates.field_type ?? null,
    field_order: updates.field_order ?? null,
    last_updated_by: updated_by,
    max_length:
      typeof updates.max_length !== "undefined" ? updates.max_length : null,
    default_value:
      typeof updates.default_value !== "undefined"
        ? updates.default_value
        : null,
    markdown:
      typeof updates.markdown !== "undefined" ? !!updates.markdown : null,
  });

  return {
    updated: true,
    metadata: updated,
    ddl: ddlResults,
  };
}

export async function deleteFieldForObject(object, tableName, field_uuid) {
  if (!field_uuid) throw new Error("Field uuid required");

  const current = await repo.getFieldByUuid(field_uuid);
  if (!current) throw new Error("Field not found");

  if (current.object_uuid !== object.object_uuid) {
    throw new Error("Field does not belong to the provided object");
  }

  const columnName = current.name;
  const tableExists = await repo.tableExists(tableName);
  let dropped = false;

  if (tableExists) {
    await repo.dropColumnFromObject(tableName, columnName);
    dropped = true;
  }

  const deletedMeta = await repo.deleteField(field_uuid);

  return {
    deleted: true,
    metadata: deletedMeta,
    columnDropped: dropped,
    tableName,
  };
}
