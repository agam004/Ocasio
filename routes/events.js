// routes/events.js
const express = require('express');
const router = express.Router();
const Events = require('../models/Events');
const Booking = require('../models/Booking');
const EventCategory = require('../models/EventCategory');

// Route to display all events on the homepage
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    // Only fetch events that are held in the future (upcoming events)
    filter.date = { $gte: new Date() };

    const events = await Events.find(filter).populate('category');
    const categories = await EventCategory.find().sort({ name: 1 });
    res.render('index', { 
      events, 
      categories, 
      selectedCategory: req.query.category, 
      user: req.session.user || null 
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).send('Error fetching events');
  }
});



// Route to show a specific event page when clicked
router.get('/event/:id', async (req, res) => {
    const eventId = req.params.id;
    const userId = req.session.user ? req.session.user._id : null;

    try {
        const event = await Events.findById(eventId);
        if (!event) return res.status(404).send('Event not found');

        let userBooking = null;
        if (userId) {
            userBooking = await Booking.findOne({ user: userId, event: eventId });
        }

        res.render('event', { event, user: req.session.user || null, userBooking });
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).send('Error fetching event');
    }
});

module.exports = router;