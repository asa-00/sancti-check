const express = require('express');
const router = express.Router();
const sanctionsController = require('../controllers/sanctionsController');

// Route to get all sanctions
router.get('/', sanctionsController.getAllSanctions);

// Route to check if a user is on the sanctions list
router.post('/check', sanctionsController.checkSanctionedUser);

// Route to get sanctions details by ID
router.get('/:id', sanctionsController.getSanctionById);

module.exports = router;
