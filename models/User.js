const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'organizer', 'customer'], default: 'customer' }, // Add "organizer"
  isApproved: { type: Boolean, default: false } // Track if organizer is approved
});

module.exports = mongoose.model('User', UserSchema);
