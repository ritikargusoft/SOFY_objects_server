import pool from "../db/connectDB.js";

export const createFieldsMetadataTable = async () => {
  const q = `
    CREATE TABLE IF NOT EXISTS sph_object_fields (
      field_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      field_id SERIAL UNIQUE NOT NULL,
      object_uuid UUID NOT NULL,
      name TEXT NOT NULL,
      label TEXT NOT NULL,
      description TEXT,
      field_type VARCHAR(50) NOT NULL,
      field_order INTEGER NOT NULL,
      created_by VARCHAR(255) DEFAULT 'system',
      created_at TIMESTAMP DEFAULT NOW(),
      last_updated_by VARCHAR(255) DEFAULT 'system',
      last_updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_sph_object_fields_object_name_lower
      ON sph_object_fields (object_uuid, LOWER(name));
  `;
  await pool.query(q);
};
