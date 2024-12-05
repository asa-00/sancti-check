import { Router } from 'express';
import * as unSanctionsController from '../controllers/unSanctionsController-old';

const router = Router();

// Route to get all sanctions
router.get('/', unSanctionsController.getAllSanctions);

// Route to check if a user is on the sanctions list
router.post('/check', unSanctionsController.checkSanctionedUser);

// Route to get sanctions details by ID
router.get('/:id', unSanctionsController.getSanctionById);

router.post("/load", unSanctionsController.loadUnConsolidated);

// Route to check for updates and update database
router.post("/check-updates", unSanctionsController.checkUnConsolidateFileUpdate);

export default router;
