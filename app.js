const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const path = require("path");

const app = express();

// Logging when dev mode enabled
app.use(morgan("dev"))


// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }, )
  .then(() => console.log(`MongoDB connected`))
  .catch((err) => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: db}),
  }),
);

// Passport middleware for varification
app.use(passport.initialize());
app.use(passport.session());

// Connect flash, for passing messeges.
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//static folder for assets
app.use(express.static(path.join(__dirname,"public")))

// Routes
app.use('/', require('./routes/index'));

const PORT = process.env.PORT || 5500;

app.listen(PORT, console.log(`Server running on ${PORT}`));
