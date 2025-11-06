import { AppError } from "../../middleware/errorHandler.js";
import * as objectApi from "./objectsApi.js";

export async function getObjectByUuid(id) {
  const object = await objectApi.getObjectByUuid(id);
  if (!object) throw new AppError("Object not found",400);
  return object;
}

export async function getObjectById(id) {
  const object = await objectApi.getObjectById(id);
  if (!object) throw new AppError("Object not found",400);
  return object;
}

export async function getObjectByName(name) {
  const object = await objectApi.getObjectByName(name);
  if (!object) throw new AppError("Object not found",400);
  return object;
}
export async function getAllObjects() {
  const objects = await objectApi.getAllObjects();
  return objects;
}

export async function createObject(data) {
  if (!data || !data.name) throw new AppError("Enter the name of a object",400);

  // check existance by name (case-insensitive)
  const existing = await objectApi.getObjectByName(data.name);
  if (existing) {
    return { created: false, existing };
  }
  const object = await objectApi.createObject({
    name: data.name,
    description: data.description ?? null,
  });
  return { created: true, object };
}

export async function updateObject(object_uuid, data) {
  const object = await objectApi.updateObject(object_uuid, data);
  if (!object) throw new AppError("Object not found",400);
  return object;
}

export async function deleteObject(object_uuid) {
  const deleted = await objectApi.deleteObject(object_uuid);
  if (!deleted) throw new AppError("Object not found",400);
  return deleted;
}
