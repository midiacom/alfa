const locationModel = require("../models/locationModel")
const deviceModel = require("../models/deviceModel")

const locationController = {
    list: (req, res, next) => {
        locationModel.find() 
            .select('name')
            .then(locations => {
                return res.status(201).json(locations);
            })
            .catch(err => {
                /* istanbul ignore next */ 
                return res.status(422).send(err.errors);
            });        
    },
        
    get: (req, res, next) => {
        let id = req.params.id;
        locationModel.findById(id)
            .then(location => {
                return res.status(201).json(location);
            })
            .catch(err => {
                /* istanbul ignore next */ 
                return res.status(422).send(err.errors);
            });                    
    },
    
    post: (req, res, next) => {
        const location = new locationModel({
            name: req.body.name,
            description: req.body.description
        })                
        
        location.save((err,location) => {
            /* istanbul ignore next */ 
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating location',
                    error: err
                });
            }
            return res.status(201).json(location);
        })
    },
    
    put: (req, res, next) => {
        var id = req.params.id;
        locationModel.findById(id)
        .populate('locations')
        .exec()
        .then((location) => {
            if (!location) {
                return res.status(404).send()
            }

            location.name = req.body.name
            location.description = req.body.description

            location.save(function (err, location) {
                /* istanbul ignore next */ 
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating location.',
                        error: err
                    });
                }
                return res.status(201).json(location);
            })
        })
    },
    
    delete: (req, res, next) => {
        let id = req.params.id;
        locationModel.deleteOne({_id: id},function(err, location){
            /* istanbul ignore next */ 
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting location.',
                    error: err
                });
            }
            return res.status(201).json(location);
        })
    },

    devices: (req, res, next) => {
        let id = req.params.id;
        deviceModel.find({'location': id})
        .exec()
        .then((devices) => {
            return res.status(201).json(devices)
        })
        .catch(err => {
            /* istanbul ignore next */ 
            return res.status(422).send(err.errors);
        });        
    }
}    
module.exports = locationController