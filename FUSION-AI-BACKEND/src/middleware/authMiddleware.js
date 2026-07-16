const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes that require authentication.
 * Checks for Bearer JWT token in Authorization header.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  // Check if header exists and has the correct Bearer prefix
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_token_key_12345!');
    
    // Attach decoded user info payload to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username
    };
    
    next();
  } catch (error) {
    let message = 'Invalid authentication token.';
    if (error.name === 'TokenExpiredError') {
      message = 'Authentication token has expired. Please log in again.';
    }
    
    return res.status(401).json({
      status: 'error',
      message
    });
  }
}

module.exports = {
  authenticateToken
};
