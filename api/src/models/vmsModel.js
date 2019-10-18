var mongoose = require('mongoose');
var vmsTypeModel = require('./vmsTypeModel')
var deviceModel = require('./deviceModel')

var Schema   = mongoose.Schema;

var vmsSchema = new Schema({
    'startupParameters' : String,
    'name' : String,
    'dockerId' : String,
    'bindedTo': [
        {
            device: {
                type: Schema.Types.ObjectId,
                ref: 'device'
            },
            port: Number
        }
    ],
    'vmsType': {
        type: Schema.Types.ObjectId,
        ref: 'vmsType',
        required: true
    }
},{
  timestamps: true
});

module.exports = mongoose.model('vms', vmsSchema);