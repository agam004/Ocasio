const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    imageUrl: { type: String ,
        default: '../images/event-default.jpg'
    }, // Optional: For storing image URL related to event
});

const Event = mongoose.model('Events', eventSchema);

module.exports = Event;