const mongoose = require('mongoose');
const User = require('./models/User');
const Events = require('./models/Events');
require('dotenv').config();

async function connectDB() {
    try {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // Increase timeout to 10s
        });
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1); // Exit if connection fails
    }
}

async function updateUsers() {
    try {
        await User.updateMany({ role: { $exists: false } }, { $set: { role: 'customer', isApproved: false } });
        console.log('✅ Updated old users with default roles.');
    } catch (err) {
        console.error('❌ Error updating users:', err);
    }
}

async function updateEvents() {
    try {
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
            await Events.updateMany({ organizer: null }, { $set: { organizer: adminUser._id } });
            console.log('✅ Updated old events with default organizer.');
        } else {
            console.log('⚠️ No admin found. Please create an admin user first.');
        }
    } catch (err) {
        console.error('❌ Error updating events:', err);
    }
}

async function runSeed() {
    await connectDB();
    await updateUsers();
    await updateEvents();
    mongoose.connection.close();
}

runSeed();
