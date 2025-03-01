// utils/bookingNotifications.js
const Booking = require('../models/Booking');
const createNotification = require('../middleware/notification');

async function checkUserBookingsAndNotifications(userId) {
  try {
    const bookings = await Booking.find({ user: userId }).populate('event');
    const now = new Date();

    bookings.forEach(booking => {
      if (booking.event && booking.event.date) {
        const eventDate = new Date(booking.event.date);
        const diffInMs = eventDate - now;
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        // If the event is upcoming within 3 days, send a reminder notification
        if (diffInDays > 0 && diffInDays <= 3) {
          const message = `Reminder: Your event "${booking.event.title}" is in ${Math.ceil(diffInDays)} day(s).`;
          createNotification(userId, message, 'system');
        }
        // If the event has passed and no review was submitted, prompt for a review
        else if (diffInDays < 0 && !booking.reviewSubmitted) {
          const message = `We hope you enjoyed "${booking.event.title}". Please consider leaving a review by clicking <a href="/review/${booking.event._id}">here</a>.`;
          createNotification(userId, message, 'system');
        }
      }
    });
  } catch (error) {
    console.error('Error checking booking notifications:', error);
  }
}

module.exports = checkUserBookingsAndNotifications;
