const express = require('express');
const router = express.Router();
// const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.get('/signup', (req, res) => {
    res.render('signup'); // Assumes you have a views/login.ejs file
  });

// Signup POST route that stores the password as plain text
router.post('/signup', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }
    
    // Create new user with plain text password
    const newUser = new User({
      email,
      password,  // storing plain text password
      role: role || 'customer'
    });
    
    await newUser.save();
    res.redirect('/login');  // Redirect after successful signup
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
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).send('User not found');
      }
      
      // Direct comparison of plain text password
      if (password !== user.password) {
        return res.status(400).send('Invalid credentials');
      }
      
      // Check user type and redirect accordingly
      if (user.role === 'manager') {
        return res.redirect('/manager-dashboard');
      } else if (user.role === 'admin') {
        return res.redirect('/admin-dashboard');
      }
      
      // Default redirect for customer
      res.redirect('/');
      
    } catch (err) {
      console.error(err);
      res.status(500).send('Error logging in');
    }
  });
  
  module.exports = router;