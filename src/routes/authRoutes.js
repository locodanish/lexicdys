const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define the routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;