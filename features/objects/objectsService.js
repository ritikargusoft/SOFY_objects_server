import { AppError } from "../../middleware/errorHandler.js";
import * as objectRepository from "./objectsRepository.js";

export async function getObjectByUuid(id) {
  const object = await objectRepository.getObjectByUuid(id);
  if (!object) throw new AppError("Object not found", 404);
  return object;
}

export async function getObjectById(id) {
  const object = await objectRepository.getObjectById(id);
  if (!object) throw new AppError("Object not found", 404);
  return object;
}

export async function getObjectByName(name) {
  if (!name) throw new AppError("Missing name", 400);
  const object = await objectRepository.getObjectByName(name);
  return object;
}

export async function getAllObjects() {
  const objects = await objectRepository.getAllObjects();
  return objects;
}

export async function createObject(data) {
  if (!data || !data.name)
    throw new AppError("Enter the name of an object", 400);

  const name = data.name;
  const description = data.description ?? null;

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

// 🔹 UPDATED: smarter update with duplicate-name check & `updated` flag
export async function updateObject(object_uuid, data) {
  if (!object_uuid) throw new AppError("Missing object identifier", 400);
  if (!data) throw new AppError("Missing update payload", 400);

  const current = await objectRepository.getObjectByUuid(object_uuid);
  if (!current) throw new AppError("Object not found", 404);

  const name = data.name ?? null;
  const description = data.description ?? null;

  if (!name && description === null) {
    return {
      updated: false,
      message: "No updatable fields provided",
      object: current,
    };
  }

  if (name && name !== current.name) {
    const exists = await objectRepository.objectNameExistsExcept(
      name,
      object_uuid
    );
    if (exists) {
      return {
        updated: false,
        message: "Object name already exists",
      };
    }
  }

  const object = await objectRepository.updateObject(object_uuid, {
    name,
    description,
  });

  if (!object) throw new AppError("Object not found", 404);

  return {
    updated: true,
    object,
  };
}

export async function deleteObject(object_uuid) {
  if (!object_uuid) throw new AppError("Missing object identifier", 400);

  const deleted = await objectRepository.deleteObject(object_uuid);
  if (!deleted) throw new AppError("Object not found", 404);
  return deleted;
}
