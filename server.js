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
mongoose.connect("mongodb://localhost/polybius");
var db = mongoose.connection;
db.once('open', function(){
  console.log("Connected to database")
})
db.on('error', console.error.bind(console, 'Database connection error:'));

// Schema
var webSchema = mongoose.Schema({
  url: {
    type: String,
    trim: true
  },
  date: {
    type: String,
    trim: true
  }
})
// Mongoose model
var webpageModel = mongoose.model('webpages', webSchema);

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
app.get(BASE+'hello', function(req, res){
  console.log('Requested: hello')
  res.render('index.mustache');
});

// database
app.post(BASE+'savepage', function(req, res){
  var query = req.body.name;

  var newweb = new webpageModel({
    url: query,
    date: Date()
  })

  var promise = newweb.save();

  promise.then(function(user) {
    console.log("saved to db")
  })
  .then(function(user) {
    console.log('Ready for next query');
    // do something with updated user
  })
  .catch(function(err){
    // just need one of these
    console.log('error:', err);
  });

  res.send("Polybius has done the job!, I just saved " + query + " into the database")

});

var server = app.listen(8080, function(){
  let host = server.address().address;
  let port = server.address().port;
  console.log("Listening on port", host, port)
});
