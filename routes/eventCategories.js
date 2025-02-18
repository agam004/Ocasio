// routes/eventCategories.js
const express = require('express');
const router = express.Router();
const EventCategory = require('../models/EventCategory');
const adminAuth = require('../middleware/adminAuth');

// List all categories
router.get('/admin/categories', adminAuth, async (req, res) => {
  try {
    const categories = await EventCategory.find().sort({ name: 1 });
    res.render('admin-categories', { categories, user: req.session.user });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).send('Error fetching categories');
  }
});

// Render form to add a new category
router.get('/admin/categories/new', adminAuth, (req, res) => {
  res.render('new-category', { user: req.session.user });
});

// Handle new category submission
router.post('/admin/categories', adminAuth, async (req, res) => {
  const { name, description } = req.body;
  try {
    const newCategory = new EventCategory({ name, description });
    await newCategory.save();
    res.redirect('/admin/categories');
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).send('Error creating category');
  }
});

// Render form to edit a category
router.get('/admin/categories/:id/edit', adminAuth, async (req, res) => {
  try {
    const category = await EventCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).send('Category not found');
    }
    res.render('edit-category', { category, user: req.session.user });
  } catch (err) {
    console.error('Error fetching category:', err);
    res.status(500).send('Error fetching category');
  }
});

// Handle category update
router.post('/admin/categories/:id', adminAuth, async (req, res) => {
  const { name, description } = req.body;
  try {
    await EventCategory.findByIdAndUpdate(req.params.id, { name, description });
    res.redirect('/admin/categories');
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).send('Error updating category');
  }
});

// Optionally, add route to delete a category
router.post('/admin/categories/:id/delete', adminAuth, async (req, res) => {
  try {
    await EventCategory.findByIdAndDelete(req.params.id);
    res.redirect('/admin/categories');
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).send('Error deleting category');
  }
});

module.exports = router;
