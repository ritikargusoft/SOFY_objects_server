import { Client } from "pg";

const createDatabase = async () => {
  const dbUrl = new URL(process.env.DATABASE_URL);
  const dbName = dbUrl.pathname.replace("/", "");
  dbUrl.pathname = "/postgres";

  const client = new Client({
    connectionString: dbUrl.toString(),
  });
  await client.connect();

  const res = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [dbName]
  );

  if (res.rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Database ${dbName} created`);
  } else {
    console.log(`Database ${dbName} already exists`);
  }

  await client.end();
};

export default createDatabase;
