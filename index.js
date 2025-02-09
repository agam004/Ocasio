
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');



const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas using the connection string from .env
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to Database'))
  .catch(err => console.error('Error connecting Database:', err));

// Middleware to parse incoming requests


// Use session to store user login state
app.use(session({
  secret: 'verySecretKey', // Use a secret key for the session
  resave: false,
  saveUninitialized: true
}));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine and set views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Example Routes
const authRoutes = require('./routes/Auth');
const adminRoutes = require('./routes/admin');
const eventRoutes = require('./routes/events');
// Use the route files for route handling
app.use('/', authRoutes);
app.use('/', adminRoutes);
app.use('/', eventRoutes);

// Home page route (only accessible if logged in)
app.get('/', (req, res) => {
  if (req.session.login) {
    res.render('index'); // Render homepage if logged in
  } else {
    res.redirect('/login'); // Redirect to login if not logged in
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Hosted at http://localhost:${PORT}`);
});
