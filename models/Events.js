const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    imageUrl: { type: String ,
        default: '../images/event-default.jpg'
    }, 
    capacity: { type: Number, required: true },
    booked: { type: Number, default: 0 },
    price: { type: Number, required: true },
    location: { type: String, required: true },
});

const Event = mongoose.model('Events', eventSchema);

module.exports = Event;