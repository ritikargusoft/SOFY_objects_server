import pool from "../../db/connectDB.js";

export async function insertFieldMetadata({
  object_uuid,
  name,
  label,
  description = null,
  field_type,
  field_order = 1,
  created_by = "system",
}) {
  const q = `
    INSERT INTO sph_object_fields
      (object_uuid, name, label, description, field_type, field_order, created_by, created_at, last_updated_by, last_updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $7, NOW())
    RETURNING field_uuid, field_id, object_uuid, name, label, description, field_type, field_order, created_by, created_at;
  `;
  const r = await pool.query(q, [
    object_uuid,
    name,
    label,
    description,
    field_type,
    field_order,
    created_by,
  ]);
  return r.rows[0] ?? null;
}

export async function fieldNameExists(object_uuid, name) {
  const q = `SELECT 1 FROM sph_object_fields WHERE object_uuid = $1 AND LOWER(name) = LOWER($2) LIMIT 1;`;
  const r = await pool.query(q, [object_uuid, name]);
  return r.rowCount > 0;
}


export async function getNextOrderForObject(object_uuid) {
  const q = `SELECT COALESCE(MAX(field_order), 0) AS max_order FROM sph_object_fields WHERE object_uuid = $1;`;
  const r = await pool.query(q, [object_uuid]);
  return (r.rows[0]?.max_order ?? 0) + 1;
}

export async function getFieldsByObject(object_uuid) {
  const q = `
    SELECT field_uuid, field_id, field_order, name, label, description, field_type, created_by, created_at, last_updated_by, last_updated_at
    FROM sph_object_fields
    WHERE object_uuid = $1
    ORDER BY field_order, field_id;
  `;
  const r = await pool.query(q, [object_uuid]);
  return r.rows;
}

export async function getFieldByUuid(field_uuid) {
  const q = `
    SELECT field_uuid, field_id, field_order, name, label, description, field_type, created_by, created_at, last_updated_by, last_updated_at
    FROM sph_object_fields
    WHERE field_uuid = $1
LIMIT 1;
  `;
  const r = await pool.query(q, [field_uuid]);
  return r.rows;
}

export async function tableExists(tableName) {
  const q = `
    SELECT EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public' AND tablename = $1
    ) AS exists;
  `;
  const r = await pool.query(q, [tableName]);
  return r.rows[0].exists;
}

export async function createObjectDataTable(tableName) {
  const q = `
    CREATE TABLE IF NOT EXISTS "${tableName}" (
      record_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      record_id SERIAL UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      created_by VARCHAR(255) DEFAULT 'system',
      last_updated_at TIMESTAMP DEFAULT NOW(),
      last_updated_by VARCHAR(255) DEFAULT 'system'
    );
  `;
  await pool.query(q);
}

export async function addColumnToObjectTable(tableName, columnName, sqlType) {
  const q = `
    ALTER TABLE "${tableName}"
    ADD COLUMN IF NOT EXISTS "${columnName}" ${sqlType};
  `;
  await pool.query(q);
}

export async function deleteField(field_uuid) {
  const q = `
    DELETE FROM sph_object_fields
    WHERE field_uuid = $1
    RETURNING field_uuid, field_id, object_uuid, object_id , name, label;
  `;
  const r = await pool.query(q, [field_uuid]);
  return r.rows[0] ?? null;
}

export async function dropColumnFromObject(tableName, columnName) {
  const q = `
  ALTER TABLE "${tableName}" DROP COLUMN IF EXISTS "${columnName}";
  `;
  await pool.query(q);
  return { dropped: true };
}
