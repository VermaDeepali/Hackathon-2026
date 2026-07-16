const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

/**
 * Handle new user registration.
 */
async function signup(req, res) {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'A user with this email address already exists.'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in DB
    const newUser = await userModel.createUser(username, email, hashedPassword);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, email: newUser.email },
      process.env.JWT_SECRET || 'super_secret_jwt_token_key_12345!',
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully.',
      data: {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        }
      }
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during signup.'
    });
  }
}

/**
 * Handle user login.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'super_secret_jwt_token_key_12345!',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during login.'
    });
  }
}

/**
 * Get authenticated user's profile details.
 */
async function getMe(req, res) {
  try {
    // req.user is set by the authenticateToken middleware
    const user = await userModel.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while retrieving user details.'
    });
  }
}

module.exports = {
  signup,
  login,
  getMe
};
