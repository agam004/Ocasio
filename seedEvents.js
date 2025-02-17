require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Events');

const sampleEvents = [
  {
    title: 'Tech Conference 2025',
    description: 'Join us for an exciting tech conference featuring industry leaders discussing the future of technology.',
    date: new Date('2025-05-20T09:00:00'),
    imageUrl: 'https://www.fischtankpr.com/wp-content/uploads/2023/10/shutterstock_2232908089-scaled.jpg',
    capacity: 200,
    price: 99.99,
    location: 'Convention Center, Cityville'
  },
  {
    title: 'Music Festival',
    description: 'Experience the best live performances at our annual music festival.',
    date: new Date('2025-06-15T12:00:00'),
    imageUrl: 'https://musicfest.ca/wp-content/uploads/2016/05/TICSO-OCCTI2017.jpg',
    capacity: 500,
    price: 59.99,
    location: 'Open Air Park, Townsville'
  },
  {
    title: 'Art Exhibition',
    description: 'Explore stunning art collections from renowned local artists in this unique exhibition.',
    date: new Date('2025-07-10T10:00:00'),
    imageUrl: 'https://news.ohio.edu/sites/ohio.edu.news/files/2020-10/2015%20UJE_exhibition%20Display.jpg',
    capacity: 150,
    price: 29.99,
    location: 'Art Gallery, Metropolis'
  },
  {
    title: 'Food & Wine Festival',
    description: 'Taste gourmet food and fine wines at our exclusive food and wine festival.',
    date: new Date('2025-08-05T11:00:00'),
    imageUrl: 'https://images.template.net/108351/food-fest-background-3vff1.png',
    capacity: 300,
    price: 49.99,
    location: 'Downtown Plaza, Cityville'
  },
  {
    title: 'Moncton Health & Wellness Expo',
    description: 'Discover the latest in health, fitness, and wellness with interactive sessions and workshops.',
    date: new Date('2025-09-12T09:30:00'),
    imageUrl: 'https://static.wixstatic.com/media/5961a0_35e20d67524d4907b81accc7a7821f8a~mv2.jpg/v1/fill/w_460,h_190,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/MWE%20logo%20black%20Expo%20with%20extra%20space.jpg',
    capacity: 250,
    price: 39.99,
    location: 'Exhibition Center, Wellness City'
  },
  {
    title: 'Startup Pitch Night',
    description: 'Watch innovative startups pitch their ideas to top investors in a dynamic and interactive session.',
    date: new Date('2025-10-01T18:00:00'),
    imageUrl: 'https://d1bdilxpumkn65.cloudfront.net/assets/events-images/Pitch-Night_Web.png',
    capacity: 100,
    price: 19.99,
    location: 'Innovation Hub, TechTown'
  },
  {
    title: 'Mississuaga Literary Festival',
    description: 'Join authors, poets, and literary critics for a celebration of literature with readings and panel discussions.',
    date: new Date('2025-11-15T10:00:00'),
    imageUrl: 'https://www.mississauga.ca/wp-content/uploads/2024/09/11120934/https___cdn.evbuc_.com_images_810162489_287100000897_1_original.jpg',
    capacity: 180,
    price: 25.00,
    location: 'City Library, Bookville'
  },
  {
    title: 'Film Premiere',
    description: 'Be the first to witness the debut of the year’s most anticipated film at our exclusive premiere event.',
    date: new Date('2025-12-05T19:30:00'),
    imageUrl: '../images/event-default.jpg',
    capacity: 220,
    price: 75.00,
    location: 'Grand Cinema, Movietown'
  },
  {
    title: 'Outdoor Adventure Expo',
    description: 'Gear up for adventure with outdoor equipment, travel tips, and interactive adventure simulations.',
    date: new Date('2025-04-22T08:00:00'),
    imageUrl: '../images/event-default.jpg',
    capacity: 350,
    price: 45.00,
    location: 'Adventure Park, Explorer City'
  },
  {
    title: 'Virtual Reality Summit',
    description: 'Dive into the world of VR with demonstrations, workshops, and networking with leading VR experts.',
    date: new Date('2025-03-18T14:00:00'),
    imageUrl: '../images/event-default.jpg',
    capacity: 400,
    price: 89.99,
    location: 'Tech Arena, FutureCity'
  }
];

async function seedEvents() {
  try {
    await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to database for seeding events.');

    // Optionally, clear existing events for a clean slate
    await Event.deleteMany({});
    console.log('Cleared existing events.');

    // Insert sample events into the database
    await Event.insertMany(sampleEvents);
    console.log('Sample events inserted successfully.');

    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
}

seedEvents();
