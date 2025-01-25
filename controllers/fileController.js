const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const prisma = require("../prisma/initiate");
const fs = require("fs");

const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e3);
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});
const upload = multer({ storage: storage });

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
            const allowedSize = 500000; // 5MB file size limit

            if (!file) {
                throw new Error("Please add a file to upload.");
            } else if (file.size > allowedSize) {
                throw new Error("File size is too large. 5MB maximum.");
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
                await prisma.file.create({
                    data: {
                        fileName: req.body.fileName || req.file.filename,
                        size: req.file.size,
                        path: req.file.path,
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

            // Delete file from file system
            fs.unlink(file.path, (err) => {
                if (err) {
                    throw err;
                }
            });

            res.redirect(`/folders/${req.params.folderId}/files`);
        }
    } else {
        res.redirect("/");
    }
});
