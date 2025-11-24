import pool from "../../db/connectDB.js";

export async function listRecords(tableName) {
    const q = ` SELECT * FROM ${tableName} ORDER BY record_id ASC`;
    const r = await pool.query(q);
    return r.rows;
}

export async function listColumns(tableName) {
    const q = `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position;
  `;
    const r = await pool.query(q, [tableName]);
    return r.rows.map((r) => r.column_name)
}

export async function insertRecord(tableName, payload) {
    const keys = Object.keys(payload);
    if (keys.length === 0) {
        const qEmpty = `INSERT INTO "${tableName}" DEFAULT VALUES RETURNING *;`;
        const rEmpty = await pool.query(qEmpty);
        return rEmpty.rows[0];
    }
    const colsEscaped = keys.map((k) => `"${k}"`).join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const values = keys.map((k) => payload[k]);

    const q = `INSERT INTO "${tableName}" (${colsEscaped}) VALUES (${placeholders}) RETURNING *;`;
    const r = await pool.query(q, values);
    return r.rows[0];
}

export async function deleteRecord(tableName, recordUuid) {
    const q = `DELETE FROM "${tableName}" WHERE record_uuid = $1 RETURNING *;`;

    const r = await pool.query(q, [recordUuid]);
    return r.rows[0] ?? null;
}