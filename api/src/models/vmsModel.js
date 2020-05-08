var mongoose = require('mongoose');
var vmsTypeModel = require('./vmsTypeModel')
var deviceModel = require('./deviceModel')
var nodeModel = require('./nodeModel')

var Schema   = mongoose.Schema;

var vmsSchema = new Schema({
    'startupParameters' : String,
    'name' : String,
    'nameMonitor' : String,
    'dockerId' : String,
    'node': {
        type: Schema.Types.ObjectId,
        ref: 'node',
        required: true
    },
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
    },
    'monitor': [{
        'senderip': String,
        'senderport': String,
        'toip': String,
        'toport': String,
        'milsec': Number,
        'bs': Number,
        'ps': Number,
        'timestamp': Date,
        'totalbytes': Number,
        'totalpackage': Number
    }]
},{
  timestamps: true
});

module.exports = mongoose.model('vms', vmsSchema);