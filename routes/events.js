// routes/events.js
const express = require('express');
const router = express.Router();
const Events = require('../models/Events');
const Booking = require('../models/Booking');
const EventCategory = require('../models/EventCategory');
const Review = require('../models/Review');
const adminAuth = require('../middleware/adminAuth');

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

router.get('/past-event/:id', adminAuth, async (req, res) => {
  try {
      const eventId = req.params.id;
      const event = await Events.findById(eventId);
      const reviews = await Review.find({ event: eventId }).populate('user', 'name');
      const attendees = await Booking.find({ event: eventId }).populate('user', 'name');

      if (!event) {
          return res.status(404).send('Event not found');
      }

      res.render('past-event-details', { event, reviews, attendees, user: req.session.user });
  } catch (err) {
      console.error('Error fetching past event details:', err);
      res.status(500).send('Server error');
  }
});
router.post('/create-event', async (req, res) => {
  try {
      if (!req.session.user || req.session.user.role !== 'organizer' || !req.session.user.isApproved) {
          return res.status(403).send('Unauthorized');
      }

      const { title, description, dateTime, imageUrl, capacity, price, location, category } = req.body;
      const newEvent = new Events({
          title, description, date: dateTime, imageUrl, capacity, price, location, category,
          organizer: req.session.user._id // Assign event to the logged-in organizer
      });

      await newEvent.save();
      res.redirect('/my-events');
  } catch (err) {
      console.error('Error creating event:', err);
      res.status(500).send('Error creating event');
  }
});

module.exports = router;