const nodeModel = require("../models/nodeModel")
const docker = require("../util/dockerApi")

const nodeController = {

    getEdgeNodeImages: (req, res, next) => {
        let nodeIp = req.params.nodeIp; // retrieve the actual ip      
        docker.api(nodeIp)
        .then((api) => {
            var opts = {"filters": `{}`}
            api.listImages(opts, function (err, images) {
                console.log(images)
                let img = []
                for(let i = 0; i < images.length; i++) {
                    if (images[i].RepoTags[0].indexOf('alfa/') == 0){
                        img.push({
                            id: images[i].Id,
                            image: images[i].RepoTags[0]
                        })
                    }
                }

                return res.status(201).json(img);
            });
        })     
        .catch(err => {
            /* istanbul ignore next */ 
            return res.status(422).send(err.errors);
        });
    },
        
    list: (req, res, next) => {
        nodeModel.find() 
            .select(['name','ip'])
            .then(nodes => {
                return res.status(201).json(nodes);
            })
            .catch(err => {
                /* istanbul ignore next */ 
                return res.status(422).send(err.errors);
            });        
    },
        
    get: (req, res, next) => {
        let id = req.params.id;
        nodeModel.findById(id)
            .then(node => {
                return res.status(201).json(node);
            })
            .catch(err => {
                /* istanbul ignore next */ 
                return res.status(422).send(err.errors);
            });                    
    },
    
    post: (req, res, next) => {
        const node = new nodeModel({
            name: req.body.name,
            ip: req.body.ip,
            description: req.body.description
        })                
        
        node.save((err,node) => {
            /* istanbul ignore next */ 
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating node',
                    error: err
                });
            }
            return res.status(201).json(node);
        })
    },
    
    put: (req, res, next) => {
        var id = req.params.id;
        nodeModel.findById(id)
        .populate('nodes')
        .exec()
        .then((node) => {
            if (!node) {
                return res.status(404).send()
            }

            node.name = req.body.name
            node.ip = req.body.ip
            node.description = req.body.description

            node.save(function (err, node) {
                /* istanbul ignore next */ 
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating node.',
                        error: err
                    });
                }
                return res.status(201).json(node);
            })
        })
    },
    
    delete: (req, res, next) => {
        let id = req.params.id;
        nodeModel.deleteOne({_id: id},function(err, node){
            /* istanbul ignore next */ 
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting node.',
                    error: err
                });
            }
            return res.status(201).json(node);
        })
    },

    devices: (req, res, next) => {
        let id = req.params.id;
        deviceModel.find({'node': id})
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
module.exports = nodeController