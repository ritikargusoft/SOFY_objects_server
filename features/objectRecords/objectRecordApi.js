import express from "express";
import {
  createRecord,
  getRecords,
  deleteRecord,
  updateRecord,
} from "./objectRecordController.js";

const router = express.Router({ mergeParams: true });

router.get("/", getRecords);
router.post("/", createRecord);
router.delete("/:recordUuid", deleteRecord);
router.put("/:recordUuid", updateRecord);

export default router;
