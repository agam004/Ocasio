module.exports = (req, res, next) => {
    // Check if the user is logged in AND has the correct role
    if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'organizer')) {
        return next();  // Proceed to the next route handler
    }
    
    return res.redirect('/');  // Redirect to home/login if not authorized
};


module.exports.isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not logged in
    }
    next();
};

