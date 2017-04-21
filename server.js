/*
Polybius
Web archiving for journalists
Version 0.0.1

cvalenzuela
*/

var express = require('express');
var mustache = require('mustache-express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var http = require('http'); //?
var path = require('path');
var app = express();

/*  Mongodb */
mongoose.connect("mongodb://localhost/soccerPlayers");
var db = mongoose.connection;
db.once('open', function(){
  console.log("Connected to database")
})
db.on('error', console.error.bind(console, 'Database connection error:'));

// Schema
var soccerPlayers = mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  club: {
    type: String,
    trim: true
  }
})
// Mongoose model
var Player = mongoose.model('Player', soccerPlayers);

var arturo = new Player({
  name: 'Arturo Vidal',
  club: 'Bayern Munich'
})
console.log(arturo)

/*  Middleware */
// Views for mustache
app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
app.use('/assets', express.static('assets'))

// Body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));

const BASE = '/';

/*  Routes */
// Main
app.get(BASE, function(req, res){
  console.log('Requested: index')
  res.render('index.mustache');
});

// Form
app.post(BASE+'form', function(req, res){
  post.name = req.body.name;
  res.render('form.mustache');
});

// database
app.get(BASE+'database', function(req, res){

  var promise = arturo.save();

  promise.then(function(user) {
    console.log("saved to db")
  })
  .then(function(user) {
    console.log('updated user: ');
    // do something with updated user
  })
  .catch(function(err){
    // just need one of these
    console.log('error:', err);
  });

  // Soccer.find({}, function(err, results){
  //   if(err){
  //     res.send("Nothing on the database")
  //   }
  //   return res.json({data:results})
  // })

});

var server = app.listen(8080, function(){
  let host = server.address().address;
  let port = server.address().port;
  console.log("Listening on port", host, port)
});
