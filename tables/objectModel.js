import pool from "../db/connectDB.js";

export const createObjectsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS objects (
      object_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      object_id SERIAL UNIQUE NOT NULL,
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      databse_object VARCHAR(255),
      is_deleted INTEGER DEFAULT 0 CHECK (is_deleted IN (0, 1)),
      created_at TIMESTAMP DEFAULT NOW(),
      created_by VARCHAR(255) DEFAULT 'admin',
      last_updated_at TIMESTAMP DEFAULT NOW(),
      last_updated_by VARCHAR(255) DEFAULT 'admin'
    );
  `;
  await pool.query(query);
};
