import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createSchema,
  deleteSchema,
  updateSchema,
  viewSchema,
  viewSchemas,
} from "../controllers/scheduleSchema.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", viewSchemas);

router.post("/", createSchema);

router.get("/:id", viewSchema);

router.put("/:id", updateSchema);

router.delete("/:id", deleteSchema);

export default router;
