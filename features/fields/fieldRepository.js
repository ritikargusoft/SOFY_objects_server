import pool from "../../db/connectDB.js";

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

export async function createFieldsTable(tableName) {
  const q = `
    CREATE TABLE IF NOT EXISTS "${tableName}" (
      field_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      field_id SERIAL UNIQUE NOT NULL,
      field_order INTEGER NOT NULL,
      name TEXT NOT NULL,
      label TEXT NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(q);
}

export async function fieldNameExists(tableName, name) {
  const q = `SELECT 1 FROM "${tableName}" WHERE LOWER(name) = LOWER($1) LIMIT 1;`;
  const r = await pool.query(q, [name]);
  return r.rowCount > 0;
}

export async function getNextOrder(tableName) {
  const q = `SELECT COALESCE(MAX(field_order), 0) AS max_order FROM "${tableName}";`;
  const r = await pool.query(q);
  return (r.rows[0]?.max_order ?? 0) + 1;
}

export async function insertFieldRow(
  tableName,
  { field_order, name, label, description, type }
) {
  const q = `
    INSERT INTO "${tableName}" (field_order, name, label, description, type, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING field_uuid, field_id, field_order, name, label, description, type, created_at, updated_at;
  `;
  const r = await pool.query(q, [
    field_order,
    name,
    label,
    description ?? null,
    type,
  ]);
  return r.rows[0] ?? null;
}

export async function listFieldsRows(tableName) {
  const q = `
    SELECT field_uuid, field_id, field_order, name, label, description, type, created_at, updated_at
    FROM "${tableName}"
    ORDER BY field_order, field_id;
  `;
  const r = await pool.query(q);
  return r.rows;
}
