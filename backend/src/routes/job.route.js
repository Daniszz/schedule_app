import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createJob,
  deleteJob,
  updateJob,
  viewJob,
  viewJobs,
  deleteJobs,
  updateJobPosition,
} from "../controllers/job.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", viewJobs);

router.post("/", createJob);

router.get("/:id", viewJob);

router.put("/:id", updateJob);

router.delete("/:id", deleteJob);

router.delete("/", deleteJobs);

router.put("/:id/position", updateJobPosition);

export default router;
