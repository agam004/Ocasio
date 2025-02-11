// routes/events.js
const express = require('express');
const router = express.Router();
const Events = require('../models/Events');

// Route to display all events on the homepage
router.get('/', async (req, res) => {
    try {
        const events = await Events.find();  // Fetch all events from database
        res.render('index', { events, user: req.session.user || null }); // Pass user session
        console.log('Session Data on Home Page:', req.session.user);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).send('Error fetching events');
    }
});


// Route to show a specific event page when clicked
router.get('/event/:id', async (req, res) => {
    const eventId = req.params.id;
    try {
        const event = await Events.findById(eventId);  // Fetch event by ID
        if (!event) {
            return res.status(404).send('Event not found');
        }
        res.render('event', { event });  // Render event.ejs and pass the event data
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).send('Error fetching event');
    }
});

module.exports = router;