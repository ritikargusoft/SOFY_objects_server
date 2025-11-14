import * as fieldsService from "./fieldsService.js";
import * as objectsService from "../objects/objectsService.js";

async function resolveObjectFromParams(params) {
  const paramVal = params.objectUuid ?? params.id;
  if (!paramVal) return null;
  try {
    return await objectsService.getObjectByUuid(paramVal);
  } catch (err) {
    if (/^\d+$/.test(String(paramVal))) {
      try {
        return await objectsService.getObjectById(paramVal);
      } catch (e) {}
    }
    return null;
  }
}

export async function createField(req, res, next) {
  try {
    const object = await resolveObjectFromParams(req.params);
    if (!object) return res.status(404).json({ message: "Object not found" });

    const {
      field_order,
      field_name,
      field_label,
      field_description,
      field_type,
    } = req.body;
    if (!field_name)
      return res.status(400).json({ message: "field_name required" });
    if (!field_label)
      return res.status(400).json({ message: "field_label required" });
    if (!field_type)
      return res.status(400).json({ message: "field_type required" });

    const result = await fieldsService.addFieldToObject(object, {
      field_order,
      field_name,
      field_label,
      field_description,
      field_type,
    });

    if (result.created === false) {
      return res
        .status(200)
        .json({ message: result.message ?? "Field exists", result });
    }

    return res.status(201).json({
      tableCreated: result.tableCreated,
      tableName: result.tableName,
      field: result.field,
    });
  } catch (err) {
    next(err);
  }
}

export async function getFields(req, res, next) {
  try {
    const object = await resolveObjectFromParams(req.params);
    if (!object) return res.status(404).json({ message: "Object not found" });

    const rows = await fieldsService.listFieldsForObject(object);
    return res.json(rows);
  } catch (err) {
    next(err);
  }
}
