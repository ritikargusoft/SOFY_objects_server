import { AppError } from "../../middleware/errorHandler.js";
import * as objectRepository from "./objectsRepository.js";

export async function getObjectByUuid(id) {
  const object = await objectRepository.getObjectByUuid(id);
  if (!object) throw new AppError("Object not found", 400);
  return object;
}

export async function getObjectById(id) {
  const object = await objectRepository.getObjectById(id);
  if (!object) throw new AppError("Object not found", 400);
  return object;
}

export async function getObjectByName(name) {
  const object = await objectRepository.getObjectByName(name);
  if (!object) throw new AppError("Object not found", 400);
  return object;
}

export async function getAllObjects() {
  const objects = await objectRepository.getAllObjects();
  return objects;
}

export async function createObject(data) {
  if (!data || !data.name) throw new AppError("Enter the name of a object", 400);


  const existing = await objectRepository.getObjectByName(name);
  if (existing) {
    return { created: false, existing };
  }

  const object = await objectRepository.createObject({
    name,
    description,
  });

  return { created: true, object };
}

export async function updateObject(object_uuid, data) {
  if (!object_uuid) throw new AppError("Missing object identifier", 400);


  const object = await objectRepository.updateObject(object_uuid, payload);
  if (!object) throw new AppError("Object not found", 400);
  return object;
}

export async function deleteObject(object_uuid) {
  const deleted = await objectRepository.deleteObject(object_uuid);
  if (!deleted) throw new AppError("Object not found", 400);
  return deleted;
}
