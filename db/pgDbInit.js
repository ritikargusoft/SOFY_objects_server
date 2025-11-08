import { createObjectsTable } from "../tables/objectModel.js";

const createTables = async () => {
  try {
    await createObjectsTable();
    console.log("Tables Created");
  } catch (error) {
    console.log(error);
  }
};

export default createTables;
