const deviceModel = require("../models/deviceModel")
const locationModel = require("../models/locationModel")
const docker = require("../util/dockerApi")

const deviceController = {

    /**
     * stopSrc
     * 
     * This funcion will stop the container that was connected to the
     * source device. It's independet if the device was locally or remote
     */
    stopSrc: (req, res, next) => {
        // the id of the device that will be started
        let id = req.params.id;
        
        deviceModel.findById(id)
            .populate('node')
            .exec()
            .then(device => {
                docker.api(device.node.ip)
                .then((api) => {
                  let container = api.getContainer(device.dockerId);
                  container.inspect(function (err, data) {
                    // if the container is running then stop it
                    if (data) {
                        if (data.State.Running) {
                          container.stop(function (err, data) {
                              container.remove()
                          });
                        }
                    }
                    device.dockerId = "";
                    const d = device.save()
                    return res.status(201).json(d)
                  });
                })
            }).catch(function(err) {
                /* istanbul ignore next */
                return res.status(422).send(err);
            }).catch(function(err) {
                /* istanbul ignore next */
                return res.status(422).send(err);
            });
    },

    /**
     * startSrc
     * 
     * This funcion will start a container that will connected to the
     * source device, the VMS will collect data from the sources.
     */
    startSrc: (req, res, next) => {
        // the id of the device that will be started
        // console.log("a")
        let id = req.params.id;
        deviceModel.findById(id)
            .populate('node')
            .exec()
            .then(device => {
                let createParameters = {}
                createParameters.Image = device.connectionType
                createParameters.Cmd = [`${device.id} ${device.connectionParameters}`]

                // if there is a physicalPath then add it to Devices options
                // it will mapp the local device inside the container
                if (device.physicalPath) {
                    createParameters.HostConfig = {
                        NetworkMode: process.env.DOCKER_OVERLAY_NETWORK,
                        Devices: [{
                            PathOnHost: device.physicalPath,
                            PathInContainer: device.physicalPath,
                            CgroupPermissions: "rwm"                        
                        }]                    
                    }
                } else {
                    createParameters.HostConfig = {
                        NetworkMode: process.env.DOCKER_OVERLAY_NETWORK,
                    }
                }

                docker.api(device.node.ip)
                    .then((api) => {
                        api.createContainer(createParameters).then(function(container) {
                            container.start()
                            .then((data) => {
                                device.dockerId = data.id
                                device.save()
                                return res.status(201).json(data)
                            }).catch(function(err) {
                                // console.log('1')
                                console.log(err)
                                /* istanbul ignore next */
                                return res.status(422).send(err);
                            });
                        }).catch(function(err) {
                            /* istanbul ignore next */
                            // console.log("2")
                            console.log(err)
                            return res.status(422).send(err);
                        });
                    }).catch(function(err) {
                        /* istanbul ignore next */
                        // console.log("3")
                        console.log(err)
                        return res.status(422).send(err);
                    });
                })
                .catch(err => {
                    /* istanbul ignore next */
                    // console.log("3")
                    console.log(err)
                    console.log("Edge Node Offline")
                    return res.status(422).send(`${err.errors} Edge Node offline`);
                });
    },

    list: (req, res, next) => {
        deviceModel.find() 
            .select('name type location connectionType dockerId')
            .populate('location')
            .populate('node')
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
            .populate('node')
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
            physicalPath: req.body.physicalPath,
            connectionParameters: req.body.connectionParameters,
            description: req.body.description,
            location: req.body.location,
            node: req.body.node,
            outputType: req.body.outputType
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
            device.physicalPath = req.body.physicalPath
            device.connectionParameters = req.body.connectionParameters
            device.description = req.body.description
            device.location = req.body.location
            device.node = req.body.node
            device.outputType = req.body.outputType
            
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
    },



    getContainerDetails: (req, res, next) => {
        let id = req.params.id;
  
        deviceModel.findById(id)
            .populate('node')
            .then(device => {          
              docker.api(device.node.ip)
              .then((api) => {
                let id = device.dockerId;
                var opts = {
                  "filters": `{"id": ["${id}"]}`
                }
                api.listContainers(opts, function (err, container) {
                  return res.status(201).json(container);
                });
              })     
            })
            .catch(err => {
                /* istanbul ignore next */ 
                return res.status(422).send(err.errors);
            });
    },

    getLog: (req, res, next) => {
        let id = req.params.id;
        deviceModel.findById(id)
            .populate('node')
            .exec()
            .then(device => {        
                if (!device) {
                    return res.status(422).send(`Device with id ${id} not found!`);
                }            
                docker.api(device.node.ip)
                .then((api) => {
                    let container = api.getContainer(device.dockerId)
                    // console.log(container)
                    container.logs({stdout: true, stderr: true}, function (err, data) {
                        if (err) {
                            return res.status(422).json({
                                message: 'Container not running or created anymore.',
                                error: err
                            });
                        }
                        return res.status(201).json(data)  
                    })
                })
                .catch(err => {          
                    return res.status(422).send(err.errors);
                });        
            })
            .catch(err => {
                return res.status(422).send(err.errors);
            });
        }    
}    
module.exports = deviceController