/*  Routes */
const uuidV1 = require('uuid/v1');

var passport = require('passport');
var Account = require('./models/account');
var Webpages = require('./models/webpages');
var router = require('express').Router();

module.exports = function(app){
  var sess;
  const BASE = '/';

  /* ---- Index Page ---- */
  app.get('/', function(req, res) {
    sess = req.session;
  	if (!sess.passport) {
      console.log("User not signed in, show the login page")
      res.render('login', {});
  	} else {
      console.log("User signed in, show the index page")
      res.render('main', {});
  	}
  });

  /* ---- Register ---- */
  app.get('/register', function(req,res){
    console.log("User wants to register")
    res.render('register', {});
  });

  app.post('/register', function(req, res) {
    console.log('Registering user...');
    Account.register(new Account({
      name: req.body.name,
      username: req.body.username
    }), req.body.password, function(err) {
      if (err) {
        console.log('Error while user register!', err);
        return next(err);
      }
      console.log('User registered!');
      res.redirect('/');
    });
  });

  /* ---- Login Access ---- */
  app.post('/login', passport.authenticate('local', { failureRedirect: '/' }), function(req, res) {
    console.log('Requested: Login');
    sess = req.session
    // Cookies
    var visits = 1;
    if (req.cookies.visits) {
      visits = Number(req.cookies.visits) + 1;
    }
    res.cookie('visits', visits, {});
    console.log("You have visited this site " + visits + " times.");
    // Set the session variable
    sess.userid = uuidV1();
    sess.username = req.user.username; // sess.passport.user
    sess.lastlogin = Date.now();
    res.redirect('main');
  });

  app.get('/twitter-login', passport.authenticate('twitter'));

  app.get('/twitter-token', passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res){
    res.redirect('main');
  });

  /* ---- Main ---- */
  app.get(BASE+'main', function(req, res){
    console.log('Requested: Main');
    res.render('main');
  })

  /* ---- View Saved Pages ---- */
  app.get(BASE+'getpages', function(req, res){
    console.log('Requested: Saved pages')
    Webpages.find({}, function(err, results){
      let data = results
      res.render('savedpages', {data});
    })
  });

  /* ---- Save a page ---- */
  app.post(BASE+'savepage', function(req, res){
    console.log('Requested: Save a page')
    var query = req.body.name;

    var newWeb = new Webpages({
      url: query,
      date: Date()
    })

    var promise = newWeb.save();

    promise.then(function(user) {
      console.log("Saved: " + newWeb.url + " to db.")
    })
    .then(function(user) {
      console.log('Ready for next query');
    })
    .catch(function(err){
      console.log('error:', err);
    });

  });

  /* ---- Search ---- */
  app.post(BASE+'search', function(req, res){
    // var query = new RegExp(req.query.q, 'i');
    // db2.posts.find({"keywords": query},
    //   function(err, saved) {
    //     if( err || !saved) console.log("No results");
    //     else res.send(saved);
    // });
  })

  /* ---- Delete a page ---- */
  app.post(BASE+'deletePage', function(req, res){
    console.log('Requested: Delete page')

    var query = req.body.name;
    console.log(query);
    Webpages.deleteOne({ url: query }, function(err, res){
      console.log("deleted" + res)
    })
  });

  /* ---- Logout ---- */
  app.get('/logout', function(req, res) {
    console.log('Requested: Logout')
  	// delete req.session.username;
  	// res.redirect('/');
    req.logout();
    req.session.destroy(function(err) {
      if(err) {
        console.log('Unable to logout, sorry!')
        console.log(err);
      } else {
        res.redirect('/');
      }
    })
  });
}
