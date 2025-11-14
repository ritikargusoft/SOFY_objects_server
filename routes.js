import express from "express";
import objectsApi from "./features/objects/objectsApi.js";
import fieldsApi from "./features/fields/fieldsApi.js";


const router = express.Router();

router.use("/objects", objectsApi);
router.use("/objects/:id/fields", fieldsApi);

export default router;
