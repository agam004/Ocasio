const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // Storing plain text password (not recommended)
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'customer'],
    default: 'customer'
  }
});

module.exports = mongoose.model('User', UserSchema);
