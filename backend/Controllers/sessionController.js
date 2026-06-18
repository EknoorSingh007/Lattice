const Session = require('../models/Session');
const { v4: uuidv4 } = require('uuid');

exports.scheduleSession = async (req, res) => {
  const { senderId, receiverId, date, time } = req.body;

  try {
    const session = await Session.create({
      senderId,
      receiverId,
      date,
      time,
      roomId: uuidv4()
    });

    res.status(201).json(session);
  } catch (err) {
    console.error('Error scheduling session:', err);
    res.status(500).json({ message: 'Server error while scheduling session' });
  }
};

exports.getUserSessions = async (req, res) => {
  const userId = req.user._id;

  try {
    const sessions = await Session.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ date: 1, time: 1 });

    res.status(200).json(sessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ message: 'Server error while fetching sessions' });
  }
};
