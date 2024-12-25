import { Router } from 'express';
import { updateHighQualityResult, getAllHighQualityResults } from '../controllers/highQualityResultController'

const router = Router();

/**
 * @route GET /high-quality-results
 * @description Get all HighQualityResults
 * @access Private
 */
router.get('/', getAllHighQualityResults);

/**
 * @route PUT /high-quality-results/:id
 * @description Update a HighQualityResult
 * @access Private
 */
router.put('/:id', updateHighQualityResult);

export default router;