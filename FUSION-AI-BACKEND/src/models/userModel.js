const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const User = mongoose.model('User', userSchema);

/**
 * Inserts a new user into the database.
 * @param {string} username
 * @param {string} email
 * @param {string} password (already hashed)
 * @returns {Promise<{id: string, username: string, email: string}>}
 */
async function createUser(username, email, password) {
  const user = await User.create({ username, email, password });
  return { id: user._id.toString(), username: user.username, email: user.email };
}

/**
 * Finds a user by their email address.
 * @param {string} email
 * @returns {Promise<object|null>} The user object including password hash if found.
 */
async function findUserByEmail(email) {
  const user = await User.findOne({ email });
  if (!user) return null;
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    password: user.password
  };
}

/**
 * Finds a user by their ID, returning safe details.
 * @param {string} id
 * @returns {Promise<object|null>} The user object without password hash.
 */
async function findUserById(id) {
  let user;
  try {
    user = await User.findById(id);
  } catch (error) {
    if (error.name === 'CastError') return null;
    throw error;
  }
  if (!user) return null;
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    created_at: user.created_at
  };
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};
