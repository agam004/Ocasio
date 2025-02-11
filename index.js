require('dotenv').config(); // Load environment variables

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

// Configure session middleware
app.use(session({
  secret: 'verySecretKey', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // Ensure session persists
}));

// Middleware to make user available in all routes
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import and use routes
const authRoutes = require('./routes/Auth');
const adminRoutes = require('./routes/admin');
const eventRoutes = require('./routes/events');

app.use('/', authRoutes);
app.use('/', adminRoutes);
app.use('/', eventRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Hosted at http://localhost:${PORT}`);
});
