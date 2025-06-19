import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createConflict,
  deleteConflict,
  viewConflicts,
} from "../controllers/conflict.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", viewConflicts);
router.post("/", createConflict);
router.delete("/:id", deleteConflict);

export default router;
