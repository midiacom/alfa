var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var vmsTypeSchema = new Schema({
	'name' : String,
	'dockerImage': String,
	'description' : String,
},{
  timestamps: true
});

module.exports = mongoose.model('vmsType', vmsTypeSchema);
