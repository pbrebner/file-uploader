const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const prisma = require("../prisma/initiate");

// Gets all files of folder
exports.getFiles = asyncHandler(async (req, res, next) => {
    if (req.user) {
        const files = await prisma.file.findMany({
            where: {
                folderId: req.params.folderId,
            },
            include: {
                folder: true,
            },
        });

        let folder = files[0].folder;

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
// TODO: ADD SIZE AND PATH
exports.createFile = [
    body("fileName")
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage("File Name must be between 1 and 30 characters long.")
        .escape(),
    asyncHandler(async (req, res, next) => {
        if (req.user) {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const files = await prisma.file.findMany({
                    where: {
                        folderId: req.params.folderId,
                    },
                    include: {
                        folder: true,
                    },
                });

                let folder = files[0].folder;

                res.render("folder", {
                    title: `${folder.folderName}`,
                    folder: folder,
                    files: files,
                    errors: errors.array(),
                });
            } else {
                await prisma.file.create({
                    data: {
                        fileName: req.body.fileName,
                        folderId: req.params.folderId,
                        userId: req.user.id,
                    },
                });
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
                id: req.params.fileId,
            },
            include: {
                folder: true,
            },
        });

        res.render("file", {
            title: file.fileName,
            folder: file.folder,
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
                id: req.params.fileId,
            },
        });

        if (!file) {
            // No file in database (return error)
            res.render("error", {
                errors: [{ msg: "Could not locate file requested." }],
            });
        } else {
            // All good, delete the file
            await prisma.file.delete({
                where: {
                    id: req.params.fileId,
                },
            });
            res.redirect(`/folders/${req.params.folderId}/files`);
        }
    } else {
        res.redirect("/");
    }
});
