/*
Polybius
Web archiving for journalists
Version 0.0.1

cvalenzuela
*/

// routes, router, schema and way to organize data, mongodb scale and size, security and login, sessions wiht passport

// Libraries
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy
const app = express();

// Custom
const routes = require('./routes')
const credentials = require('./credentials');

// Middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 8080);
app.use('/assets', express.static('assets'))
app.use(express.static('public'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    // mongooseConnection: database.db,
    touchAfter: 24 * 3600 // time period in seconds
  })
}))
app.use(passport.initialize());
app.use(passport.session());

// Passport
const Account = require('./models/account'); // Configure passport-local to use account model for authentication
passport.use(new LocalStrategy(Account.authenticate()));
passport.use(new TwitterStrategy({
  consumerKey: credentials.consumerKey,
  consumerSecret: credentials.consumerSecret,
  callbackURL: 'http://localhost:8080/twitter-token' //this will need to be dealt with
}, function(token, tokenSecret, profile, done) {
  process.nextTick(function () {
    return done(null, profile);
  });
}));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// Connect mongodb
mongoose.connect('mongodb://localhost/polybius')
var db = mongoose.connection;
db.once('open', function(){
  console.log("Connected to database")
  console.log("---- Ready! ----")
})
db.on('error', console.error.bind(console, 'Database connection error:'));

// Routes
routes(app)

// Server
const server = app.listen(app.get('port'), function(){
  console.log("==============")
  console.log("Listening on port --> http://localhost:" + server.address().port);
});
