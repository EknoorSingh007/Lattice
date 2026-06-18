const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const requireAuth = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
router.use(requireAuth);

// Create a new session
router.post('/create', async (req, res) => {
  const { user1, user2, dateTime, roomId } = req.body;
    console.log("📥 Incoming session data:", { user1, user2, dateTime, roomId });

  if (!user1 || !user2 || !dateTime || !roomId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const session = await Session.create({ user1, user2, dateTime, roomId });
     console.log("✅ Session created:", session);
    res.status(201).json(session);
  } catch (err) {
      console.error("❌ Session creation error:", err);
    res.status(500).json({ error: 'Failed to create session', details: err.message });
  }
});

// Get all sessions for a user
const UserProfile = require('../models/UserProfile');

router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const sessions = await Session.find({
      $or: [{ user1: userId }, { user2: userId }]
    }).sort({ dateTime: 1 });

    // Collect all user IDs to populate
    const userIds = Array.from(new Set(
      sessions.flatMap(s => [s.user1.toString(), s.user2.toString()])
    ));

    
const objectIds = userIds.map(id => new mongoose.Types.ObjectId(id));

const profiles = await UserProfile.find({ userId: { $in: objectIds } }).lean();

      

    const profileMap = {};
    for (const profile of profiles) {
      profileMap[profile.userId.toString()] = profile;
    }

    // Attach profile info to each session
    const enrichedSessions = sessions.map(session => ({
      ...session.toObject(),
      user1: {
        _id: session.user1,
        profile: profileMap[session.user1.toString()] || null
      },
      user2: {
        _id: session.user2,
        profile: profileMap[session.user2.toString()] || null
      }
    }));

    res.status(200).json(enrichedSessions);

  } catch (err) {
    console.error("Failed to fetch sessions:", err);
    res.status(500).json({ error: 'Failed to fetch sessions', details: err.message });
  }
});
// DELETE /api/session/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const currentUserId = req.user._id.toString();
    if (
      session.user1.toString() !== currentUserId &&
      session.user2.toString() !== currentUserId
    ) {
      return res.status(403).json({ message: "Unauthorized to delete this session" });
    }

    await Session.findByIdAndDelete(id);
    res.status(200).json({ message: "Session deleted" });

  } catch (err) {
    console.error("Error deleting session:", err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
