import pool from "../../db/connectDB.js";

export async function getAllObjects() {
  const q = `SELECT object_uuid, object_id, name, description, createdAt, createdBy, lastUpdatedAt, lastUpdatedBy FROM objects ORDER BY createdAt DESC`;
  const r = await pool.query(q);
  return r.rows;
}

export async function getObjectByUuid(object_uuid) {
  const q = `
    SELECT object_uuid, object_id, name, description, createdAt, createdBy, lastUpdatedAt, lastUpdatedBy
    FROM objects
    WHERE object_uuid = $1
    LIMIT 1
  `;
  const r = await pool.query(q, [object_uuid]);
  return r.rows[0] ?? null;
}

export async function getObjectById(object_id) {
  const q = `
    SELECT object_uuid, object_id, name, description, createdAt, createdBy, lastUpdatedAt, lastUpdatedBy
    FROM objects
    WHERE object_id = $1
    LIMIT 1
  `;
  const r = await pool.query(q, [object_id]);
  return r.rows[0] ?? null;
}

export async function getObjectByName(name) {
  const q = `
    SELECT object_uuid, object_id, name, description, createdAt, createdBy, lastUpdatedAt, lastUpdatedBy
    FROM objects
    WHERE LOWER(name) = LOWER($1)
    LIMIT 1
  `;
  const r = await pool.query(q, [name]);
  return r.rows[0] ?? null;
}

export async function createObject({ name, description = null }) {
  const q = `
    INSERT INTO objects (name, description, createdAt, createdBy, lastUpdatedAt, lastUpdatedBy)
    VALUES ($1, $2, NOW(), 'admin', NOW(), 'admin')
    RETURNING object_uuid, object_id, name, description, createdAt, createdBy, lastUpdatedAt, lastUpdatedBy
  `;
  const r = await pool.query(q, [name, description]);
  return r.rows[0] ?? null;
}

export async function updateObject(object_uuid, { name, description }) {
  const q = `
  UPDATE objects 
  SET 
  name = COALESCE($2, name),
  description = COALESCE($3, description),
  lastUpdatedAt = NOW()
  where object_uuid = $1
  RETURNING object_uuid, object_id, name, description, createdAt, createdBy, lastUpdatedAt, lastUpdatedBy
`;
const r = await pool.query(q,[
  object_uuid,
  name ?? null,
  description ?? null
]);
return r.rows[0] ?? null
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