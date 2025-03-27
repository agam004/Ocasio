// routes/events.js
const express = require('express');
const User = require('../models/User');
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
        // Only fetch upcoming events
        filter.date = { $gte: new Date() };

        const events = await Events.find(filter).populate('category');
        const categories = await EventCategory.find().sort({ name: 1 });

        let user = null;
        if (req.session.user) {
            user = await User.findById(req.session.user._id);
        }

        res.render('index', {
            events,
            categories,
            selectedCategory: req.query.category || null,
            user
        });
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).send('Error fetching events');
    }
});



// Route to show a specific event page when clicked
router.get('/event/:id', async (req, res) => {
    try {
        const event = await Events.findById(req.params.id).populate('organizer');
        console.log("Event Organizer:", event.organizer);
        console.log("Fetched Event:", event);
        if (!event) return res.status(404).send('Event not found');

        let userBooking = null;
        if (req.session.user) {
            userBooking = await Booking.findOne({ user: req.session.user._id, event: event._id });
        }
        let user = null;
        if (req.session.user) {
            user = await User.findById(req.session.user._id);
        }
        res.render('event', {
            event,
            user,
            userBooking
        });
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
router.get('/create-event', adminAuth.isAuthenticated, async (req, res) => {
    try {
        const categories = await EventCategory.find().sort({ name: 1 }); // Fetch categories
        res.render("create-event", { categories, user: req.session.user });
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).send("Error loading event creation page");
    }
});
router.post('/create-event', adminAuth, async (req, res) => {
    try {
        console.log("User in create event:", req.session.user);
        if (!req.session.user || req.session.user.role !== 'organizer') {
            return res.status(403).send('Unauthorized');
        }

        var { title, description, dateTime, imageUrl, capacity, price, location, category } = req.body;
        const localDate = new Date(dateTime);
        const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
        if (!title || !description || !dateTime || !capacity || !price || !location || !category) {
            return res.status(400).send("All fields are required");
        }
        if (!imageUrl) {
            imageUrl = '../images/event-default.jpg'; // Default image
        }
        const newEvent = new Events({
            title, description, date: utcDate, imageUrl, capacity, price, location, category,
            organizer: req.session.user._id // Assign event to the logged-in organizer
        });

        await newEvent.save();
        res.redirect('/my-events');
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).send('Error creating event');
    }
});
router.get('/my-events', async (req, res) => {
    try {
        if (req.session.user.role !== 'organizer') {
            return res.status(403).send('Access denied.');
        }

        // Find events where organizer field matches current user
        const events = await Events.find({ organizer: req.session.user._id }).populate('category');

        res.render('manage-events', { events, user: req.session.user });
    } catch (err) {
        console.error('Error fetching organizer events:', err);
        res.status(500).send('Server error');
    }
});
module.exports = router;