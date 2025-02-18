const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Events = require('../models/Events');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');  // Admin authentication middleware

router.use(express.urlencoded({ extended: true }));

// Show the "Create Event" form
router.get('/admin/create-event', adminAuth, (req, res) => {
    res.render('create-event');  
});

// Handle "Create Event" form submission
router.post('/admin/create-event', adminAuth, async (req, res) => {
    console.log(req.body); // Debugging

    let { title, description, dateTime, imageUrl, capacity, price, location } = req.body;

    // Validation check
    if (!title || !description || !dateTime || !capacity || !price || !location) {
        return res.status(400).send("All fields are required");
    }
    if (!imageUrl) {  
        imageUrl = '../images/event-default.jpg'; // Default image
    }

    try {
        const localDate = new Date(dateTime);
        const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

        const newEvent = new Events({ 
            title, description, date:utcDate, imageUrl, 
            capacity, price, location, 
            booked: 0  // New event starts with zero bookings
        });

        await newEvent.save();
        res.redirect('/admin/manage-events');
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).send('Server Error');
    }
});

// Manage all events (GET)
router.get('/admin/manage-events', adminAuth, async (req, res) => {
    try {
        const events = await Events.find();  
        res.render('manage-events', { events });  
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).send('Error fetching events');
    }
});

// Get event details for editing (GET)
router.get('/admin/manage-event/:id', adminAuth, async (req, res) => {
    const eventId = req.params.id;
    try {
      const event = await Events.findById(eventId);
      if (!event) {
        return res.status(404).send('Event not found');
      }
      res.render('edit-event', { event });
    } catch (err) {
      console.error('Error fetching event:', err);
      res.status(500).send('Error fetching event');
    }
  });
  
// Update or delete event details (POST)
router.post('/admin/manage-event/:id', adminAuth, async (req, res) => {
    const eventId = req.params.id;
    
    // Check if the _method field is set to DELETE
    if (req.body._method && req.body._method.toUpperCase() === 'DELETE') {
        try {
            await Events.findByIdAndDelete(eventId);
            return res.redirect('/admin/manage-events');
        } catch (err) {
            console.error('Error deleting event:', err);
            return res.status(500).send('Error deleting event');
        }
    }
    
    // Otherwise, treat it as an update request
    const { title, description, dateTime, imageUrl, capacity, price, location } = req.body;
    try {
        const event = await Events.findById(eventId);
        if (!event) {
            return res.status(404).send('Event not found');
        }
        const newdate = new Date(dateTime);
        const utcDate = new Date(newdate.getTime() - newdate.getTimezoneOffset() * 60000);
        // Update fields
        event.title = title || event.title;
        event.description = description || event.description;
        event.date = utcDate || event.date;
        event.imageUrl = imageUrl || event.imageUrl;
        event.capacity = capacity || event.capacity;
        event.price = price || event.price;
        event.location = location || event.location;
        await event.save();
        res.redirect('/admin/manage-events');  
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).send('Error updating event');
    }
});
router.get('/admin/bookings', adminAuth, async (req, res) => {
    try {
      const bookings = await Booking.find()
        .populate('event')
        .populate('user');  // Fetch user details as well
  
      res.render('admin-bookings', { bookings, user: req.session.user });
    } catch (err) {
      console.error('Error fetching bookings:', err);
      res.status(500).send('Error fetching bookings');
    }
  });

  // Cancel booking on behalf of a user (admin-only)
router.post('/admin/bookings/:bookingId/cancel', adminAuth, async (req, res) => {
    const { bookingId } = req.params;
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).send('Booking not found');
      }
      
      // Update event booked count accordingly
      const event = await Event.findById(booking.event);
      if (event) {
        event.booked = Math.max(0, event.booked - booking.numTickets);
        await event.save();
      }
  
      await Booking.findByIdAndDelete(bookingId);
      res.redirect('/admin/bookings');
    } catch (error) {
      console.error('Error canceling booking:', error);
      res.status(500).send('Error canceling booking');
    }
  });
  

module.exports = router;
