/*
Routes for:
  - Home
  - Signup
  - Login
  - Logout
*/

var express = require('express');
var passport = require('passport');
var router = express.Router();

// Home Page
router.get('/', function(req, res, next) {
  if (!req.session.passport) {
    console.log("User not signed in, show the login page")
    res.render('index');
  } else {
    console.log("User signed in, show the index page")
    res.redirect('/user');
    //res.render('profile', {user: req.user });
  }
});

// Login
router.get('/login', function(req, res, next) {
  res.render('login.hbs', { message: req.flash('loginMessage') });
});

// Signup
router.get('/signup', function(req, res) {
  res.render('signup.hbs', { message: req.flash('signupMessage') });
});

// Logout
router.get('/logout', function (req, res){
  console.log('Requested: Logout')
  // delete req.session.username;
  // res.redirect('/');
  req.logout();
  req.session.destroy(function(err) {
    if(err) {
      console.log('Unable to logout, sorry!')
      console.log(err);
    } else {
      console.log("Sucessfully logout, redirect to beginning")
      res.redirect('/');
    }
  })
});

// Signup Form
router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/user',
  failureRedirect: '/signup',
  failureFlash: true,
}));

// Login Form
router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/user',
  failureRedirect: '/login',
  failureFlash: true,
}));


module.exports = router;
