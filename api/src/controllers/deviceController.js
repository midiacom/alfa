const deviceModel = require("../models/deviceModel")
const locationModel = require("../models/locationModel")

const deviceController = {
    list: (req, res, next) => {
        deviceModel.find() 
            .select('name type location')
            .populate('location')
            .exec()
            .then(devices => {
                return res.status(201).json(devices);
            })
            .catch(err => {
                /* istanbul ignore next */ 
                return res.status(422).send(err.errors);
            });        
    },
        
    get: (req, res, next) => {
        let id = req.params.id;
        deviceModel.findById(id)
            .then(device => {
                return res.status(201).json(device);
            })
            .catch(err => {
                /* istanbul ignore next */ 
                return res.status(422).send(err.errors);
            });                    
    },
    
    post: (req, res, next) => {
        const device = new deviceModel({
            name: req.body.name,
            connectionType: req.body.connectionType,
            connectionParameters: req.body.connectionParameters,
            description: req.body.description,
            location: req.body.location
        })
        
        device.save((err,device) => {
            /* istanbul ignore next */ 
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating device',
                    error: err
                });
            }
            return res.status(201).json(device);
        })
    },
    
    put: (req, res, next) => {
        var id = req.params.id;
        deviceModel.findById(id)
        .populate('devices')
        .exec()
        .then((device) => {
            if (!device) {
                return res.status(404).send()
            }

            device.name = req.body.name
            device.connectionType = req.body.connectionType
            device.connectionParameters = req.body.connectionParameters
            device.description = req.body.description
            device.location = req.body.location

            device.save(function (err, device) {
                /* istanbul ignore next */ 
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating device.',
                        error: err
                    });
                }
                return res.status(201).json(device);
            })
        })
    },
    
    delete: (req, res, next) => {
        let id = req.params.id;
        deviceModel.deleteOne({_id: id},function(err, device){
            /* istanbul ignore next */ 
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting device.',
                    error: err
                });
            }
            return res.status(201).json(device);
        })
    }
}    
module.exports = deviceController