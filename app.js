/*
Polybius
Web archiving tool for journalists

v.0.0.1
development in the public interest
itp 2017
cvalenzuela@nyu.edu
*/

const path = require('path');
const express = require('express');
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const hbs = require('express-hbs')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const favicon = require('serve-favicon');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose')
mongoose.Promise = global.Promise;
const flash = require('connect-flash')

// Database Configuration
const configDB = require('./config/database.js');
mongoose.connect(configDB.url);

// Create the app
const app = express();

// Set Middleware
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.express4({
  defaultLayout: __dirname + '/views/layouts/default.hbs',
  partialsDir: __dirname + '/views/partials',
  layoutsDir: __dirname + '/views/layouts'
}));
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))); // uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: "sshsecret",
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    touchAfter: 24 * 3600 // time period in seconds
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport')(passport)

/* Routes */
// For every route with user/ check if the user is logged in
app.all(['/user', '/user/*'], function(req, res, next){
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
});
app.use('/', require('./routes/index'));
app.use('/user', require('./routes/users'));

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Export app to use in bin/www
module.exports = app;
