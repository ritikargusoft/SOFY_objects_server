import express from "express";
import createDatabase from "./db/createDB.js";
import createTables from "./db/pgDbInit.js";
import router from "./routes.js";

const app = express();

async function initializeDatabase() {
  try {
    await createDatabase();
    await createTables();
    console.log("Database and tables initialized successfully.");
  } catch (err) {
    console.error("Error during database initialization:", err);
  }
}
initializeDatabase();

app.use(express.json());

app.use("/", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
