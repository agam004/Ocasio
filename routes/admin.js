const express = require('express');
const router = express.Router();
const Events = require('../models/Events');  // Assuming you have an Event model
const adminAuth = require('../middleware/adminAuth');  // Middleware to check if the user is admin


router.use(express.urlencoded({ extended: true }));

// Show the "Create Event" form
router.get('/admin/create-event', adminAuth, (req, res) => {
    res.render('create-event');  // Render the form to create events
});

// Handle "Create Event" form submission
router.post('/admin/create-event', adminAuth, async (req, res) => {
    console.log(req.body); // Debugging
    const { title, description, date, imageUrl } = req.body;

    if (!title || !description || !date) {
        return res.status(400).send("All fields are required");
    }
     if (imageUrl = "") {
        imageUrl = '../images/event-default.jpg';
    }

    try {
        const newEvent = new Events({ title, description, date, imageUrl });
        await newEvent.save();
        res.redirect('/');
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
