var mongoose = require('mongoose');
var locationModel = require('./locationModel')

var Schema   = mongoose.Schema;

var devicesSchema = new Schema({
	'name' : String,
    'description' : String,
    'location': {
        type: Schema.Types.ObjectId,
        ref: 'location',
        required: true        
    }
},{
  timestamps: true
});

module.exports = mongoose.model('device', devicesSchema);
