const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  createOrUpdateProfile,
  getProfile,
  getUserProfile,
  getAllProfiles,
} = require('../Controllers/profileController');
const requireAuth = require('../middleware/authMiddleware');

// Set up multer (for handling profile photo uploads)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Apply auth middleware to all routes
router.use(requireAuth);

// --- ✅ ROUTE ORDER MATTERS ---

// 1. Get all profiles (excluding current user), with optional search/filter
router.get('/all', getAllProfiles);

// 2. Get current user's profile
router.get('/', getProfile);

// 3. Get any specific user's profile by userId
router.get('/:userId', getUserProfile);

// 4. Create or update profile (with optional image upload)
router.post('/', upload.single('profilePhoto'), createOrUpdateProfile);

module.exports = router;
