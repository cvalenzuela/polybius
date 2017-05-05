var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var htmlVersions = new Schema({ html: String });

var pagesSchema = new Schema({
    user: String,
    name: String,
    url: String,
    type: String,
    status: String,
    tracking: Boolean,
    time: String,
    until: String,
    htmls: [htmlVersions]
});

module.exports = mongoose.model('Page', pagesSchema);
