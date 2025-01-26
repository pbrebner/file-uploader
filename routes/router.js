const { Router } = require("express");
const router = Router();

const indexController = require("../controllers/indexController");
const userController = require("../controllers/userController");
const fileController = require("../controllers/fileController");
const folderController = require("../controllers/folderController");

// INDEX ROUTES
router.get("/", indexController.index);

// FOLDER ROUTES

router.get("/folders", folderController.getFolders);

router.post("/folders", folderController.createFolder);

router.get("/folders/:folderId", folderController.getFolder);

router.post("/folders/:folderId/delete", folderController.deleteFolder);

// FILE ROUTES

router.get("/folders/:folderId/files", fileController.getFiles);

router.post("/folders/:folderId/files", fileController.createFile);

router.get("/folders/:folderId/files/:fileId", fileController.getFile);

router.get(
    "/folders/:folderId/files/:fileId/download",
    fileController.downloadFile
);

router.post(
    "/folders/:folderId/files/:fileId/delete",
    fileController.deleteFile
);

// USER ROUTES

// Get sign-up page
router.get("/sign-up", userController.signUpGet);

// Post sign-up page
router.post("/sign-up", userController.signUpPost);

// Post log-in page
router.post("/log-in", userController.logInPost);

// Get log-out
router.get("/log-out", userController.logOutGet);

module.exports = router;
