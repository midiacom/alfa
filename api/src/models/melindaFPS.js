var mongoose = require('mongoose');

var Schema   = mongoose.Schema;

var melindaFPSSchema = new Schema({
    'FPS' : String,
    'vmsType': {
        type: Schema.Types.ObjectId,
        ref: 'vmsType',
        required: true
    },
    'node': {
        type: Schema.Types.ObjectId,
        ref: 'node',
        required: true
    },    
},{
  timestamps: true
});

module.exports = mongoose.model('melindaFPS', melindaFPSSchema);