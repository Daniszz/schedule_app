import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createJob,
  deleteJob,
  updateJob,
  viewJob,
  viewJobs,
} from "../controllers/job.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", viewJobs);

router.post("/", createJob);

router.get("/:id", viewJob);

router.put("/:id", updateJob);

router.delete("/:id", deleteJob);

export default router;
