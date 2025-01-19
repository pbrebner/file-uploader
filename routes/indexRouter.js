const { Router } = require("express");
const indexRouter = Router();

const userController = require("../controllers/userController");
const fileController = require("../controllers/fileController");
const folderController = require("../controllers/folderController");

// FOLDER ROUTES
indexRouter.get("/", folderControllerController.index);

// FILE ROUTES

// USER ROUTES

// Get sign-up page
indexRouter.get("/sign-up", userController.signUpGet);

// Post sign-up page
indexRouter.post("/sign-up", userController.signUpPost);

// Get log-in page
indexRouter.get("/log-in", userController.logInGet);

// Post log-in page
indexRouter.post("/log-in", userController.logInPost);

// Get log-out
indexRouter.get("/log-out", userController.logOutGet);

module.exports = indexRouter;
