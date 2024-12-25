import { Router } from 'express';
import { getAllUsersController, getUserController, updateUserController, deleteUserController } from '../controllers/userController';
import { authenticateToken } from '../services/tokenService';
import { authorizeRole } from '../middleware/authorizeRole';

const router = Router();

/**
 * @route GET /users
 * @description Get all users
 * @access Private (Admin only)
 */
router.get('/', authorizeRole('admin'), getAllUsersController);

/**
 * @route GET /users/:id
 * @description Get a user by ID
 * @access Private
 */
router.get('/:id', getUserController);

/**
 * @route PUT /users/:id
 * @description Update a user by ID
 * @access Private
 */
router.put('/:id', updateUserController);

/**
 * @route DELETE /users/:id
 * @description Delete a user by ID
 * @access Private (Admin only)
 */
router.delete('/:id', authorizeRole('admin'), deleteUserController);

export default router;
