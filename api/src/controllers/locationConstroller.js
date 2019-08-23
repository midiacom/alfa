const locationModel = require("../models/locationModel")

const locationRoutes = {
    list: (req, res, next) => {
        locationModel.find() 
            .select('name')
            .then(locations => {
                res.status(201).json(locations);
            })
            .catch(err => {
                res.status(422).send(err.errors);
            });        
    },
        
    get: (req, res, next) => {
        let id = req.params.id;
        locationModel.findById(id)
            .then(location => {
                res.status(201).json(location);
            })
            .catch(err => {
                res.status(422).send(err.errors);
            });                    
    },
    
    post: (req, res, next) => {
        const location = new locationModel({
            name: req.body.name,
            description: req.body.description
        })                
        
        location.save((err,location) => {
            if (err) {
                res.status(500).json({
                    message: 'Error when creating location',
                    error: err
                });
            }
            res.status(201).json(location);
        })
    },
    
    put: (req, res, next) => {
        var id = req.params.id;
        locationModel.findById(id)
        .populate('locations')
        .exec()
        .then((location) => {
            if (!location) {
                res.status(404).send()
            }

            location.name = req.body.name
            location.description = req.body.description

            location.save(function (err, location) {
                if (err) {
                    res.status(500).json({
                        message: 'Error when updating location.',
                        error: err
                    });
                }
                res.json(location);
            })
        })
    },
    
    delete: (req, res, next) => {
        let id = req.params.id;
        locationModel.remove({_id: id},function(err, location){
            if (err) {
                res.status(500).json({
                    message: 'Error when deleting location.',
                    error: err
                });
            }
            res.json(location);
        })
    }
}    
module.exports = locationRoutes