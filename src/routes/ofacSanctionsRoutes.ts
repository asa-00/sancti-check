import { Router } from "express";
import * as ofacSanctionsController from "../controllers/ofacSanctionsController"; // Import controller methods

const router = Router();

// Route to search sanctions (POST request for search with params)
router.post("/search", ofacSanctionsController.searchSanctions);

// Route to check the health of the OFAC API (GET request)
router.get("/health", ofacSanctionsController.checkHealth);

router.post("/load", ofacSanctionsController.loadSDN);

// Route to check for updates and update database
router.post("/check-updates", ofacSanctionsController.checkSDNFileUpdate);

export default router;
