const nodeModel = require("../models/nodeModel")
const docker = require("../util/dockerApi")

const nodeController = {

    /**
     * nodeSelection: This module will return in which edge node a virtual node will run.
     * The selection will be made by a Resource Allocation.
    */
    nodeSelection: async (req, res, next) => {
        let virtualNodeType = req.params.vnt; // it is the image of a VMS or a SRC
        let resourceAllocationManager = req.params.ra; // it define the RA method
        let params = req.body; // the set of parameters to each RA method
        
        // get all up and running edge nodes nodes that has the image
        let where = {
            "$and": [{
                'images': { $regex: '.*' + virtualNodeType + '.*' },
                'online': true
            }]
        }

        let nodes = await nodeModel.find(where)
            .select(['name','ip'])
            .then(nodes => {
                return nodes;
            })

        payload = {
            'nodes': nodes,
            params
        }

        // console.log(payload)
        // console.log(nodes)

        // call the function that will make the decision
        const ra = require(`./node/${resourceAllocationManager}`)
        let ip = ra.run(payload)

        return res.status(201).json(ip);
    },

    getEdgeNodeImages: (req, res, next) => {
        let nodeIp = req.params.nodeIp; // retrieve the actual ip      
        docker.api(nodeIp)
        .then((api) => {
            var opts = {"filters": `{}`}
            api.listImages(opts, function (err, images) {
                
                if (err) {
                    return res.status(500).json({
                        message: 'Error when listing images',
                        error: err
                    });
                }

                let img = []
                let imgName = []
                for(let i = 0; i < images.length; i++) {
                    if (images[i].RepoTags[0].indexOf('alfa/') == 0){
                        img.push({
                            id: images[i].Id,
                            image: images[i].RepoTags[0]
                        })
                        imgName.push(images[i].RepoTags[0])
                    }
                }

                // update the image list
                nodeModel.findOne({
                    'ip': nodeIp
                })
                .exec()
                .then((node) => {
                    if (!node) {
                        console.log('erro')
                    } else {
                        node.images = imgName    
                        node.save(function (err, node) {
                        })
                    }
                })
                .catch(err => {
                    /* istanbul ignore next */ 
                    console.log(err)
                });           

                return res.status(201).json(img);
            });
        })     
        .catch(err => {
            /* istanbul ignore next */ 
            return res.status(422).send(err.errors);
        });
    },

    updateNdgeNodeStatus: async () => {
        nodeModel.find({'isMaster': true})
        .then((masterNode) => {
            nodeModel.find()
            .exec()
            .then((slaveNodes) => {
                if (!slaveNodes){
                    console.log('Error: nodes not found');
                }
                slaveNodes.forEach(function(node){
                    docker.api(masterNode[0].ip)
                    .then((api) => {   
                        let nodeDocker = api.getNode(node.dockerId);
                        var opts = {"filters": `{}`}
                        nodeDocker.inspect()
                        .then((status) => {
                            if (status.Status.State == 'down') {
                                node.online = false
                            } else {
                                node.online = true 
                            }
                            // save the status of the edge node
                            node.save()                            
                        })     
                        .catch(err => {
                            console.log(err)
                        });
                    })     
                    .catch(err => {
                        console.log(err)
                    });        
                    })
            })
        }) 
    },

    getEdgeNodeStatus: async (req, res, next) => {
        let id = req.params.id;
        nodeModel.find({'isMaster': true})
        .then((masterNode) => {
            nodeModel.findById(id)
                .then(slaveNode => {
                    docker.api(masterNode[0].ip)
                    .then((api) => {   
                        let nodeDocker = api.getNode(slaveNode.dockerId);
                        var opts = {"filters": `{}`}
                        nodeDocker.inspect()
                        .then((status) => {                           
                            return res.status(201).json(status);
                        })     
                        .catch(err => {
                            /* istanbul ignore next */ 
                            console.log(err)
                            return res.status(422).send(err.errors);
                        });
                    })     
                    .catch(err => {
                        /* istanbul ignore next */ 
                        console.log(err)
                        return res.status(422).send(err.errors);
                    });        
                })
                .catch(err => {
                    /* istanbul ignore next */ 
                    return res.status(422).send(err.errors);
                });
        }) 
    },
        
    list: (req, res, next) => {
        nodeModel.find() 
            .select(['name','ip', 'online'])
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
            isMaster: req.body.isMaster,
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
            node.dockerId = req.body.dockerId
            node.isMaster = req.body.isMaster
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