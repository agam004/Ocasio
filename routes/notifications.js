const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Middleware to ensure the user is logged in
function isAuthenticated(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// Route to display notifications for the logged-in user
router.get('/notifications', isAuthenticated, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.session.user._id })
                                            .sort({ createdAt: -1 });
    res.render('notifications', { notifications, user: req.session.user });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).send('Error fetching notifications');
  }
});

// Route to mark a notification as read
router.post('/notifications/:id/read', isAuthenticated, async (req, res) => {
  const notificationId = req.params.id;
  try {
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.redirect('/notifications');
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).send('Error updating notification');
  }
});

// Route to clear all notifications for the logged-in user
router.post('/notifications/clear', isAuthenticated, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.session.user._id });
    res.redirect('/notifications');
  } catch (err) {
    console.error('Error clearing notifications:', err);
    res.status(500).send('Server error while clearing notifications');
  }
});

module.exports = router;
