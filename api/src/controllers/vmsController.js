const vmsModel = require("../models/vmsModel")
const vmsTypeModel = require("../models/vmsTypeModel")
const docker = require("../util/dockerApi")
var mqtt = require('mqtt')

const vmsController = {
    getType: (req, res, next) => {
      var id = req.params.id;
      vmsModel.findById(id)
      .populate('vmsType')
      .exec()
      .then((result) => {
          if (!result) {
              return res.status(404).send()
          }          
          return res.status(201).json(result.vmsType);
      })
    },

    // start and recreate a VMS
    // here we unbind a SRC if it was binded
    post: (req, res, next) => {

      let nodeIp = req.body.nodeIp; // retrive the actual ip

      docker.api(nodeIp)
        .then((api) => {
          let vmsType = req.body.vmsType;
          let startupParameters = req.body.startupParameters;
          let id = req.body.id;

          vmsTypeModel.findById(vmsType)
            .then((result) => {
              api.createContainer({
                Image: result.dockerImage,
                Cmd: [startupParameters],
                HostConfig: {
                  NetworkMode: process.env.DOCKER_OVERLAY_NETWORK
                }
              }).then(function(container) {
                container.start()
                .then((data) => { 
                  // create a new VMS      
                  if (!id) {
                    let vms = new vmsModel({
                      name: req.body.name,
                      dockerId: data.id,
                      startupParameters: startupParameters,
                      vmsType: vmsType,
                      node: req.body.node,
                      bindedTo: []
                    })      

                    // save
                    vms.save((err,vms) => {
                      /* istanbul ignore next */ 
                      if (err) {
                        console.log(err)
                          return res.status(500).json({
                              message: 'Error when creating vmsType',
                              error: err
                          });
                      }
                      return res.status(201).json(vms)
                    })
                  } else {
                    // restart and update the dockerId
                    vmsModel.findById(id)
                    .then((vms) => {
                      vms.dockerId = data.id
                      vms.startupParameters = req.body.startupParameters
                      vms.bindedTo = []
                      // update
                      vms.save((err,vms) => {
                        /* istanbul ignore next */ 
                        if (err) {
                            return res.status(500).json({
                                message: 'Error when creating vmsType',
                                error: err
                            });
                        }
                        return res.status(201).json(vms)
                      })                                 
                    })
                    .catch(err => {
                      /* istanbul ignore next */ 
                      console.log(err)
                      return res.status(422).send(err.errors);
                    });
                  }
       
                }).catch(function(err) {
                  /* istanbul ignore next */ 
                  console.log('1')
                  console.log(err)
                  return res.status(422).send(err);
                });
              }).catch(function(err) {
                /* istanbul ignore next */ 
                console.log('2')
                console.log(err)
                return res.status(422).send(err);
              });
            })
            .catch(err => {
              /* istanbul ignore next */ 
              console.log('3')
              console.log(err)
              return res.status(422).send(err.errors);
            });
        });
    },

    async list (req, res, next) {
      let cont = [];
      await vmsModel.find()
      .populate('vmsType')
      .populate('node')
      .then((vmss) => {
        return res.status(201).json(vmss);         
      })
      .catch(err => {
          /* istanbul ignore next */ 
          return res.status(422).send(err.errors);
      });
    },
    
    /*
    async list (req, res, next) {
      let cont = []
      docker.api()
        .then((api) => {
          api.listContainers(async function (err, containers) {
            const promises = containers.map(async function (containerInfo) {
                await vmsModel.findOne({
                  'dockerId': containerInfo.Id
                })
                .populate('vmsType')
                .exec()
                .then((res) => {
                  if (res) {
                    let vmsInfo = {
                      '_id': res.id,
                      'name': res.name,
                      'containerId': res.dockerId,
                      'startupParameters': res.startupParameters,
                      'containerInfo': containerInfo,
                      'vmsType': res.vmsType.name,
                      'sdp': res.vmsType.sdp,
                      'bindedTo': res.bindedTo
                    }

                    // console.log(res.bindedTo)
                    
                    cont.push(vmsInfo)
                  }
                })
                .catch(err => {
                  return res.status(422).send(err.errors);
                });
              });              
              await Promise.all(promises);
              return res.status(201).json(cont);
        });
      })        
    },
    */
          
    get: (req, res, next) => {
      let id = req.params.id;
      vmsModel.findById(id)
          .populate("node")
          .then(vms => {
              return res.status(201).json(vms);
          })
          .catch(err => {
              /* istanbul ignore next */ 
              return res.status(422).send(err.errors);
          });                    
    },

    getContainerDetails: (req, res, next) => {
      let id = req.params.id;

      vmsModel.findById(id)
          .populate('node')
          .then(vms => {          
            docker.api(vms.node.ip)
            .then((api) => {
              let id = vms.dockerId;
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

    stopVms: (req, res, next) => {
      let id = req.params.id;
      vmsModel.findById(id)
        .populate('node')
        .then((vms) => {
          if (!vms) {
            return res.status(422).send(`VMS with id ${id} not found!`);
          }
          docker.api(vms.node.ip)
            .then((api) => {
              let container = api.getContainer(vms.dockerId);

              container.inspect(function (err, data) {
                // if the container is running then stop it
                if (data) {
                  if (data.State.Running) {
                    container.stop(function (err, data) {
                      container.remove()
                    });
                    return res.status(201).json(vms);
                  }
                } else {
                  return res.status(201).json({"ok":"ok"});
                }
              });
            })
      })
      .catch(err => {
        /* istanbul ignore next */ 
        return res.status(422).send(err.errors);
      });
    },

    delete: (req, res, next) => {
      let id = req.params.id;
      vmsModel.findById(id)
        .then((vms) => {
          if (!vms) {
            return res.status(422).send(`VMS with id ${id} not found!`);
          }
          vmsModel.deleteOne({_id: id},function(err){
              /* istanbul ignore next */ 
              if (err) {
                  return res.status(500).json({
                      message: 'Error when deleting vmsType.',
                      error: err
                  });
              }

              docker.api()
                .then((api) => {
                  let container = api.getContainer(vms.dockerId);

                  container.inspect(function (err, data) {
                    // if the container is running then stop it
                    if (data) {
                      if (data.State.Running) {
                        container.stop(function (err, data) {
                          container.remove()
                        });
                      }
                    }
                  });
                })
              return res.status(201).json(vms);
          })
        })
  },

  unbindSrc: (req, res, next) => {

    let vmsId = req.params.vmsId;
    let deviceId = req.params.deviceId;
    let port = req.params.port;

    vmsModel.findById(vmsId)
      .populate('bindedTo.device')
      .then(vms => {
        // console.log(vms.bindedTo[0].device)
        // return;
        var client  = mqtt.connect(process.env.MQTT_SERVER) 
        client.on('connect', function () {
          client.subscribe(deviceId, function (err) {
            if (!err) {
              // the ip is fixed because it is independent in this situation, to remove we need only
              // the deviceId to MQTT topic 
              // the port is unecessary to 
              // the id of VMS was used as name of the queue and it will be removes 
              let aux_name = port.concat(vms.dockerId.substring(0,11).replace(/[a-z]/g, '')).substring(0,11)
              client.publish(deviceId, `192.168.0.1;5000;${aux_name};R`)

              // remove from the binded list in mongoDB
              vms.bindedTo = vms.bindedTo.filter(function(el){
                return el.port != port
              })

              vms.save((err,vms) => {
                /* istanbul ignore next */
                if (err) {
                  console.log(err)
                    return res.status(500).json({
                        message: 'Error when creating vmsType',
                        error: err
                    });
                }
                return res.status(201).json({"ok":"ok"});
              })
            } else {
              console.log(err)
              return res.status(422).send(err);
            }
          })
        })        
        // console.log(vms)
        // return res.status(201).json(vms);
      })
      .catch(err => {
          /* istanbul ignore next */ 
          return res.status(422).send(err.errors);
      });    

    // console.log(vmsId)
    // console.log(deviceId)
    // console.log(port)
  },

  put: (req, res, next) => {
    var id = req.params.id;
    vmsModel.findById(id)
      .exec()
      .then((vms) => {
          if (!vms) {
              return res.status(404).send()
          }


          vms.name = req.body.name        
          vms.startupParameters = req.body.startupParameters
          vms.node = req.body.node

          vms.save(function (err, node) {
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

  bindSrc: (req, res, next) => {

    let vmsId = req.params.vmsId;
    let deviceId = req.params.deviceId;
    let port = req.params.port;

    vmsModel.findById(vmsId)
      .populate("node")
      .then((vms) => {
      // 1 - Get the ip of the container's VMS
      docker.api(vms.node.ip)
      .then((api) => {
        let container = api.getContainer(vms.dockerId);
        container.inspect(function (err, data) {
          // console.log(data.NetworkSettings.Networks[process.env.DOCKER_OVERLAY_NETWORK].IPAddress)
          let ipDockerContainer = data.NetworkSettings.Networks[process.env.DOCKER_OVERLAY_NETWORK].IPAddress;
          var client  = mqtt.connect(process.env.MQTT_SERVER) 
          client.on('connect', function () {
            client.subscribe(deviceId, function (err) {
              if (!err) {
                // 2 - Send to MQQT the IP and PORT of this VMS, it will be published 
                // the dockerId is used to identify the gstremaer pipeline 
                // the letter A is used to identify if it is to insert or R to remove the elemente
                // from the pipeline
                // in a topic with the name of the device ID
                // it's to remove the letters from the id because the gstreamer cant use letters and numbers as
                // name os an element, furthermore
                //let aux_name = vms.dockerId.substring(0,11).replace(/[a-z]/g, '').concat(port).substring(0,11)
                let aux_name = port.concat(vms.dockerId.substring(0,11).replace(/[a-z]/g, '')).substring(0,11)
                client.publish(deviceId, `${ipDockerContainer};${port};${aux_name};A`)
                
                vms.bindedTo.push({
                  device: deviceId,
                  port: port
                });

                vms.save((err,vms) => {
                  /* istanbul ignore next */                   
                  if (err) {
                    console.log(err)
                      return res.status(500).json({
                          message: 'Error when creating vmsType',
                          error: err
                      });
                  }
                })
                return res.status(201).json({"ok":"ok"});
              } else {
                console.log(err)
              }
            })
          })
        });
      })
    })
  }
}

module.exports = vmsController