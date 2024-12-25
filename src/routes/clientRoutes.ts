import { Router } from 'express';
import { getAllClientsController, getClientController, createClientController, updateClientController, deleteClientController } from '../controllers/clientController';

const router = Router();

/**
 * @route GET /clients
 * @description Get all clients
 * @access Private
 */
router.get('/', getAllClientsController);

/**
 * @route GET /clients/:id
 * @description Get a client by ID
 * @access Private
 */
router.get('/:id', getClientController);

/**
 * @route POST /clients
 * @description Create a new client
 * @access Private
 */
router.post('/', createClientController);

/**
 * @route PUT /clients/:id
 * @description Update a client by ID
 * @access Private
 */
router.put('/:id', updateClientController);

/**
 * @route DELETE /clients/:id
 * @description Delete a client by ID
 * @access Private
 */
router.delete('/:id', deleteClientController);

export default router;
