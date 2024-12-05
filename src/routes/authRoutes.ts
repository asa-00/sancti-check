import { Request, Response, NextFunction } from 'express';
const express = require('express');
const router = express.Router();
import * as authController from '../controllers/authController';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';

router.post('/login', authController.login);
router.post('/register', authController.register);

export default router;
