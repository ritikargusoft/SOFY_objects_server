import pool from "../../db/connectDB.js";

export const createObjectsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS objects (
    object_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_id SERIAL UNIQUE NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT NOW(),
    createdBy VARCHAR(255) DEFAULT 'admin',
    lastUpdatedAt TIMESTAMP DEFAULT NOW(),
    lastUpdatedBy VARCHAR(255) DEFAULT 'admin'
    );
    `;
  await pool.query(query);
};
