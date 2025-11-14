import * as repo from "./fieldRepository.js";

export function sanitizeIdentifier(raw) {
  if (!raw || typeof raw !== "string") throw new Error("Invalid identifier");
  let s = raw.trim().toLowerCase();
  s = s.replace(/[^a-z0-9_]+/g, "_");
  s = s.replace(/^[^a-z_]+/, "");
  if (!s) throw new Error("Invalid identifier after sanitization");
  if (s.length > 60) s = s.slice(0, 60);
  if (!/^[a-z_][a-z0-9_]*$/.test(s))
    throw new Error("Identifier contains invalid characters");
  return s;
}

function buildTableNameForObject(object) {
  if (!object) throw new Error("Object is required");
  const base = object.database_object
    ? object.database_object
    : `sph_object_${object.name}`;
  return sanitizeIdentifier(base);
}

const ALLOWED_TYPES = [
  "checkbox",
  "dropdown",
  "email",
  "long_text",
  "number",
  "radio",
  "short_text",
  "star_rating",
];

export async function addFieldToObject(
  object,
  { field_order, field_name, field_label, field_description, field_type }
) {
  if (!field_name) throw new Error("field_name required");
  if (!field_label) throw new Error("field_label required");
  if (!field_type) throw new Error("field_type required");
  if (!ALLOWED_TYPES.includes(field_type))
    throw new Error("Invalid field_type");

  const tableName = buildTableNameForObject(object);

  const exists = await repo.tableExists(tableName);
  if (!exists) {
    await repo.createFieldsTable(tableName);
  }

  const nameExists = await repo.fieldNameExists(tableName, field_name);
  if (nameExists) {
    return {
      created: false,
      message: "Field name already exists",
      tableName,
      field_name,
    };
  }

  let order = Number(field_order ?? 0);
  if (!order || order <= 0) {
    order = await repo.getNextOrder(tableName);
  }

  const inserted = await repo.insertFieldRow(tableName, {
    field_order: order,
    name: field_name,
    label: field_label,
    description: field_description ?? null,
    type: field_type,
  });

  return { created: true, tableCreated: !exists, tableName, field: inserted };
}

export async function listFieldsForObject(object) {
  const tableName = buildTableNameForObject(object);
  const exists = await repo.tableExists(tableName);
  if (!exists) return [];
  const rows = await repo.listFieldsRows(tableName);
  return rows;
}
