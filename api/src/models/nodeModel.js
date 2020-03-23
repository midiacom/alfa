var mongoose = require('mongoose');

var Schema   = mongoose.Schema;

var nodesSchema = new Schema({
	'name' : String,
    'description' : String  
},{
  timestamps: true
});

module.exports = mongoose.model('node', nodesSchema);
