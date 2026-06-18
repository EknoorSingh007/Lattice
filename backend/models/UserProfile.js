const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  available: { type: Boolean, default: false, required: true },
  times: { type: [String], required: true }, // e.g., ["9:00 AM to 10:00 AM"]
});

const UserProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  bio: { type: String, required: true },
  location: { type: String, required: true },
   useGPS: Boolean,

  profilePhoto: String,

  skillsToTeach: { type: [String], required: true },
  skillsToLearn: { type: [String], required: true },

   availability: {
    monday: AvailabilitySchema,
    tuesday: AvailabilitySchema,
    wednesday: AvailabilitySchema,
    thursday: AvailabilitySchema,
    friday: AvailabilitySchema,
    saturday: AvailabilitySchema,
    sunday: AvailabilitySchema,
  }
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', UserProfileSchema);
