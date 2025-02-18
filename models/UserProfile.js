// models/UserProfile.js
const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bio: { type: String },
  profilePic: { type: String, default: '/images/default-profile.png' },
  socialLinks: {
    twitter: { type: String },
    facebook: { type: String },
    instagram: { type: String }
  }
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
