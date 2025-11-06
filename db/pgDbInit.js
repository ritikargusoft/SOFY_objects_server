import { createObjectsTable } from "../features/objects/objectsRepository.js";

const createTables = async () => {
  try {
    await createObjectsTable();
    console.log("Tables Created");
  } catch (error) {
    console.log(error);
  }
};

export default createTables;
