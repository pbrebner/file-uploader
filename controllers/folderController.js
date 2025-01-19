const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Get main page
// Displays login form or users folders if logged in
exports.index = asyncHandler(async (req, res, next) => {
    res.send("Not implemented yet");
});

// Creates a new folder
exports.newFolderPost = asyncHandler(async (req, res, next) => {
    res.send("Not implemented yet");
});
