const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Set up passport to authenticate login
/*
TODO: Update to use with PostgreSQL and Prisma

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ email: username });
            if (!user) {
                return done(null, false, { message: "Incorrect username" });
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                // passwords do not match!
                return done(null, false, {
                    message: "Incorrect username or password",
                });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});
*/

// Display Sign-Up Form on Get
exports.signUpGet = (req, res, next) => {
    res.render("sign-up", { title: "Sign Up Form" });
};

// Handle Sign-up Form Post
/*
TODO: Update to use with PostgreSQL and Prisma

exports.signUpPost = [
    // Validate and sanatize the inputs
    body("firstName", "First name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("lastName", "Last name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("email", "Must include a valid email (example: example@email.com).")
        .trim()
        .isEmail()
        .custom(async (value) => {
            const user = await User.find({ email: value });
            if (user.length > 0) {
                throw new Error(
                    "Email is already in use, please use a different one."
                );
            }
        })
        .escape(),
    body("password", "Password must be a minimum of 5 characters.")
        .trim()
        .isLength({ min: 5 })
        .escape(),
    body("passwordConfirm", "Passwords must match").custom((value, { req }) => {
        return value === req.body.password;
    }),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
            if (err) {
                return next(err);
            } else {
                //Create User object with data
                const user = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: hashedPassword,
                    memberStatus: true,
                });

                // If errors exist, render form page with errors
                if (!errors.isEmpty()) {
                    res.render("sign-up", {
                        title: "Sign-up Form",
                        user: user,
                        errors: errors.array(),
                    });
                } else {
                    await user.save();
                    res.redirect("/log-in");
                }
            }
        });
    }),
];
*/

// Display Log-In on Get
exports.logInGet = (req, res, next) => {
    res.render("log-in", { title: "Log In" });
};

// Handle Log-In Post
exports.logInPost = (req, res) => {
    passport.authenticate("local", (err, user, options) => {
        if (user) {
            // If the user exists log him in:
            req.login(user, (error) => {
                if (error) {
                    res.send(error);
                } else {
                    console.log("Successfully authenticated");
                    // HANDLE SUCCESSFUL LOGIN
                    res.redirect("/");
                }
            });
        } else {
            console.log(options.message); // Prints the reason of the failure
            // HANDLE FAILURE LOGGING IN
            res.render("log-in", { title: "Log In", errors: options.message });
        }
    })(req, res);
};

// Handle Log-Out
exports.logOutGet = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
};
