import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createResource,
  deletedResource,
  viewResource,
  viewResources,
} from "../controllers/resource.controller.js";

const router = express.Router();
router.use(protectRoute);

router.get("/", viewResources);

router.post("/", createResource);

router.get("/:id", viewResource);

router.delete("/:id", deletedResource);

export default router;
