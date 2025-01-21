const asyncHandler = require("express-async-handler");

// Get main page
// Redirects to folders or login depending if user is already logged in
exports.index = asyncHandler(async (req, res, next) => {
    if (req.user) {
        res.redirect("/folders");
    } else {
        res.redirect("/log-in");
    }
});
