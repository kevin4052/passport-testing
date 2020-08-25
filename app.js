const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('./models/user.js');

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
const router = require('./routes/auth-routes');
app.use('/', router);

module.exports = app;