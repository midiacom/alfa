var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var vmsTypeSchema = new Schema({
	'name' : String,
	'dockerImage': String,
	'description' : String,
	'startupParameters' : String,
	'src' : Number,
	'sdp' : String,
	'ports' : String
},{
  timestamps: true
});

module.exports = mongoose.model('vmsType', vmsTypeSchema);
