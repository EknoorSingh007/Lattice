const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load .env vars

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

// ✅ LOGIN CONTROLLER
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    // Create a token
    const token = createToken(user._id);

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName, // Optional
        lastName: user.lastName,   // Optional
        profilePhoto: user.profilePhoto // Optional
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ SIGNUP CONTROLLER
const signupUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.signup(email, password);

    // Create a token
    const token = createToken(user._id);

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName || '', // Optional fallback
        lastName: user.lastName || '',
        profilePhoto: user.profilePhoto || ''
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { signupUser, loginUser };
