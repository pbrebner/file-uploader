// app.js
require("dotenv").config();
const path = require("node:path");
const express = require("express");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require("./prisma/initiate");
const passport = require("passport");

const app = express();

const router = require("./routes/router");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
    session({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // ms
        },
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new PrismaSessionStore(prisma, {
            checkPeriod: 2 * 60 * 1000, //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }),
    })
);
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// Set up to be able to access currentUser from local variables
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

app.use("/", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));
