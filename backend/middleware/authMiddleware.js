require('dotenv').config(); // Load .env vars
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Your user auth schema

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
     const token = authorization.split(' ')[1];
  console.log("Received token:", token); // 👈 Add this
  const { _id } = jwt.verify(token, process.env.SECRET);

    req.user = await User.findById(_id).select('_id email');
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token verification failed' });
  }
};

module.exports = requireAuth;
