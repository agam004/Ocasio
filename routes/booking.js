const express = require('express');
const Booking = require('../models/Booking');
const router = express.Router();
const Event = require('../models/Events');
const User = require('../models/User');
const Notification = require('../models/Notification');
const createNotification = require('../middleware/notification');
const isAuthenticated = require('../middleware/adminAuth');

// Cancel a booking
router.post('/cancel-booking', async (req, res) => {
  console.log("Booking being canceled: ", req.body);
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID is required' });
  }

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Fetch the associated event
    const event = await Event.findById(booking.event);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Update booked tickets count
    console.log("Booked tickets before cancel: ", event.booked);
    event.booked = Math.max(0, event.booked - booking.numTickets);
    console.log("Booked tickets after cancel: ", event.booked);
    await event.save(); // Save updated event before deleting booking

    // Delete the booking
    await Booking.findByIdAndDelete(bookingId);
    console.log('Booking canceled:', bookingId);
    // Create notification for cancellation
    createNotification(req.session.user._id, `Your booking for event "${event.title}" is cancelled!`, "booking");
    res.redirect('/bookings'); // Redirect to the bookings page
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Book an event (using /book-event/:eventId route)
router.post('/book-event/:eventId', async (req, res) => {
  const { numTickets } = req.body;
  const { eventId } = req.params;

  if (!numTickets || numTickets < 1) {
    return res.status(400).json({ error: 'Number of tickets must be greater than 0' });
  }

  try {
    // Find the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const user = req.session.user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (event.capacity - event.booked < numTickets) {
      return res.status(400).json({ error: 'Not enough tickets available' });
    }

    // Calculate the total cost (assuming each ticket has a price property)
    const totalCost = event.price * numTickets;

    // Create a new booking
    const newBooking = new Booking({
      user: user._id,
      event: event._id,
      numTickets,
      totalCost
    });

    await newBooking.save();
    event.booked += parseInt(numTickets, 10);
    await event.save();
    // Create notification for successful booking
    createNotification(user._id, `Your booking for event "${event.title}" was confirmed!`, 'booking');
    res.redirect('/bookings');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/book-event/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const userId = req.session.user ? req.session.user._id : null; // Assuming you have a logged-in user

  try {
    // Find the event by ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if the user already has a booking for this event
    const existingBooking = await Booking.findOne({ user: userId, event: eventId });

    res.render('book-event', {
      event,
      userBooking: existingBooking,
      user: req.session.user // If user is logged in, send user info for display
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login'); // Ensure the user is logged in
    }

    const userId = req.session.user._id;
    const bookings = await Booking.find({ user: userId }).populate('event');

    // Format data for rendering
    const formattedBookings = bookings.map(booking => {
      const eventDate = new Date(booking.event.date);
      const now = new Date();
      const isPastEvent = eventDate < now; // Check if the event has already happened

      return {
        _id: booking._id,
        numTickets: booking.numTickets,
        event: {
          title: booking.event.title,
          date: booking.event.date,
          eventId: booking.event._id
        },
        isPastEvent, // Add the past event status
        reviewSubmitted: booking.reviewSubmitted // Check if the review is already submitted
      };
    });

    res.render('bookings', { bookings: formattedBookings, user: req.session.user });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).send('Error fetching bookings');
  }
});

// Route to display a receipt for a booking
router.get('/receipt/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('event');
    if (!booking) {
      return res.status(404).send('Receipt not found');
    }
    res.render('receipt', { booking });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
