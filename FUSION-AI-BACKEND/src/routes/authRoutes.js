const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middleware/validationMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * Route definitions for authentication endpoints.
 */

// POST /api/auth/signup - Register a new user
router.post('/signup', validateSignup, authController.signup);

// POST /api/auth/login - Log in an existing user
router.post('/login', validateLogin, authController.login);

// GET /api/auth/me - Retrieve current user profile (protected)
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
