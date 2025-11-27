import * as objectsService from "./objectsService.js";

export async function getObjectByUuid(req, res, next) {
  try {
    const object = await objectsService.getObjectByUuid(req.params.id);
    if (!object) return res.status(404).json({ message: "object not found" });
    res.json(object);
  } catch (err) {
    next(err);
  }
}

export async function getObjectById(req, res, next) {
  try {
    const object = await objectsService.getObjectById(req.params.id);
    if (!object) return res.status(404).json({ message: "object not found" });
    res.json(object);
  } catch (err) {
    next(err);
  }
}

export async function getAllObjects(req, res, next) {
  try {
    const objects = await objectsService.getAllObjects();
    return res.json(objects);
  } catch (err) {
    next(err);
  }
}

export async function createObject(req, res, next) {
  try {
    const payload = req.body;
    const result = await objectsService.createObject(payload);
    if (result.created === false) {
      return res
        .status(200)
        .json({ message: "Object already exists", object: result.existing });
    }
    return res.status(201).json(result.object);
  } catch (err) {
    next(err);
  }
}

export async function updateObject(req, res, next) {
  try {
    const result = await objectsService.updateObject(req.params.id, req.body);

    if (result.updated === false) {
      return res.status(200).json({
        message: result.message ?? "Not updated",
        result,
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteObject(req, res, next) {
  try {
    await objectsService.deleteObject(req.params.id);
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
}
