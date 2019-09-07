var mongoose = require('mongoose');
var locationModel = require('./locationModel')

var Schema   = mongoose.Schema;

var devicesSchema = new Schema({
	'name' : String,
  'description' : String, 
  'connectionType': {
    type: String,
    required: true
  },
  'connectionParameters': {
    type: String,
    required: true,
  },
  'location': {
      type: Schema.Types.ObjectId,
      ref: 'location',
      required: true        
  }
},{
  timestamps: true
});

module.exports = mongoose.model('device', devicesSchema);
