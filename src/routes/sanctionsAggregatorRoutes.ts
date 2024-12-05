import express from 'express';
import * as sanctionsAggregatorController from "../controllers/sanctionAggregatorController"; 

const router = express.Router();



router.post('/search', sanctionsAggregatorController.searchSanctions);

export default router;
