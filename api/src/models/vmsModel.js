var mongoose = require('mongoose');
var vmsTypeModel = require('./vmsTypeModel')

var Schema   = mongoose.Schema;

var vmsSchema = new Schema({
    'startupParameters' : String,
    'dockerId' : String,
    'vmsType': {
        type: Schema.Types.ObjectId,
        ref: 'vmsType',
        required: true
    }
},{
  timestamps: true
});

module.exports = mongoose.model('vms', vmsSchema);