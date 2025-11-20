import * as repo from "./fieldRepository.js";

export function sanitizeIdentifier(raw) {
  if (!raw || typeof raw !== "string") throw new Error("Invalid identifier");
  let s = raw.trim().toLowerCase();
  s = s.replace(/[^a-z0-9_]+/g, "_");
  s = s.replace(/^[^a-z_]+/, "");
  if (!s) throw new Error("Invalid identifier after sanitization");
  if (s.length > 50) s = s.slice(0, 50);
  if (!/^[a-z_][a-z0-9_]*$/.test(s))
    throw new Error("Identifier contains invalid characters");
  return s;
}

export function buildTableNameForObject(object) {
  if (!object) throw new Error("Object is required");
  const base = object.database_object
    ? object.database_object
    : `sph_object_${object.name}`;
  return sanitizeIdentifier(base);
}

function mapFieldTypeToSql(fieldType) {
  switch (fieldType) {
    case "short_text":
      return "VARCHAR(255)";
    case "long_text":
      return "TEXT";
    case "number":
      return "NUMERIC";
    case "checkbox":
      return "BOOLEAN";
    case "dropdown":
      return "VARCHAR(255)";
    case "radio":
      return "VARCHAR(255)";
    case "email":
      return "VARCHAR(255)";
    case "star_rating":
      return "INTEGER";
    default:
      throw new Error("Unsupported field type");
  }
}

export async function addFieldToObject(
  object,
  {
    field_name,
    field_label,
    field_description = null,
    field_type,
    field_order = null,
    created_by = "system",
  }
) {
  if (!field_name) throw new Error("field_name required");
  if (!field_label) throw new Error("field_label required");
  if (!field_type) throw new Error("field_type required");

  const ALLOWED = [
    "short_text",
    "long_text",
    "number",
    "checkbox",
    "dropdown",
    "radio",
    "email",
    "star_rating",
  ];
  if (!ALLOWED.includes(field_type)) throw new Error("Invalid field_type");

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
  });

  const tableName = buildTableNameForObject(object);
  const columnName = sanitizeIdentifier(field_name);
  const sqlType = mapFieldTypeToSql(field_type);

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

export async function deleteFieldForObject(object, field_uuid) {
  if (!field_uuid) throw new Error("Field uuid required");

  const current = await repo.getFieldByUuid(field_uuid);
  if (!current) throw new Error("Field not found");

  if (current.object_uuid !== object.object_uuid) {
    throw new Error("Field does not belong to the provided object");
  }

  const tableName = buildTableNameForObject(object);
  const columnName = sanitizeIdentifier(current.name);

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
