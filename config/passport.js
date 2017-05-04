/*
Local Strategy for passport
*/

var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function(passport) {

  // Used to serialize the user for the session
  // The user.id is saved in the session and is then used to to retrieve the whole object via the deserializeUser function. In this case: req.session.passport.user = {id:'xyz'}
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  // Used to deserialize the user. User object attaches to the request as req.user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // Sign Up
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  function(req, email, password, done) {
    process.nextTick(function() {
      User.findOne({ 'local.email':  email }, function(err, user) {
        if (err)
        return done(err);
        if (user) {
          return done(null, false, req.flash('signupMessage', 'That email is already in use.'));
        } else {
          // Create a new user
          var newUser = new User();
          newUser.local.name = req.body.name;
          newUser.local.organization = req.body.organization;
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);
          newUser.save(function(err) {
            if (err)
            throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));

  // Login
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  function(req, email, password, done) {
    User.findOne({'local.email':  email}, function(err, user) {
      if (err)
      return done(err);
      if (!user)
      return done(null, false, req.flash('loginMessage', 'No user found.'));
      if (!user.validPassword(password))
      return done(null, false, req.flash('loginMessage', 'Wrong password.'));

      // If it's valid, add cookies
      console.log(req.session)
      var visits = 1;
      if (req.cookies.visits) {
        visits = Number(req.cookies.visits) + 1;
      }
      // res.cookie('visits', visits, {});
      console.log("You have visited this site " + visits + " times.");
      return done(null, user);
    });
  }));
};
