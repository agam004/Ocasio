const Notification = require('../models/Notification');

function createNotification(userId, message, type = 'system') {
  const newNotification = new Notification({
    user: userId,
    message,
    type,
    read: false
  });
  newNotification.save().catch(err => console.error('Error saving notification:', err));
}

module.exports = createNotification;