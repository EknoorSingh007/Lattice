const UserProfile = require('../models/UserProfile');

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const profileData = req.body;

    // Handle uploaded file if exists
    if (req.file) {
      // Convert buffer to base64 string to store directly in MongoDB (or use Cloudinary)
      profileData.profilePhoto = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const updated = await UserProfile.findOneAndUpdate(
      { userId },
      { ...profileData, userId },
      { new: true, upsert: true }
    );

    res.status(200).json(updated);
   await User.findByIdAndUpdate(req.body.userId, { profileComplete: true });
  } catch (error) {
    console.error("❌ Profile save error:", error);
    res.status(500).json({ error: error.message || 'Server error while saving profile.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await UserProfile.findOne({ userId });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.status(200).json(profile);
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Server error fetching profile.' });
  }
};

// New function to get any user's profile by userId
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error fetching user profile.' });
  }
};
// const UserProfile = require('../models/UserProfile');

// ... (keep createOrUpdateProfile and getProfile)

// NEW: Get all profiles with search and filter capabilities
exports.getAllProfiles = async (req, res) => {
    try {
        // Build the query object based on request query params
        const query = { userId: { $ne: req.user._id } }; // Exclude the current user

        const { search, skill } = req.query;

        if (search) {
            // Case-insensitive search on multiple fields
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { skillsToTeach: { $regex: search, $options: 'i' } },
                { skillsToLearn: { $regex: search, $options: 'i' } }
            ];
        }

        if (skill) {
            // Filter by a specific skill in either teaching or learning arrays
            query.$or = [
                ...(query.$or || []), // Keep existing search conditions if they exist
                { skillsToTeach: skill },
                { skillsToLearn: skill }
            ];
        }

        const profiles = await UserProfile.find(query).lean();
        res.status(200).json(profiles);

    } catch (error) {
        console.error('Fetch all profiles error:', error);
        res.status(500).json({ error: 'Server error fetching all profiles.' });
    }
};