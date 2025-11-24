import express from "express";
import objectsApi from "./features/objects/objectsApi.js";
import fieldsApi from "./features/fields/fieldsApi.js";
import recordsApi from "./features/objectRecords/objectRecordApi.js";

const router = express.Router();

router.use("/objects", objectsApi);
router.use("/objects/:id/fields", fieldsApi);
router.use("/objects/:id/records", recordsApi);

export default router;
