import express from "express";
import { getSubmissionAnalytics } from "../services/analyticsService.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/forms/:id/analytics", authenticateToken, async (req, res) => {
  try {
    const analytics = await getSubmissionAnalytics(req.params.id);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
