import express from "express";
import { createField, deleteField, getFields, updateField } from "./fieldsController.js";
const router = express.Router({ mergeParams: true });
router.get("/", getFields);
router.post("/", createField);
router.delete("/:fieldUuid", deleteField);
router.put("/:fieldUuid", updateField);
export default router;
