const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const createNotification = require('../middleware/notification');
const checkUserBookingsAndNotifications = require('../middleware/bookingNotifications');
const Notification = require('../models/Notification');



router.get('/signup', (req, res) => {
  res.render('signup'); 
});

const ADMIN_PIN = '1234';  // Set a specific PIN for admin users

router.post('/signup', async (req, res) => {
  const { name, email, password, role, adminPin } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    // If role is admin, check if the admin PIN is correct
    if (role === 'admin' && adminPin !== ADMIN_PIN) {
      return res.status(400).send('Invalid Admin PIN');
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,  // Note: hashing is missing here
      role: role || 'customer',
      isApproved: role === 'admin' ? true : false
    });

    await newUser.save();

    // Create user profile
    const newProfile = new UserProfile({
      user: newUser._id,
      bio: '',
      profilePic: '../images/profile-default.png',
      phoneNumber: '',
      address: '',
      socialLinks: {
        facebook: '',
        instagram: ''
      }
    });

    await newProfile.save();
    await new Notification({
      user: newUser._id,
      message: '🎉 Welcome to Occasio!, Consider completing your profile. <a href="/profile">Click here</a>',
      type: 'system',
      isRead: false,
      timestamp: new Date()
    }).save();
    console.log('Notification saved');

    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
});

router.get('/login', (req, res) => {
  res.render('login'); // Assumes you have a views/login.ejs file
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User not found');
    }

    // Direct comparison for testing (Use hashed passwords in production)
    if (password !== user.password) {
      return res.status(400).send('Invalid credentials');
    }

    // Store full user object in session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    req.session.isLoggedIn = true;
    if (user.role === 'admin')
      req.session.isAdmin = true;

    console.log("User Logged In:", req.session.user);
    checkUserBookingsAndNotifications(user._id);
    const unreadCount = await Notification.countDocuments({ user: user._id, read: false });
    req.session.unreadNotificationsCount = unreadCount;
    res.locals.unreadNotificationsCount = unreadCount;

    res.redirect('/?refresh=true');
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).send('Error logging in');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.clearCookie('connect.sid');  
    res.redirect('/'); 
  });
});
module.exports = router;