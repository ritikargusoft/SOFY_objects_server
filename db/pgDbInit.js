import { createFieldsMetadataTable } from "../tables/fieldModel.js";
import { createObjectsTable } from "../tables/objectModel.js";

const createTables = async () => {
  try {
    await createObjectsTable();
    await createFieldsMetadataTable();
    console.log("Tables Created");
  } catch (error) {
    console.log(error);
  }
};

export default createTables;
