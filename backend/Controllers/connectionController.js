const ConnectionRequest = require('../models/ConnectionRequest');
const Conversation = require('../models/Conversation');

exports.sendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ error: "Cannot connect with yourself." });
    }

    const existing = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existing) {
      return res.status(400).json({ error: "Connection request already exists or you are already connected." });
    }

    const newRequest = await ConnectionRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error sending connection request:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get requests where user is either sender or receiver
    const requests = await ConnectionRequest.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).populate('sender', 'email name').populate('receiver', 'email name');
    
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error getting connection requests:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const userId = req.user._id;

    const request = await ConnectionRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });

    // Only receiver can accept/reject
    if (request.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to respond to this request" });
    }

    request.status = status;
    await request.save();

    // If accepted, optionally create a conversation immediately
    if (status === 'accepted') {
      const existingConv = await Conversation.findOne({
        participants: { $all: [request.sender, request.receiver] }
      });
      if (!existingConv) {
        await Conversation.create({
          participants: [request.sender, request.receiver]
        });
      }
    }

    res.status(200).json(request);
  } catch (error) {
    console.error("Error responding to request:", error);
    res.status(500).json({ error: "Server error" });
  }
};
