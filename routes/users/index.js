/*
Routes for user:
  - Profile and pages
*/

const express = require('express');
const router = express.Router();
const Page = require('../../models/pages');
const scrapeIt = require("scrape-it");
const setScrapeTime = require('./../../scripts/scrapeTime');
const jsdiff = require('diff');
require('colors') // just for debug

// User Main View
router.get('/', function(req, res) {
  res.render('profile', {user: req.user});
});

// Add New View
router.get('/add', function(req, res){
  res.render('partials/add', {layout: false});
})

// POST Add New
router.post('/add', function(req, res){
  // Check if the submission is fine
  if(req.body.name.length > 0 && req.body.url.length > 0){
    // Scrape the sent page for the first time
    scrapeIt(req.body.url, {
      html: "html",
    }).then(text => {
      // Once we have it, save it to the db
      var newPage = new Page();
      newPage.user = req.user.local.email;
      newPage.name = req.body.name;
      newPage.url = req.body.url;
      newPage.type = req.body.type;
      newPage.until = req.body.until;
      newPage.time = req.body.time;
      newPage.htmls.push({ html: text.html.replace(/(\r\n|\n|\r|\t)/gm,"").replace(/   /g, '') });
      newPage.save(function(err) {
        if (err) {
          console.log(err)
          res.send('error')
        }
        else{
          console.log("Saved to db")
          // Set-up scrape cronjob for XX minutes until defined time
          setScrapeTime(req.body.url, req.user.local.email, req.body.time);
          // Send back the confirmation
          res.send('You are now tracking ' + req.body.name)
        }
      });
    });

  } else{
    res.send('error')
  }
})

// View All Tracking
router.get('/tracking', function(req, res){
  Page.find({'user': req.user.local.email}, 'name type url user' ,function (err, pages) {
    if (err) return handleError(err);
    res.render('partials/trackingPages', {trackingPages: pages, layout: false});
  })
})

// View one page information
router.get('/page/:pageName', function(req, res){

  // get the element requested
  Page.findOne({'name': req.params.pageName, 'user': req.user.local.email})
  .select({ "htmls": 1, "name": 1, "url": 1, "type": 1, "until": 1})
  .exec(function(err, doc) {
    // Once we have it, compare to the current scraped version
    var added = [];
    var removed = [];
    var equal = [];

    if(doc.htmls.length > 1){
      var diff = jsdiff.diffChars(doc.htmls[doc.htmls.length-1].html, doc.htmls[doc.htmls.length-2].html);

      diff.forEach(function(part){
        part.added ? removed.push(part.value) :
        part.removed ? added.push(part.value) :
        equal.push(part.value);
      });
    } else{

    }

    res.render('page', {user: req.user, name: doc.name, htmls: doc.htmls, url: doc.url, until: doc.until, type: doc.type, add: added, remove: removed, same: equal, docId: doc._id});
    //current = current.html.replace(/(\r\n|\n|\r|\t)/gm,"").replace(/   /g, '')
    //var diff = jsdiff.diffWords(last.htmls[0].html, current);
    // If there's a difference, add the html to the db
    // if(diff.length > 1){
    //   Page.findOne({'user': user, 'url': url},'htmls',function (err, doc) {
    //     if (err) return console.log(err);
    //     doc.htmls.push({ html: current });
    //     doc.save(function (err) {
    //       if (err) res.send(err);
    //       console.log("Changes detected! New html file saved!")
    //     });
    //   })
    // // Update status of db
    // //TODO
    // } else {
    //   console.log('No changes')
    // }
  })
})

  // Display a version of a page
  router.get('/page/display/version/:id/:pageid', function(req, res){
    Page.find({'_id': req.params.id})
    .select({"htmls": 1})
    .select({"html": 1})
    .exec(function(err, doc) {
      console.log(doc)
      res.send(doc)
    })
  })

module.exports = router;
