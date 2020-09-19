const vmsModel = require("../models/vmsModel")
const nodeModel = require("../models/nodeModel")
const vmsTypeModel = require("../models/vmsTypeModel")
const docker = require("../util/dockerApi")
const nodeController = require("./nodeController")
const maestroControllerAux = require("./maestro/aux")
const ra = require('./node/ra');
const cron = require('./node/cron');
const mqtt = require('mqtt')
const path = require('path');
const fs = require('fs')
const crypto = require('crypto')
const { isArray } = require("util")

const vmsController = {

  remFoward: (req, res, next) => {    
    id = req.params.vmsId
    forwardId = req.params.forwardId
    vmsModel.findById(id)
      .exec()
      .then((vms) => {
          if (!vms) {
              return res.status(404).send()
          }

          let p = -1
          for (var i = 0; i < vms.forward.length; i++) {
            var element = vms.forward[i]            
            if (element._id == forwardId) {
              p = i
              let aux = element
              var client  = mqtt.connect(process.env.MQTT_SERVER)                          
              client.on('connect', function () {              
                client.subscribe(vms.nameMonitor, function (err) {
                  if (!err) {       
                  let mqtt_add_string = `${aux.ip};${aux.port};${vms.nameMonitor};R`
                    client.publish(vms.nameMonitor, mqtt_add_string)
                  } else {
                    console.log(err);
                  }
                })
              })
              break
            }
          }

          if (p >= 0) {
            vms.forward.splice(p,1)
          }

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

  // ----
  addFoward: (req, res, next) => {
    id = req.body.vmsId
    vmsModel.findById(id)
      .exec()
      .then((vms) => {
          if (!vms) {
              return res.status(404).send()
          }

          // send to MQTT
          var client  = mqtt.connect(process.env.MQTT_SERVER)
          
          client.on('connect', function () {              
            client.subscribe(vms.nameMonitor, function (err) {
              if (!err) {       
                let mqtt_add_string =    `${req.body.ip};${req.body.port};${vms.nameMonitor};A`
                client.publish(vms.nameMonitor, mqtt_add_string)
              } else {
                console.log(err);
              }
            })
          })
          // ----------

          vms.forward.push({
            ip: req.body.ip,
            port: req.body.port
          })

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

    getLog: (req, res, next) => {
      let id = req.params.id;
      vmsModel.findById(id)
        .populate('node')
        .then((vms) => {
          if (!vms) {
            return res.status(422).send(`VMS with id ${id} not found!`);
          }
          docker.api(vms.node.ip)
            .then((api) => {
              let container = api.getContainer(vms.dockerId)
              // console.log(container)
              container.logs({stdout: true, stderr: true}, function (err, data) {
                console.log(err);
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
              // console.log(err);              
              console.log('b');
              return res.status(422).send(err.errors);
            });        
      })
      .catch(err => {
        return res.status(422).send(err.errors);
      });
    },

    // Start or recreate a VMS
    post: async (req, res, next) => {

      let nodeIp = req.body.nodeIp; // Retrieve the actual ip
      let outputType = req.body.outputType; // Define the multimedia stream type that the VMS will output

      // Verify if the Edge Node selection will be done by a Resource Allocation Function or manually
      // it there is in the folder node/ra a file with the nodeIp it means that the selection will 
      // be done by a resource allocation algorithm
      const dirPath = path.join(__dirname, 'node/ra');
      let nodeResult = {};
      try {
        if (fs.existsSync(`${dirPath}/${nodeIp}.js`)) {
          // Find the image from the VMS that will be started
          vmsType = await vmsTypeModel.findById(req.body.vmsType)
            .then((result) => {
              return result
            })
            nodeResult = await ra.nodeSelection(vmsType.dockerImage, nodeIp, req.body)            
            nodeIp = nodeResult.ip
        } else {
          // if it is a manual choice, grab the node with the same IP
          await nodeModel.findOne({
            'ip': nodeIp,
          })
          .then((node) => {
            nodeResult._id = node._id
          })
        }
      } catch(err) {}

      // verify if the node is really online
      let edgeNodeIsOnline = await nodeModel.findOne({'ip':nodeIp})
        .then((result) => { 
          return result
        })
        .catch(function(err) {
          return res.status(500).json({
            message: 'Edge Node not founded',
            error: err
          });
        })

      // if the edge node is offline stop the process
      if (!edgeNodeIsOnline.online) {
        return res.status(500).json({
          message: 'Edge is Offline',
          error: 'Edge is Offline'
        });
      }

      docker.api(nodeIp)
        .then((api) => {
          let vmsType = req.body.vmsType;
          let startupParameters = req.body.startupParameters;
          let portForward = req.body.portForward;
          let id = req.body.id;

          vmsTypeModel.findById(vmsType)
            .then((result) => {
              let nameMonitor = "";
              // this is the vms type that performs network monitoring
              if (result.dockerImage.trim() == 'alfa/vms/udp_flex') {                
                let hash_name = crypto.createHash('md5').update(req.body.name).digest("hex").substr(0,5)

                nameMonitor = `${hash_name}${parseInt(Math.random()*1000)}`
                startupParameters += ` ${nameMonitor}`
              }

              let conf_container = {
                Image: result.dockerImage,
                Cmd: [startupParameters],
                HostConfig: {
                  NetworkMode: process.env.DOCKER_OVERLAY_NETWORK
                }
              }               

              // port Forward, used to bind VMS with external Virtual Devices or
              // programns running outside ALFA
              let containerPorts = {}
              let exposePorts = {}

              if (portForward && portForward.trim()) {
                
                let ports = portForward.split(";")
                
                ports.forEach(port => {
                  let p = port.split(":")
                  let aux_index = `${p[1]}/udp`
                  let aux_port = `${p[0]}`
                  containerPorts[aux_index] = [
                    {"HostIp":"","HostPort":aux_port}
                  ]  
                  exposePorts[aux_index] = {}  
                })
              
                // console.log(containerPorts);
                conf_container['ExposedPorts'] = exposePorts
                conf_container['HostConfig']['PortBindings'] = containerPorts
              }              

              // console.log(conf_container);              
              // return

              api.createContainer(conf_container).then(function(container){
                container.start()
                .then((data) => { 
                  // create a new VMS
                  if (!id) {
                    let vms = new vmsModel({
                      name: req.body.name,
                      dockerId: data.id,
                      startupParameters: startupParameters,
                      vmsType: vmsType,
                      node: nodeResult._id,
                      nameMonitor: nameMonitor,
                      outputType: outputType,
                      portForward: portForward,
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
                      // update the number of vms running in the edge node
                      cron.update()                   
                      if (req.body.remoteRequest){                        
                        return vms
                      } else {
                        return res.status(201).json(vms)
                      }
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
                console.log('---------------')
                console.log(err)
                console.log('---------------')
                return res.status(500).json({
                  message: 'Erro ao instanciar o VMS',
                  error: err
                });                
                // console.log(err)
                // return res.status(422).send(err);
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
              let container = api.getContainer(vms.dockerId)
              // console.log(container)
              container.inspect(function (err, data) {
                if (err) {
                  return res.status(422).json({
                    message: 'Container not running or created anymore.',
                    error: err
                  });
                }

                if (data) {
                  if (data.State.Running) {
                    container.stop(function (err, data) {
                      container.remove()
                      cron.update()
                    });
                    return res.status(201).json(vms);
                  }
                } else {
                  // return res.status(201).json({"ok":"ok"});
                  return res.status(201).json({
                    message: 'Container already stopped.',
                    error: err
                  });
                }
              })
            })
            .catch(err => {
              console.log('b');
              return res.status(422).send(err.errors);
            });        
      })
      .catch(err => {
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

  bindSrc: async (req, res, next) => {

    let vmsId = req.params.vmsId;
    let deviceId = req.params.deviceId;
    let port = req.params.port;

    let ret = await maestroControllerAux.bindVMStoSRC(vmsId, deviceId, port)

    return res.status(201).json({"ok":"ok"});

    /*
    vmsModel.findById(vmsId)
      .populate("node")
      .then((vms) => {
      // 1 - Get the ip of the container's VMS
      docker.api(vms.node.ip)
      .then((api) => {
        let container = api.getContainer(vms.dockerId);
        container.inspect(function (err, data) {

          if (data == null) {
            console.log("VMS not founded or not running")
            return res.status(500).json({
                message: 'VMS not founded or not running',
            });            
          }

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
                  if (err) {
                      return res.status(500).json({
                          message: 'Error when creating vmsType',
                          error: err
                      });
                  }
                })
                if (req.body.remoteRequest){                        
                  return vms
                } else {
                  return res.status(201).json({"ok":"ok"});
                }
              } else {
                console.log(err)
              }
            })
          })
        });
      })
    })
    */
  },
  
  getMonitors: (req, res, next) => {
    let filter = {'nameMonitor': req.params.monitorName}
    vmsModel.findOne(filter)
    .then(vms => {   
      return res.status(200).json(vms.monitor);
    })
  },

  monitor: (req, res, next) => {
    
    // console.log(req.params)

    let tim = req.params.timestamp    
    let aux_time= new Date(tim.substr(0,4), tim.substr(4,2), tim.substr(6,2), tim.substr(9,2), tim.substr(11,2), tim.substr(13,2), 0);

    let monitTmp = {
      'senderip': req.params.senderip,
      'senderport': req.params.senderport,
      'toip': req.params.toip,
      'toport': req.params.toport,
      'milsec': parseInt(req.params.milsec),
      'bs': parseInt(req.params.bs),
      'ps': parseInt(req.params.ps),
      'timestamp': aux_time,
      'totalbytes': parseInt(req.params.totalbytes),
      'totalpackage': parseInt(req.params.totalpackage)
    }

    let filter = {'nameMonitor': req.params.id}

    vmsModel.findOne(filter)
    .then(vms => {
      // store only the last 60 monit messages
      // if (vms.monitor && vms.monitor.length > 60) {
      //   let a = vms.monitor.shift()
      // }

      vms.monitor.push(monitTmp)

      vms.save((err,vms) => {})
    
      return res.status(200).json({"ok":"ok"});
    })
  }
}

module.exports = vmsController