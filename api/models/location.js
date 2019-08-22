var mongoose = require('mongoose');

var Schema   = mongoose.Schema;

var prospectSchema = new Schema({
  'name' : String,
},{
  timestamps: true
});

module.exports = mongoose.model('location', prospectSchema);