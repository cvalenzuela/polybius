/*
Set up a cronjob to scrape a page for a given time
*/

var schedule = require('node-schedule');
const scrapeIt = require("scrape-it");
const Page = require('../models/pages');
const jsdiff = require('diff');
require('colors') // just for debug

var setScrapeTime = function(url, user, time){
  console.log("Trackig every: " + time + " seconds")
  setInterval(function(){
    // Scrape the sent page
    scrapeIt(url, {
      html: "html",
    }).then(current => {
      // get the last html saved for that url
      Page.findOne({'user': user, 'url': url})
      .select({ "htmls": { "$slice": -1 }})
      .exec(function(err, last) {
        // Once we have it, compare to the current scraped version
        current = current.html.replace(/(\r\n|\n|\r|\t)/gm,"").replace(/   /g, '')
        var diff = jsdiff.diffWords(last.htmls[0].html, current);
        // If there's a difference, add the html to the db
        if(diff.length > 1){
          Page.findOne({'user': user, 'url': url},'htmls',function (err, doc) {
            if (err) return console.log(err);
            doc.htmls.push({ html: current });
            doc.save(function (err) {
              if (err) res.send(err);
              console.log("Changes detected! New html file saved!")
            });
          })
        } else {
          // console.log('No changes')
        }
      })
    });
  }, time * 1000);
}

// // Get specific words of a string: NOT IN USE FOR NOW
// function beforeWords(theString, before) {
//   expString = theString.split(/\s+/ )
//   expString = expString.slice(expString.length-before,expString.length).join(" ");
//   return expString;
// }
//
// function afterWords(theString, after) {
//   expString = theString.split(/\s+/ ).slice(0,after).join(" ");
//   return expString;
// }

module.exports = setScrapeTime;
