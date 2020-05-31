var mongoose = require('mongoose');
var locationModel = require('./locationModel')
var nodeModel = require('./nodeModel')
var Schema   = mongoose.Schema;

var devicesSchema = new Schema({
	'name' : String,
  'description' : String, 
  'physicalPath' : String,  // it is the place when de device is connected locally /dev/video for example
  'connectionParameters': String,
  'outputType': {
    type: String,
    required: true
  },
  'node': {
    type: Schema.Types.ObjectId,
    ref: 'node',
    required: true
  },  
  'connectionType': {
    type: String,
    required: true
  },
  'location': {
    type: Schema.Types.ObjectId,
    ref: 'location',
    required: true        
  },
  'dockerId' : { // define which container docker is access this device, if null it means that the device is stopped 
    type: String,
    default: ""
  }
},{
  timestamps: true
});

module.exports = mongoose.model('device', devicesSchema);
