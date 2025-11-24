import * as repo from "./objectRecordRepository.js"
import * as fieldsService from "../fields/fieldsService.js";
import { tableExists } from "../fields/fieldRepository.js";



export async function listRecordsForObject(object, tableName) {
  if (!object) throw new Error("Object required");

  const exists = await tableExists(tableName);
  if (!exists) {
    return [];
  }
  const rows = await repo.listRecords(tableName);
  return rows;
}


export async function createRecordForObject(object, tableName, payload = {}) {
    if (!object) throw new Error("Object required");

    const exists = await tableExists(tableName);
    if (!exists) {
        throw new Error(" table does not exist for the object");
    }

    const cols = await repo.listColumns(tableName);
    if(!cols || cols.length===0){
        throw new Error("No columns found in the object table");
    }

    const protectedCols = new Set(["record_uuid", "record_id"]);
    const payloadFiltered = {};
    for (const key of Object.keys(payload)) {
        if (cols.includes(key) && !protectedCols.has(key)) { 
            payloadFiltered[key] = payload[key];
        }
    }

    if(Object.keys(payloadFiltered).length===0){
        throw new Error("No valid fields provided in the payload");
    }

    const inserted = await repo.insertRecord(tableName, payloadFiltered);
    return inserted;
} 



export async function deleteRecordForObject(object, tableName, recordUuid) {
 if (!object) throw new Error("Object required");

    const exists = await tableExists(tableName);
    if (!exists) {
        throw new Error(" table does not exist for the object");
    }
    
    const deleted = await repo.deleteRecord(tableName, recordUuid);
    if (!deleted) throw new Error("Record not found");
    return deleted;
}