const express = require('express') //server
const expressLayouts = require('express-ejs-layouts') //ejs layouts
const expressFileUpload = require('express-fileupload');
const mongoose = require('mongoose') //db connecton
const MongoStore = require('connect-mongo') //db connection
const passport = require('passport') //authentication
const flash = require('connect-flash') //messages
const session = require('express-session') //sessions
const morgan = require('morgan') //logging
const path = require("path") //platform independent path tools

const app = express()
//set static folder
app.use(express.static(path.join(__dirname,"public")));

// Logging requests to console with responses.
app.use(morgan("dev"))

// Passport Config
require('./config/passport')(passport)

// Get mongo connection string
const db = require('./config/keys').mongoURI

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }, )
  .then(() => console.log(`MongoDB connected`))
  .catch((err) => console.log(err))

// EJS for templating html with js
app.use(expressLayouts)
app.set('view engine', 'ejs')

// Express body parser & file upload validation
app.use(express.urlencoded({ extended: true })) // form posts etc
app.use(express.json()) // json posts
app.use(expressFileUpload({createParentPath: true}))

// Express session
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: db}),
  }),
)

// Passport middleware for varification
app.use(passport.initialize())
app.use(passport.session())

// Connect flash, for passing messeges.
app.use(flash())

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
});


// Routes
app.use('/', require('./routes/index'))
app.use('/patient', require('./routes/patient'))
app.use('/exam', require('./routes/exam'))
app.use('/staff', require('./routes/staff'))
app.use('/admin', require('./routes/admin'))
app.use((req, res) => {
  res.status(404).render("errors/404")
});

//port if defined externally, or default to 5500
const PORT = process.env.PORT || 5500

//open server and log
app.listen(PORT, console.log(`Server running on ${PORT}`))
