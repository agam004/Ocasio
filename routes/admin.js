const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Events = require('../models/Events');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');  
const EventCategory = require('../models/EventCategory');
const createNotification = require('../middleware/notification');
const Review = require('../models/Review');
router.use(express.urlencoded({ extended: true }));



// Show the "Create Event" form
router.get('/admin/create-event', adminAuth, async (req, res) => {
  try {
    const categories = await EventCategory.find().sort({ name: 1 });
    res.render('create-event', { categories, user: req.session.user });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).send('Error fetching categories');
  }
});

// Handle "Create Event" form submission
router.post('/admin/create-event', adminAuth, async (req, res) => {
  console.log(req.body); // Debugging

  let { title, description, dateTime, imageUrl, capacity, price, location, category } = req.body;

  // Validation check
  if (!title || !description || !dateTime || !capacity || !price || !location || !category) {
      return res.status(400).send("All fields are required");
  }
  if (!imageUrl) {  
      imageUrl = '../images/event-default.jpg'; // Default image
  }

  try {
      // Convert local date/time to UTC
      const localDate = new Date(dateTime);
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

      const newEvent = new Events({ 
          title, 
          description, 
          date: utcDate, 
          imageUrl, 
          capacity, 
          price, 
          location,
          category, // Save the selected category
          booked: 0  // New event starts with zero bookings
      });

      await newEvent.save();
      createNotification(req.session.user._id,newEvent.title + " Event Created!", "system");
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
  try {
      const event = await Events.findById(req.params.id);
      const categories = await EventCategory.find().sort({ name: 1 });

      if (!event) {
          return res.status(404).send('Event not found');
      }

      res.render('edit-event', { event, categories });
  } catch (err) {
      console.error('Error fetching event:', err);
      res.status(500).send('Error fetching event');
  }
});

// Route to update the event details
router.post('/admin/manage-event/:id', adminAuth, async (req, res) => {
  const { title, description, dateTime, imageUrl, capacity, price, location, category } = req.body;
  
  try {
      const event = await Events.findById(req.params.id);
      if (!event) {
          return res.status(404).send('Event not found');
      }

      // Convert date to UTC
      const localDate = new Date(dateTime);
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

      // Update event details
      event.title = title;
      event.description = description;
      event.date = utcDate;
      event.imageUrl = imageUrl;
      event.capacity = capacity;
      event.price = price;
      event.location = location;
      event.category = category;

      createNotification(req.session.user._id,event.title + " Event Updated!", "system");
      await event.save();
      res.redirect('/');
        
  } catch (err) {
      console.error('Error updating event:', err);
      res.status(500).send('Error updating event');
  }
});
router.get('/admin/bookings', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
    .populate({
        path: 'user',
        select: 'name email' // Ensure we retrieve the email
    })
    .populate('event');

      // Format data for rendering
      const formattedBookings = bookings.map(booking => {
          const eventDate = new Date(booking.event.date);
          const now = new Date();
          const isPastEvent = eventDate < now; // Check if event is in the past

          return {
              _id: booking._id, 
                user: booking.user ? { name: booking.user.name, email: booking.user.email } : { name: 'N/A', email: null },
                event: booking.event ? {
                  title: booking.event.title,
                  date: booking.event.date,
                  price: booking.event.price,
                  eventId: booking.event._id
              } : { title: 'N/A', date: null, price: 0 },
              numTickets: booking.numTickets,
              totalCost: ((booking.numTickets * booking.event.price * 1.13) + (booking.numTickets * 2)).toFixed(2),
              isPastEvent // Add past event status
          };
      });

      res.render('admin-bookings', { bookings: formattedBookings, user: req.session.user });
  } catch (err) {
      console.error('Error fetching bookings:', err);
      res.status(500).send('Error fetching bookings');
  }
});


  // Cancel booking on behalf of a user (admin-only)
  router.post('/admin/bookings/:bookingId/cancel', adminAuth, async (req, res) => {
    const { bookingId } = req.params;
    try {
      // Populate the event field so that we get the event document instead of just the ObjectId.
      const booking = await Booking.findById(bookingId).populate('event');
      console.log('Booking found:', booking);
      if (!booking) {
        return res.status(404).send('Booking not found');
      }
      
      // Check that the booking has an event
      if (!booking.event) {
        console.error('Booking event not found for booking:', bookingId);
        return res.status(500).send('Booking event not found');
      }
      
      // Now that the event field is populated, use it directly.
      const eventDoc = booking.event;
      if (eventDoc) {
        eventDoc.booked = Math.max(0, eventDoc.booked - booking.numTickets);
        await eventDoc.save();
      }
    createNotification(booking.user, `Your booking for event "${eventDoc.title}" is cancelled by an Admin!`, "system");
    createNotification(req.session.user._id,booking.user.name + " booking for " + eventDoc.title + " was canceled", "system");
      await Booking.findByIdAndDelete(bookingId);
      
      res.redirect('/admin/bookings');
    } catch (error) {
      console.error('Error canceling booking:', error);
      res.status(500).send('Error canceling booking');
    }
  });
  
  router.get('/admin/past-events', adminAuth, async (req, res) => {
    try {
      const now = new Date();
      // Only past events
      const pastEvents = await Events.find({ date: { $lt: now } }).sort({ date: -1 });
      res.render('admin-past-events', { pastEvents, user: req.session.user });
    } catch (err) {
      console.error('Error fetching past events:', err);
      res.status(500).send('Error fetching past events');
    }
  });
// Route to display all users
router.get('/admin/users', adminAuth, async (req, res) => {
    try {
      
      const users = await User.find().select('name email role isApproved');
      const adminCount = await User.countDocuments({ role: 'admin' });
        res.render('admin-users', { users, user: req.session.user, adminCount});
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Error fetching users');
    }
});

// Route to change user role
router.post('/admin/users/:id/change-role', async (req, res) => {
  try {
      const { role } = req.body;
      const updateFields = { role };
      if (role === 'organizer') {
          updateFields.isApproved = true; 
      }
      if (role === 'customer') {
          updateFields.isApproved = false;
      }

      await User.findByIdAndUpdate(req.params.id, updateFields);
      res.redirect('/admin/users');
  } catch (err) {
      console.error('Error updating user role:', err);
      res.status(500).send('Error updating user role');
  }
});


// Route to delete a user
router.post('/admin/users/:id/delete', adminAuth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/admin/users');
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Error deleting user');
    }
});

module.exports = router;
