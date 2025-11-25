import * as recordsService from "./objectRecordService.js";
import * as objectsService from "../objects/objectsService.js";

async function resolveObject(params) {
  const paramVal = params.objectUuid ?? params.id;
  if (!paramVal) return null;
  try {
    const obj = await objectsService.getObjectByUuid(paramVal);
    if (obj) return obj;
  } catch (e) {}
  if (/^\d+$/.test(String(paramVal))) {
    try {
      const obj2 = await objectsService.getObjectById(paramVal);
      if (obj2) return obj2;
    } catch (e) {}
  }
  return null;
}

export async function getRecords(req, res, next) {
  try {
    const object = await resolveObject(req.params);
    if (!object) return res.status(404).json({ message: "Object not found" });

    const tableName = object?.database_object;
    if (!tableName) {
      return res.status(400).json({ message: object });
    }

    const rows = await recordsService.listRecordsForObject(object, tableName);
    return res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function createRecord(req, res, next) {
  try {
    const object = await resolveObject(req.params);
    if (!object) return res.status(404).json({ message: "Object not found" });

    const tableName = object?.database_object;
    if (!tableName) {
      return res.status(400).json({ message: object });
    }

    const payload = req.body ?? {};
    if (!payload || typeof payload !== "object") {
      return res.status(400).josn({ message: "Invalid payload" });
    }

    try {
      const created = await recordsService.createRecordForObject(
        object,
        tableName,
        payload
      );
      return res.status(201).json(created);
    } catch (err) {
      return res
        .status(400)
        .json({ message: err.message ?? "Failed to create record" });
    }
  } catch (err) {
    next(err);
  }
}

export async function updateRecord(req, res, next) {
  try {
    const object = await resolveObject(req.params);
    if (!object) return res.status(400).json({ message: "Object not found" });

    const tableName = object?.database_object;
    if (!tableName)
      return res.status(400).json({ message: "Object database name missing" });

    const recordUuid = req.params.recordUuid;
    if (!recordUuid)
      return res.status(400).json({ message: "recordUuid required" });

    const payload = req.body ?? {};
    if (!payload || typeof payload !== "object")
      return res.status(400).json({ message: "Invalid payload" });

    try {
      const updated = await recordsService.updateRecordForObject(
        object,
        tableName,
        recordUuid,
        payload
      );
      return res.status(201).json(updated);
    } catch (error) {
      return res
        .status(404)
        .json({ message: error.message ?? "Failed to update record" });
    }
  } catch (err) {
    next(err);
  }
}

export async function deleteRecord(req, res, next) {
  try {
    const object = await resolveObject(req.params);
    if (!object) return res.status(404).json({ message: "Object not found" });

    const tableName = object?.database_object;
    if (!tableName) {
      return res.status(400).json({ message: object });
    }
    const recordUuid = req.params.recordUuid;
    if (!recordUuid) {
      return res.status(400).json({ message: "recordUuid required" });
    }
    try {
      const deleted = await recordsService.deleteRecordForObject(
        object,
        tableName,
        recordUuid
      );
      return res.status(201).json(deleted);
    } catch (err) {
      return res
        .status(404)
        .json({ message: err.message ?? "Record not found" });
    }
  } catch (err) {
    next(err);
  }
}
