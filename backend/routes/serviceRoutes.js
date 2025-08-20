import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

const router = express.Router();

router.post("/api/services", authenticateToken, createService);
router.get("/api/services", authenticateToken, getServices);
router.get("/api/services/:id", authenticateToken, getService);
router.put("/api/services/:id", authenticateToken, updateService);
router.delete("/api/services/:id", authenticateToken, deleteService);

export default router;
