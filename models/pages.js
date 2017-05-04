var mongoose = require('mongoose');

var pagesSchema = mongoose.Schema({
    user: String,
    name: String,
    url: String,
    type: String,
    status: String,
    tracking: Boolean,
    until: String,
    text: String
});

module.exports = mongoose.model('Page', pagesSchema);
