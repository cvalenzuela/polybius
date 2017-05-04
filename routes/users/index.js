/*
Routes for user:
  - User
*/

const express = require('express');
const router = express.Router();
const Page = require('../../models/pages');
const scrapeIt = require("scrape-it");
const jsdiff = require('diff');

// User Main View
router.get('/', function(req, res) {
  res.render('profile', { user: req.user });
});

// Add New View
router.get('/add', function(req, res){
  res.render('partials/add', {layout: false});
})

// POST New View
router.post('/add', function(req, res){
  if(req.body.name.length > 0 && req.body.url.length > 0){
    console.log(req.body)
    var newPage = new Page();
    newPage.user = req.user.local.email;
    newPage.name = req.body.name;
    newPage.url = req.body.url;
    newPage.type = req.body.type;
    newPage.until = req.body.until;
    newPage.save(function(err) {
      if (err) {
        return handleError(err);
      }
      else{
        console.log("Saved to db")
        res.send('You are now tracking ' + req.body.name)
      }
    });
  } else{
    res.send('error')
  }
})

// View All Tracking
router.get('/tracking', function(req, res){
  Page.find({'user': req.user.local.email}, 'name type url user text' ,function (err, pages) {
    if (err) return handleError(err);
    res.render('partials/trackingPages', {trackingPages: pages, layout: false});
  })
})

module.exports = router;
