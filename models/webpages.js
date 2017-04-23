var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Webpage = new Schema({
  url: {
    type: String,
    trim: true
  },
  date: {
    type: String,
    trim: true
  }
})

Webpage.plugin(passportLocalMongoose);

module.exports = mongoose.model('Webpage', Webpage);
