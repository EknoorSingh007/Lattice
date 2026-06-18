const express = require('express');
const router = express.Router();
const { getConversations, getMessages } = require('../Controllers/chatController');
const requireAuth = require('../middleware/authMiddleware');

router.use(requireAuth); // Protect all routes

router.get('/conversations', getConversations);
router.get('/messages/:id', getMessages);

module.exports = router;