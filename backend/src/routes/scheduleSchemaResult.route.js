import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createResult,
  deleteResult,
  detailedResult,
  viewResults,
} from "../controllers/scheduleSchemaResult.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", viewResults);

router.post("/:schemaId/run", createResult);

router.get("/:id", detailedResult);

router.delete("/:id", deleteResult);

export default router;
