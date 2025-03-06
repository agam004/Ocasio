const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const { isAuthenticated } = require('../middleware/adminAuth');
const createNotification = require('../middleware/notification');

router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const userProfile = await UserProfile.findOne({ user: user._id });
    res.render('profile', { user, userProfile });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).send("Error fetching profile");
  }
});
router.post('/profile', isAuthenticated, async (req, res) => {
    const { name, email, password, bio, phoneNumber, address, facebook, instagram } = req.body;
    try {
      // Update basic user info
      const user = await User.findById(req.session.user._id);
      if (!user) return res.status(404).send("User not found");
  
      user.name = name || user.name;
      user.email = email || user.email;
      if (password && password.trim() !== "") {
        user.password = password;  // Consider hashing this in production!
      }
      await user.save();
  
      // Update or create the user's extended profile
      let userProfile = await UserProfile.findOne({ user: user._id });
      if (!userProfile) {
        userProfile = new UserProfile({ user: user._id });
      }
      userProfile.bio = bio || userProfile.bio;
      userProfile.phoneNumber = phoneNumber || userProfile.phoneNumber;
      userProfile.address = address || userProfile.address;
      userProfile.socialLinks.facebook = facebook || userProfile.socialLinks.facebook;
      userProfile.socialLinks.instagram = instagram || userProfile.socialLinks.instagram;
  
      await userProfile.save();
  
      // Optionally update the session
      req.session.user.name = user.name;
      req.session.user.email = user.email;
  
      res.redirect('/profile');
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).send("Error updating profile");
    }
  });
  router.post('/apply-organizer', isAuthenticated, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.session.user._id, { role: 'organizer', isApproved: false });
        res.redirect('/profile');
    } catch (err) {
        console.error('Error applying for organizer:', err);
        res.status(500).send('Error processing request');
    }
});

// Route for admin to approve organizers
router.post('/admin/approve-organizer/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isApproved: true });
        res.redirect('/admin/users');
    } catch (err) {
        console.error('Error approving organizer:', err);
        res.status(500).send('Error approving organizer');
    }
});
  module.exports = router;