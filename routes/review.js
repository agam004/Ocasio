const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Events');
const Review = require('../models/Review');
const { isAuthenticated } = require('../middleware/adminAuth');



// Render a form for leaving a review for a specific event
router.get('/review/:eventId', isAuthenticated, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).send('Event not found');
    res.render('review-form', { event, user: req.session.user });
  } catch (error) {
    console.error('Error fetching review form:', error);
    res.status(500).send('Error fetching review form');
  }
});

// Handle review submission
router.post('/review/:eventId', isAuthenticated, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    // Create and save a new review
    const newReview = new Review({
      user: req.session.user._id,
      event: req.params.eventId,
      rating,
      comment
    });
    await newReview.save();

    // Mark the booking as reviewed (if you want to track that)
    await Booking.findOneAndUpdate(
      { user: req.session.user._id, event: req.params.eventId },
      { reviewSubmitted: true }
    );

    res.redirect('/'); // or redirect to a confirmation page
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).send('Error saving review');
  }
});

module.exports = router;
