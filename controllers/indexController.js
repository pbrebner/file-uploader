const asyncHandler = require("express-async-handler");

// Get main page
exports.index = asyncHandler(async (req, res, next) => {
    res.redirect("/folders");
});
