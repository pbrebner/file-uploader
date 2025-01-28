require("dotenv").config();
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const prisma = require("../prisma/initiate");

const multer = require("multer");

// Storing the files locally
/*
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const fileType = file.mimetype.split("/")[1];
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e3);
        cb(null, file.fieldname + "-" + uniqueSuffix + "." + fileType);
    },
});
const upload = multer({ storage: storage });
*/

// Storing file on cloudinary
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const https = require("https");
const fs = require("fs");

// Gets all files of folder
exports.getFiles = asyncHandler(async (req, res, next) => {
    if (req.user) {
        const folder = await prisma.folder.findUnique({
            where: {
                id: Number(req.params.folderId),
            },
        });
        const files = await prisma.file.findMany({
            where: {
                folderId: Number(req.params.folderId),
            },
        });

        res.render("folder", {
            title: `${folder.folderName}`,
            folder: folder,
            files: files,
        });
    } else {
        res.redirect("/");
    }
});

// Creates a new file in folder
exports.createFile = [
    upload.single("fileUpload"),
    body("fileName")
        .trim()
        .isLength({ max: 30 })
        .withMessage("File Name can't be more than 30 characters long.")
        .optional()
        .escape(),
    body("fileUpload")
        .trim()
        .custom((value, { req }) => {
            const file = req.file;
            const allowedSize = 10; // 10MB file size limit

            if (!file) {
                throw new Error("Please add a file to upload.");
            } else if (file.size / (1024 * 1024) > allowedSize) {
                throw new Error("File size is too large. 10MB maximum.");
            } else {
                return true;
            }
        }),
    asyncHandler(async (req, res, next) => {
        if (req.user) {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const folder = await prisma.folder.findUnique({
                    where: {
                        id: Number(req.params.folderId),
                    },
                });

                const files = await prisma.file.findMany({
                    where: {
                        folderId: Number(req.params.folderId),
                    },
                });

                res.render("folder", {
                    title: `${folder.folderName}`,
                    folder: folder,
                    files: files,
                    errors: errors.array(),
                });
            } else {
                /*
                // Upload files locally
                await prisma.file.create({
                    data: {
                        fileName: req.body.fileName || req.file.filename,
                        size: req.file.size,
                        path: req.file.path,
                        folderId: Number(req.params.folderId),
                        userId: req.user.id,
                    },
                });
                */

                // Upload file to cloudinary
                const uploadResult = await new Promise((resolve) => {
                    cloudinary.uploader
                        .upload_stream((error, uploadResult) => {
                            return resolve(uploadResult);
                        })
                        .end(req.file.buffer);
                });

                await prisma.file.create({
                    data: {
                        fileName: req.body.fileName || req.file.originalname,
                        size: req.file.size,
                        path: uploadResult.secure_url,
                        folderId: Number(req.params.folderId),
                        userId: req.user.id,
                    },
                });

                res.redirect(`/folders/${req.params.folderId}/files`);
            }
        } else {
            res.redirect("/");
        }
    }),
];

// Gets File details
exports.getFile = asyncHandler(async (req, res, next) => {
    if (req.user) {
        const file = await prisma.file.findUnique({
            where: {
                id: Number(req.params.fileId),
            },
        });

        res.render("file", {
            title: file.fileName,
            file: file,
        });
    } else {
        res.redirect("/");
    }
});

// Download File
exports.downloadFile = asyncHandler(async (req, res, next) => {
    if (req.user) {
        const file = await prisma.file.findUnique({
            where: {
                id: Number(req.params.fileId),
            },
        });

        //res.download(file.path); (Only download from local path)

        const fileUrl = file.path;
        const fileName = file.path.split("/").at(-1);
        const destination = `downloads/${fileName}`;

        const fileStream = fs.createWriteStream(destination);

        // download file from cloudinary to downloads folder
        // This does not work with PDFs due to cloudinary security access. Will return blank PDF
        // Images work as expected
        https
            .get(fileUrl, (response) => {
                response.pipe(fileStream);
                fileStream.on("finish", () => {
                    fileStream.close(() => {
                        console.log("File downloaded successfully");
                    });
                });
            })
            .on("error", (err) => {
                fs.unlink(destination, () => {
                    console.error("Error downloading file:", err);
                });
            });

        res.render("file", {
            title: file.fileName,
            file: file,
        });
    } else {
        res.redirect("/");
    }
});

// Deletes File
exports.deleteFile = asyncHandler(async (req, res, next) => {
    if (req.user) {
        const file = await prisma.file.findUnique({
            where: {
                id: Number(req.params.fileId),
            },
        });

        if (!file) {
            // No file in database (return error)
            res.render("error", {
                title: "Error",
                errors: [{ msg: "Could not locate file requested." }],
            });
        } else {
            // All good, delete the file
            await prisma.file.delete({
                where: {
                    id: Number(req.params.fileId),
                },
            });

            // Delete file from file system (When stored locally)
            /*
            fs.unlink(file.path, (err) => {
                if (err) {
                    throw err;
                }
            });
            */

            // Get public id and delete file off cloudinary
            const publicId = file.path.split("/").at(-1).split(".")[0];
            cloudinary.uploader.destroy(publicId, function (error, result) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(result);
                }
            });

            res.redirect(`/folders/${req.params.folderId}/files`);
        }
    } else {
        res.redirect("/");
    }
});
