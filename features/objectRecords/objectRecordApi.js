import express from "express";
import { createRecord, getRecords, deleteRecord } from "./objectRecordController.js";


const router = express.Router({ mergeParams: true });

router.get("/", getRecords)
router.post("/", createRecord)
router.delete("/:recordUuid",deleteRecord)

export default router;