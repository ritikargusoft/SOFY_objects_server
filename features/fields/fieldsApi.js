
import express from "express";
import { createField, getFields } from "./fieldsController.js";
const router = express.Router({ mergeParams: true });
router.get("/", getFields);
router.post("/", createField);
export default router;