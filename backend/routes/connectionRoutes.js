const express = require('express');
const router = express.Router();
const { sendRequest, getRequests, respondToRequest } = require('../Controllers/connectionController');
const requireAuth = require('../middleware/authMiddleware');

router.use(requireAuth);

router.post('/', sendRequest);
router.get('/', getRequests);
router.put('/:requestId', respondToRequest);

module.exports = router;
