// index.js
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');

let login = false;

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas using the connection string from .env
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to Database'))
  .catch(err => console.error('Error connecting Database:', err));

// Middleware to parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use session to store user login state
app.use(session({
  secret: 'your-secret-key', // Use a secret key for the session
  resave: false,
  saveUninitialized: true
}));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine and set views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Example Routes
// (Create these route files in the /routes directory or replace with your own logic)
const authRoutes = require('./routes/Auth');       // Handles /login, /signup, etc.
// const eventsRoutes = require('./routes/events');   // Handles /events and event details
// const dashboardRoutes = require('./routes/dashboard'); // Handles dashboard logic

// Use the route files for route handling
app.use('/', authRoutes);
// app.use('/', eventsRoutes);
// app.use('/', dashboardRoutes);

// Home page route (e.g., index.ejs)
app.get('/', (req, res) => {
  res.render('index'); // Renders views/index.ejs
});

// Start the server
app.listen(PORT, () => {
  console.log(`Hosted at http://localhost:${PORT}`);
});
