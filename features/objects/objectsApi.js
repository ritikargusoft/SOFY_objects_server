import express from "express";
import {
  createObject,
  deleteObject,
  getAllObjects,
  getObjectByUuid,
  updateObject,
} from "./objectsController.js";
import fieldsIndex from "../fields/fieldsApi.js";

const router = express.Router();

router.post("/", createObject);
router.get("/", getAllObjects);
router.get("/:id", getObjectByUuid);
router.put("/:id", updateObject);
router.delete("/:id", deleteObject);
router.use("/:objectUuid/fields", fieldsIndex);

export default router;
