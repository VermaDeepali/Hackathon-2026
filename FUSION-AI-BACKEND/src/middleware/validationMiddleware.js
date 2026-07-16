/**
 * Simple email validation regex helper.
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Middleware to validate the signup request body.
 */
function validateSignup(req, res, next) {
  const { username, email, password } = req.body;
  const errors = {};

  if (!username || typeof username !== 'string' || username.trim() === '') {
    errors.username = 'Username is required and cannot be empty.';
  }

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    errors.email = 'A valid email address is required.';
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.password = 'Password is required and must be at least 6 characters long.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize
  req.body.username = username.trim();
  req.body.email = email.trim().toLowerCase();

  next();
}

/**
 * Middleware to validate the login request body.
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = {};

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    errors.email = 'A valid email address is required.';
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize
  req.body.email = email.trim().toLowerCase();

  next();
}

module.exports = {
  validateSignup,
  validateLogin
};
