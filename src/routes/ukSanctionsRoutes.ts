import { Router } from "express";
import * as UKSanctionController from "../controllers/ukSanctionsController";

const router = Router();

router.post("/load", UKSanctionController.loadSanctions);
router.post("/search", UKSanctionController.searchSanctions);
router.post("/check-updates", UKSanctionController.checkUnConsolidateFileUpdate);

export default router;
