import pool from "../../db/connectDB.js";

function sanitizeObjectName(name) {
  if (!name) return "";
  return name.trim().replace(/\s+/g, " ").replace(/ /g, "_").toLowerCase();
}

export async function getAllObjects() {
  const q = `
    SELECT object_uuid, object_id, name, description, database_object, created_at, created_by, last_updated_at, last_updated_by, is_deleted
    FROM objects
    ORDER BY created_at DESC
  `;
  const r = await pool.query(q);
  return r.rows;
}

export async function getObjectByUuid(object_uuid) {
  const q = `
    SELECT object_uuid, object_id, name, description, database_object, created_at, created_by, last_updated_at, last_updated_by,is_deleted
    FROM objects
    WHERE object_uuid = $1
    LIMIT 1
  `;
  const r = await pool.query(q, [object_uuid]);
  return r.rows[0] ?? null;
}

export async function getObjectById(object_id) {
  const q = `
    SELECT object_uuid, object_id, name, description, database_object, created_at, created_by, last_updated_at, last_updated_by, is_deleted
    FROM objects
    WHERE object_id = $1
    LIMIT 1
  `;
  const r = await pool.query(q, [object_id]);
  return r.rows[0] ?? null;
}

export async function getObjectByName(name) {
  const q = `
    SELECT object_uuid, object_id, name, description, database_object, created_at, created_by, last_updated_at, last_updated_by, is_deleted
    FROM objects
    WHERE LOWER(name) = LOWER($1)
    LIMIT 1
  `;
  const r = await pool.query(q, [name]);
  return r.rows[0] ?? null;
}

export async function createObject({ name, description = null }) {
  const cleanName = sanitizeObjectName(name);
  const dbObjectName = `sph_object_${cleanName}`;
  const q = `
    INSERT INTO objects (name, description, database_object, created_at, created_by, last_updated_at, last_updated_by)
    VALUES ($1, $2, $3, NOW(), 'admin', NOW(), 'admin')
    RETURNING object_uuid, object_id, name, description, database_object, created_at, created_by, last_updated_at, last_updated_by
  `;
  const r = await pool.query(q, [name, description, dbObjectName]);
  return r.rows[0] ?? null;
}

export async function updateObject(object_uuid, { name, description }) {
  let dbObjectName = null;
  if (typeof name !== "undefined" && name !== null) {
    const cleanName = sanitizeObjectName(name);
    dbObjectName = `sph_object_${cleanName}`;
  }
  const q = `
    UPDATE objects
    SET
      name = COALESCE($2, name),
      description = COALESCE($3, description),
      database_object = COALESCE($4, database_object),
      last_updated_at = NOW()
    WHERE object_uuid = $1
    RETURNING object_uuid, object_id, name, description, database_object, created_at, created_by, last_updated_at, last_updated_by
  `;
  const r = await pool.query(q, [
    object_uuid,
    name ?? null,
    description ?? null,
    dbObjectName ?? null,
  ]);
  return r.rows[0] ?? null;
}

export async function deleteObject(object_uuid) {
  const q = `
    DELETE FROM objects
    WHERE object_uuid = $1
    RETURNING object_uuid, object_id
  `;
  const r = await pool.query(q, [object_uuid]);
  return r.rows[0] ?? null;
}
