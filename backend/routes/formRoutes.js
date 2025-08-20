import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  createForm,
  getForms,
  getForm,
  updateForm,
  deleteForm,
} from "../controllers/serviceController.js";

const router = express.Router();

router.post("/api/forms", authenticateToken, createForm);
router.get("/api/forms", authenticateToken, getForms);
router.get("/api/forms/:id", authenticateToken, getForm);
router.put("/api/forms/:id", authenticateToken, updateForm);
router.delete("/api/forms/:id", authenticateToken, deleteForm);

export default router;
