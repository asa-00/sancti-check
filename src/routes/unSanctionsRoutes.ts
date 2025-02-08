import { Router } from 'express';
import * as unSanctionsController from '../controllers/unSanctionsController';

const router = Router();

// Route to check if a user is on the sanctions list
router.post('/search', unSanctionsController.searchSanctions);

router.post("/load", unSanctionsController.loadUnConsolidated);

// Route to check for updates and update database
router.post("/check-updates", unSanctionsController.checkUnConsolidateFileUpdate);

export default router;
