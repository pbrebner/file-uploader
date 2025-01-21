const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const prisma = require("../prisma/initiate");

// Gets all folders
exports.getFolders = asyncHandler(async (req, res, next) => {
    if (req.user) {
        const folders = await prisma.folder.findMany({
            where: {
                // TODO: Confirm that this is how I would access user id
                userId: req.user.id,
            },
        });

        res.render("folders", {
            folders: folders,
        });
    } else {
        res.redirect("/log-in");
    }
});

// Creates a new folder
exports.createFolder = [
    body("folderName")
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage("Folder Name must be between 1 and 30 characters long.")
        .escape(),
    asyncHandler(async (req, res, next) => {
        if (req.user) {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const folders = await prisma.folder.findMany({
                    where: {
                        userId: req.user.id,
                    },
                });

                res.render("folders", {
                    folders: folders,
                    errors: errors.array(),
                });
            } else {
                // TODO: Confirm that this is how userId should be added. This updates users folder attribute?
                await prisma.folder.create({
                    data: {
                        folderName: req.body.folderName,
                        userId: req.user.id,
                    },
                });
            }
        } else {
            res.redirect("/log-in");
        }
    }),
];

// Gets a folder (redirects to files route)
exports.getFolder = asyncHandler(async (req, res, next) => {
    if (req.user) {
        res.redirect(`/folders/${req.params.folderId}/files`);
    } else {
        res.redirect("/log-in");
    }
});

// Deletes Folder if empty
exports.deleteFolder = asyncHandler(async (req, res, next) => {
    if (req.user) {
        const folder = await prisma.folder.findUnique({
            where: {
                id: req.params.folderId,
            },
            include: {
                files: true,
            },
        });

        if (!folder) {
            // No folder in database (return error)
            // TODO: RERENDER PAGE WITH ERROR
        } else if (folder.files.length != 0) {
            // There are files in the folder still (return error)
            // TODO: RERENDER PAGE WITH ERROR
        } else {
            // All good, delete the folder
            await prisma.folder.delete({
                where: {
                    id: req.params.folderId,
                },
            });
            res.redirect("/folders");
        }
    } else {
        res.redirect("/log-in");
    }
});
