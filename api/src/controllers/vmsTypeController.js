const vmsTypeModel = require("../models/vmsTypeModel")

const vmsTypeController = {
    list: (req, res, next) => {
        vmsTypeModel.find() 
            .select('name dockerImage')
            .then(vmsTypes => {
                return res.status(201).json(vmsTypes);
            })
            .catch(err => {
                /* istanbul ignore next */ 
                return res.status(422).send(err.errors);
            });        
    },
        
    get: (req, res, next) => {
        let id = req.params.id;
        vmsTypeModel.findById(id)
            .then(vmsType => {
                return res.status(201).json(vmsType);
            })
            .catch(err => {
                /* istanbul ignore next */ 
                return res.status(422).send(err.errors);
            });                    
    },
    
    post: (req, res, next) => {
        const vmsType = new vmsTypeModel({
            name: req.body.name,
            dockerImage: req.body.dockerImage,
            startupParameters: req.body.startupParameters,
            description: req.body.description
        })                
        
        vmsType.save((err,vmsType) => {
            /* istanbul ignore next */ 
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating vmsType',
                    error: err
                });
            }
            return res.status(201).json(vmsType);
        })
    },
    
    put: (req, res, next) => {
        var id = req.params.id;
        vmsTypeModel.findById(id)
        .populate('vmsTypes')
        .exec()
        .then((vmsType) => {
            if (!vmsType) {
                return res.status(404).send()
            }

            vmsType.name = req.body.name
            vmsType.dockerImage = req.body.dockerImage
            vmsType.startupParameters = req.body.startupParameters
            vmsType.description = req.body.description

            vmsType.save(function (err, vmsType) {
                /* istanbul ignore next */ 
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating vmsType.',
                        error: err
                    });
                }
                return res.status(201).json(vmsType);
            })
        })
    },
    
    delete: (req, res, next) => {
        let id = req.params.id;
        vmsTypeModel.deleteOne({_id: id},function(err, vmsType){
            /* istanbul ignore next */ 
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting vmsType.',
                    error: err
                });
            }
            return res.status(201).json(vmsType);
        })
    },
}    
module.exports = vmsTypeController