require("dotenv").config();
const express = require("express");
const path = require("path");
// const hbs = require('hbs');
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const passport = require("passport");

const app = express();

// Set up the database
require("./configs/db.config");

// Express View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(require("morgan")("combined"));
app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// sessions setup
app.use(
  session({
    secret: "our-passport-local-strategy-app",
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
    }),
    resave: true,
    saveUninitialized: true,
  })
);

// passport setup
app.use(passport.initialize());
app.use(passport.session());
require("./configs/passport.config");

// Routes
const index = require("./routes/index.routes");
const auth = require("./routes/auth-routes");

app.use("/", index);
app.use("/", auth);

module.exports = app;
