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
    let { title, description, date, imageUrl } = req.body;

    if (!title || !description || !date) {
        return res.status(400).send("All fields are required");
    }
    if (!imageUrl) {  // ✅ Checks if imageUrl is empty or undefined
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


router.get('/admin/manage-events', adminAuth, async (req, res) => {
    try {
      const events = await Events.find();  // Fetch all events
      res.render('manage-events', { events });  // Render manage-events.ejs and pass events data
    } catch (err) {
      console.error('Error fetching events:', err);
      res.status(500).send('Error fetching events');
    }
  });
  
  // Route to select an event to edit (GET)
  router.get('/admin/manage-event/:id', adminAuth , async (req, res) => {
    const eventId = req.params.id;
    try {
      const event = await Events.findById(eventId);  // Fetch the event by ID
      if (!event) {
        return res.status(404).send('Event not found');
      }
      res.render('edit-event', { event });  // Render edit-event.ejs with event data for editing
    } catch (err) {
      console.error('Error fetching event:', err);
      res.status(500).send('Error fetching event');
    }
  });
  
  // Route for updating an event (POST)
  router.post('/admin/manage-event/:id', async (req, res) => {
    const eventId = req.params.id;
    const { title, description, date, imageUrl } = req.body;
  
    try {
      const event = await Events.findById(eventId);
      if (!event) {
        return res.status(404).send('Event not found');
      }
  
      // Update event fields
      event.title = title || event.title;
      event.description = description || event.description;
      event.date = date || event.date;
      event.imageUrl = imageUrl || event.imageUrl;
  
      await event.save();
      res.redirect('/admin/manage-events');  // Redirect back to manage events page
    } catch (err) {
      console.error('Error updating event:', err);
      res.status(500).send('Error updating event');
    }
  });
  
module.exports = router;
