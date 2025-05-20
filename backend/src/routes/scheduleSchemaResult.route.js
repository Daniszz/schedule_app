import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createResult,
  deletedResult,
  detailedResult,
  viewResult,
  viewResults,
} from "../controllers/scheduleSchemaResult.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", viewResults);

router.get("/schema/:schemaId", viewResult);

router.post("/:schemaId/run", createResult);

// GET /results/:id - Detalii rezultat specific
router.get("/:id", detailedResult);

router.delete("/:id", deletedResult);

export default router;
