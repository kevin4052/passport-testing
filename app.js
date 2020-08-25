require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

// Set up the database
require('./configs/db.config');

const User = require('./modules/user.model');

// Express View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(
    session({
        secret: "our-passport-local-strategy-app",
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        }),
        resave: true,
        saveUninitialized: true
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, cb) => {
    cb(null, user._id);
});
passport.deserializeUser((id, cb) => {
    User.findById(id)
        .then(user => cb(null, user))
        .catch(err => cb(err));
});

passport.use(new LocalStrategy({
        usernameField: 'username', // by default
        passwordField: 'password' // by default
    },
    (username, password, done) => {
        User.findOne({
                username
            })
            .then(user => {
                if (!user) {
                    return done(null, false, {
                        message: "Incorrect username"
                    });
                }

                if (!bcrypt.compareSync(password, user.password)) {
                    return done(null, false, {
                        message: "Incorrect password"
                    });
                }

                done(null, user);
            })
            .catch(err => done(err));
    }
));


// Routes
const index = require('./routes/index.routes');
const auth = require('./routes/auth-routes');

app.use('/', index);
app.use('/', auth);

module.exports = app;