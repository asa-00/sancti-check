import express from "express";
import { loadSanctions, searchSanctions, checkForUpdates } from "../controllers/euSanctionsController";
import { authorizeRole } from "../middleware/authorizeRole";

const router = express.Router();

router.post("/load", authorizeRole("admin"), loadSanctions);
router.post("/search", searchSanctions);
router.get("/check-updates", checkForUpdates);

export default router;
