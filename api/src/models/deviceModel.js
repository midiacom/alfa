var mongoose = require('mongoose');
var locationModel = require('./locationModel')

var Schema   = mongoose.Schema;

var devicesSchema = new Schema({
	'name' : String,
  'description' : String, 
  'physicalPath' : String,  // it is the place when de device is connected locally /dev/video for example
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
  },
  'dockerId' : String 
},{
  timestamps: true
});

module.exports = mongoose.model('device', devicesSchema);
