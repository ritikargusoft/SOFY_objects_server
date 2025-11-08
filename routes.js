import express from "express";
import objectsIndex from "./features/objects/objectsApi.js";
const router = express.Router();

router.use("/objects", objectsIndex);

export default router;
