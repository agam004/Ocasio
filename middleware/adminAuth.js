module.exports = (req, res, next) => {
    // Check if the user is logged in and is an admin
    if (req.session.isAdmin) {
        return next();  // Proceed to the next route handler
    }
    
    return res.redirect('/login');  // Redirect to login if not an admin
};
