require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Events');
const EventCategory = require('./models/EventCategory');

// Define sample categories
const sampleCategories = [
  { name: 'Tech Conference', description: 'Technology and Conference events' },
  { name: 'Music', description: 'Music festivals and concerts' },
  { name: 'Art', description: 'Art exhibitions and galleries' },
  { name: 'Food & Wine', description: 'Food and Wine festivals' },
  { name: 'Health & Wellness', description: 'Health and wellness expos' },
  { name: 'Startup', description: 'Startup pitch events' },
  { name: 'Literary', description: 'Literary festivals and events' },
  { name: 'Film', description: 'Film premieres and screenings' },
  { name: 'Outdoor', description: 'Outdoor adventure expos' },
  { name: 'Virtual', description: 'Virtual reality summits and events' }
];

// Define sample events with a temporary property "categoryName"
const sampleEvents = [
  {
    title: 'Tech Conference 2025',
    description: 'Join us for an exciting tech conference featuring industry leaders discussing the future of technology.',
    date: '2025-05-20T09:00:00',
    imageUrl: 'https://www.fischtankpr.com/wp-content/uploads/2023/10/shutterstock_2232908089-scaled.jpg',
    capacity: 200,
    price: 99.99,
    location: 'Convention Center, Cityville',
    categoryName: 'Tech Conference'
  },
  {
    title: 'Music Festival',
    description: 'Experience the best live performances at our annual music festival.',
    date: '2025-06-15T12:00:00',
    imageUrl: 'https://musicfest.ca/wp-content/uploads/2016/05/TICSO-OCCTI2017.jpg',
    capacity: 500,
    price: 59.99,
    location: 'Open Air Park, Townsville',
    categoryName: 'Music'
  },
  {
    title: 'Art Exhibition',
    description: 'Explore stunning art collections from renowned local artists in this unique exhibition.',
    date: '2025-07-10T10:00:00',
    imageUrl: 'https://news.ohio.edu/sites/ohio.edu.news/files/2020-10/2015%20UJE_exhibition%20Display.jpg',
    capacity: 150,
    price: 29.99,
    location: 'Art Gallery, Metropolis',
    categoryName: 'Art'
  },
  {
    title: 'Food & Wine Festival',
    description: 'Taste gourmet food and fine wines at our exclusive food and wine festival.',
    date: '2025-08-05T11:00:00',
    imageUrl: 'https://images.template.net/108351/food-fest-background-3vff1.png',
    capacity: 300,
    price: 49.99,
    location: 'Downtown Plaza, Cityville',
    categoryName: 'Food & Wine'
  },
  {
    title: 'Moncton Health & Wellness Expo',
    description: 'Discover the latest in health, fitness, and wellness with interactive sessions and workshops.',
    date: '2025-09-12T09:30:00',
    imageUrl: 'https://static.wixstatic.com/media/5961a0_35e20d67524d4907b81accc7a7821f8a~mv2.jpg',
    capacity: 250,
    price: 39.99,
    location: 'Exhibition Center, Wellness City',
    categoryName: 'Health & Wellness'
  },
  {
    title: 'Startup Pitch Night',
    description: 'Watch innovative startups pitch their ideas to top investors in a dynamic and interactive session.',
    date: '2025-10-01T18:00:00',
    imageUrl: 'https://d1bdilxpumkn65.cloudfront.net/assets/events-images/Pitch-Night_Web.png',
    capacity: 100,
    price: 19.99,
    location: 'Innovation Hub, TechTown',
    categoryName: 'Startup'
  },
  {
    title: 'Mississuaga Literary Festival',
    description: 'Join authors, poets, and literary critics for a celebration of literature with readings and panel discussions.',
    date: '2025-11-15T10:00:00',
    imageUrl: 'https://www.mississauga.ca/wp-content/uploads/2024/09/11120934/https___cdn.evbuc_.com_images_810162489_287100000897_1_original.jpg',
    capacity: 180,
    price: 25.00,
    location: 'City Library, Bookville',
    categoryName: 'Literary'
  },
  {
    title: 'Film Premiere',
    description: 'Be the first to witness the debut of the year’s most anticipated film at our exclusive premiere event.',
    date: '2025-12-05T19:30:00',
    imageUrl: '../images/event-default.jpg',
    capacity: 220,
    price: 75.00,
    location: 'Grand Cinema, Movietown',
    categoryName: 'Film'
  },
  {
    title: 'Outdoor Adventure Expo',
    description: 'Gear up for adventure with outdoor equipment, travel tips, and interactive adventure simulations.',
    date: '2025-04-22T08:00:00',
    imageUrl: '../images/event-default.jpg',
    capacity: 350,
    price: 45.00,
    location: 'Adventure Park, Explorer City',
    categoryName: 'Outdoor'
  },
  {
    title: 'Virtual Reality Summit',
    description: 'Dive into the world of VR with demonstrations, workshops, and networking with leading VR experts.',
    date: '2025-03-18T14:00:00',
    imageUrl: '../images/event-default.jpg',
    capacity: 400,
    price: 89.99,
    location: 'Tech Arena, FutureCity',
    categoryName: 'Virtual'
  }
];

async function seedEvents() {
  try {
    await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to database for seeding events.');

    // Clear existing events and categories for a clean slate
    await Event.deleteMany({});
    await EventCategory.deleteMany({});
    console.log('Cleared existing events and categories.');

    // Insert sample categories
    const insertedCategories = await EventCategory.insertMany(sampleCategories);
    console.log('Sample categories inserted successfully.');

    // Map category names to ObjectIds
    const categoryMap = {};
    insertedCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Process sample events: convert date to UTC and assign category ObjectId
    const processedEvents = sampleEvents.map(event => {
      // Convert date string to a Date object and then adjust to UTC
      const localDate = new Date(event.date);
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

      // Ensure categoryName exists and map it to category ObjectId
      if (!event.categoryName || !categoryMap[event.categoryName]) {
        throw new Error(`No category found for event: ${event.title}`);
      }

      return {
        title: event.title,
        description: event.description,
        date: utcDate,
        imageUrl: event.imageUrl,
        capacity: event.capacity,
        price: event.price,
        location: event.location,
        booked: 0,
        category: categoryMap[event.categoryName]
      };
    });

    // Insert processed events into the database
    await Event.insertMany(processedEvents);
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
