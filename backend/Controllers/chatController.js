const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const UserProfile = require('../models/UserProfile');

// Helper to get conversations for the sidebar
exports.getConversations = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Conversation.find({
      participants: loggedInUserId,
    }).populate({
      path: 'participants',
      select: 'name email',
    });

    const fullConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p._id.toString() !== loggedInUserId.toString()
        );

        if (!otherParticipant) return null;

        const userProfile = await UserProfile.findOne({ userId: otherParticipant._id }).select('firstName lastName profilePhoto');
        
        // ✅ FIX: Correctly finds the last message from the conversation's message array
        const lastMessage = await Message.findOne({
          _id: { $in: conv.messages },
        }).sort({ createdAt: -1 });

        return {
          _id: conv._id,
          otherParticipant: {
            _id: otherParticipant._id,
            email: otherParticipant.email,
            firstName: userProfile?.firstName || otherParticipant.name,
            lastName: userProfile?.lastName || '',
            profilePhoto: userProfile?.profilePhoto,
          },
          lastMessage: {
            text: lastMessage?.message,
            createdAt: lastMessage?.createdAt,
          },
        };
      })
    );
    
    // Sort conversations to show the most recent ones first
    const sortedConversations = fullConversations
        .filter(c => c !== null)
        .sort((a, b) => (b.lastMessage.createdAt || 0) - (a.lastMessage.createdAt || 0));

    res.status(200).json(sortedConversations);

  } catch (error) {
    console.error('Error in getConversations:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};


// Get messages between two users (this function remains the same)
exports.getMessages = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    const messages = await Message.find({
      _id: { $in: conversation.messages }
    }).sort({ createdAt: 'asc' });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getMessages:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};