import * as fieldsService from "./fieldsService.js";
import * as objectsService from "../objects/objectsService.js";

async function resolveObjectFromParams(params) {
  const paramVal = params.objectUuid ?? params.id;
  if (!paramVal) return null;
  try {
    return await objectsService.getObjectByUuid(paramVal);
  } catch (err) {}
  if (/^\d+$/.test(String(paramVal))) {
    try {
      return await objectsService.getObjectById(paramVal);
    } catch (err) {}
  }
  return null;
}

export async function createField(req, res, next) {
  try {
    const object = await resolveObjectFromParams(req.params);
    if (!object) return res.status(404).json({ message: "Object not found" });

    const tableName = object?.database_object;
    if (!tableName) {
      return res.status(400).json({ message: object });
    }

    const {
      field_name,
      field_label,
      field_description,
      field_type,
      field_order,
      max_length,
      default_value,
      markdown,
      min_value,
      max_value,
      allow_decimal,
      decimal_places,
    } = req.body;
    if (!field_name)
      return res.status(400).json({ message: "field_name required" });
    if (!field_label)
      return res.status(400).json({ message: "field_label required" });
    if (!field_type)
      return res.status(400).json({ message: "field_type required" });

    const result = await fieldsService.addFieldToObject(object, tableName, {
      field_name,
      field_label,
      field_description,
      field_type,
      field_order,
      created_by: req.user?.username ?? "system",
      max_length,
      default_value,
      markdown: !!markdown,
      min_value,
      max_value,
      allow_decimal: !!allow_decimal,
      decimal_places,
    });

    if (result.created === false) {
      return res
        .status(200)
        .json({ message: result.message ?? "Field exists", result });
    }

    return res.status(201).json(result);
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

export async function updateField(req, res, next) {
  try {
    const object = await resolveObjectFromParams(req.params);
    if (!object) return res.status(400).json({ message: "Object not found" });

    const tableName = object?.database_object;
    if (!tableName) {
      return res.status(400).json({ message: object });
    }
    const fieldUuid = req.params.fieldUuid;
    if (!fieldUuid)
      return res.status(400).json({ message: "fieldUuid param required" });

    const {
      name,
      label,
      description,
      field_type,
      field_order,
      max_length,
      default_value,
      markdown,
      min_value,
      max_value,
      allow_decimal,
      decimal_places,
    } = req.body;

    if (
      !name &&
      !label &&
      !description &&
      !field_type &&
      !field_order &&
      typeof max_length === "undefined" &&
      typeof default_value === "undefined" &&
      typeof markdown === "undefined" &&
      typeof min_value === "undefined" &&
      typeof max_value === "undefined" &&
      typeof allow_decimal === "undefined" &&
      typeof decimal_places === "undefined"
    ) {
      return res.status(400).json({ message: "No updatable fields provided" });
    }

    try {
      const result = await fieldsService.updateFieldForObject(
        object,
        tableName,
        fieldUuid,
        {
          name,
          label,
          description,
          field_type,
          field_order,
          max_length,
          default_value,
          markdown,
          min_value,
          max_value,
          allow_decimal,
          decimal_places,
        },
        req.user?.username ?? "system"
      );
      if (result.updated === false) {
        return res
          .status(200)
          .json({ message: result.message ?? "Not updated", result });
      }
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  } catch (err) {
    next(err);
  }
}

export async function deleteField(req, res, next) {
  try {
    const object = await resolveObjectFromParams(req.params);
    if (!object) return res.status(404).json({ message: "Object not found" });

    const tableName = object?.database_object;
    if (!tableName) {
      return res.status(400).json({ message: object });
    }
    const fieldUuid = req.params.fieldUuid;
    if (!fieldUuid)
      return res.status(404).json({ message: "fieldUuid not found" });

    const result = await fieldsService.deleteFieldForObject(
      object,
      tableName,
      fieldUuid
    );

    return res.status(204).end();
  } catch (err) {
    next(err);
  }
}
