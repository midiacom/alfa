var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var locationsSchema = new Schema({
	'name' : String,
	'description' : String,
},{
  timestamps: true
});

module.exports = mongoose.model('location', locationsSchema);
