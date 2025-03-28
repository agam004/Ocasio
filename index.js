require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const Notification = require('./models/Notification');

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas using the connection string from .env
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to Database'))
  .catch(err => console.error('Error connecting Database:', err));

// Configure session middleware
app.use(session({
  secret: '$5jhf8dk;sjf', // Secret used to sign session ID cookie
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // Ensure session persists
}));

//For testing purposes only
app.get('/set-user', (req, res) => {
  const role = req.query.role;
  
  if (role === 'admin') {
    req.session.user = {
      _id: '67b6478cd531588c30136e76',
      name: 'Chad Admin',
      email: 'jatt@mail.com',
      role: 'admin',
      isApproved: true
    };
    req.session.isAdmin = true;
  } else if (role === 'customer') {
    req.session.user = {
      _id: '67b64759d531588c30136e71',
      name: 'Lucky Singh',
      email: 'lucky@mail.com',
      role: 'customer',
      isApproved: true
    };
    req.session.isAdmin = false;
  }
  
  req.session.login = true;
  console.log(`User set to ${role}`);
  res.redirect('back');  // Redirect back to the page the user was on
});


// Middleware to make user available in all routes
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  console.log("User:", req.session.user);
  console.log("isAdmin:", req.session.isAdmin);
  next();
});

app.use(async (req, res, next) => {
  if (req.session.user) {
    // Assuming you have a Notification model:
    const count = await Notification.countDocuments({ user: req.session.user._id, read: false });
    res.locals.unreadNotificationsCount = count;
    req.session.unreadNotificationsCount = count;  // Ensure session stores the count
    console.log("Unread Notifications Count Updated:", count);
  } else {
    res.locals.unreadNotificationsCount = 0;
  }
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
const bookingRoutes = require('./routes/booking');
const notificationRoutes = require('./routes/notifications');
const eventCategoryRoutes = require('./routes/eventCategories');
const profileRoutes = require('./routes/Profile');
const reviewRoutes = require('./routes/review');
const methodOverride = require('method-override');


app.use(methodOverride('_method')); 
app.use('/', bookingRoutes);
app.use('/', authRoutes);
app.use('/', adminRoutes);
app.use('/', eventRoutes);
app.use('/', notificationRoutes);
app.use('/', eventCategoryRoutes);
app.use('/', profileRoutes);
app.use('/', reviewRoutes);

app.get('/about', (req, res) => {
  res.render('about', { user: req.session.user || null });
});
app.get('/contact', (req, res) => {
  res.render('contact', { user: req.session.user || null });
});
// Start the server
app.listen(PORT, () => {
  console.log(`Hosted at http://localhost:${PORT}`);
});

