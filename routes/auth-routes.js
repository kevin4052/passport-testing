const express = require('express');
const router = express.Router();
const passport = require('passport');

// route protection through passport's req.isAuthenticated() method
const ensureAuthentication = require('../configs/route-guard.config');

// requiring the User model
const User = require('../models/user.model');

// Bcrypt to encrypt passwords
const bcrypt = require('bcrypt');
const bcryptSaltRounds = 10;

// GET signup page
router.get('/signup', (req, res, next) => res.render('auth/signup'));

// POST signup form
router.post('/signup', (req, res, next) => {
    const {
        username,
        email,
        password
    } = req.body;

    // Check if username, password, and email are not empty
    if (!username || !password || !email) {
        res.render('auth/signup', {
            errorMessage: 'Please fill all the fields'
        });
        return;
    }

    // Find if user email is already in the database 
    User.findOne({email})
        .then((user) => {
            // Check user does not already exist
            if (user !== null) {
                res.render('auth/signup', {
                    message: 'The username already exists'
                });
                return;
            }

            // Encrypting the password
            const salt = bcrypt.genSaltSync(bcryptSaltRounds);
            const hashPass = bcrypt.hashSync(password, salt);

            // Collect user info into object
            const newUser = {
                username,
                email,
                passwordhash: hashPass,
            };

            // Create new user doc in the database
            User.create(newUser)
                .then(createdUser => {
                    console.log({createdUser});
                    res.redirect('/login');
                })
                .catch(err => next(err));
        })
        .catch((err) => next(err));
});


// GET login page with flash error message from passport
router.get('/login', (req, res, next) => {
    res.render('auth/login', { "errorMessage": req.flash("error") });
});

// POST login form with passport-local strategy
router.post("/login", passport.authenticate("local", {
    successRedirect: "/private-page",
    failureRedirect: "/login",
    failureFlash: true
}));

// GET private page which is protected with a route gaurd 
router.get("/private-page", ensureAuthentication, (req, res) => {
    res.render("private", {
        user: req.user
    });
});

// GET logout, passport req.logout() closes the current session
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
  });
  

module.exports = router;