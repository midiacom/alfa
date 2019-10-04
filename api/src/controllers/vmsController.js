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

    post: (req, res, next) => {
      docker.api()
        .then((api) => {
          let vmsType = req.body.vmsType;
          let startupParameters = req.body.startupParameters;
          vmsTypeModel.findById(vmsType)
            .then((result) => {
              api.createContainer({
                Image: result.dockerImage,
                Cmd: [startupParameters],
              }).then(function(container) {
                container.start()
                .then((data) => {
                  const vms = new vmsModel({
                    name: req.body.name,
                    dockerId: data.id,
                    startupParameters: startupParameters,
                    vmsType: vmsType,
                  })                
                  
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
                  // return res.status(201).json(data);
                }).catch(function(err) {
                  /* istanbul ignore next */ 
                  console.log('1')
                  return res.status(422).send(err);
                });
              }).catch(function(err) {
                /* istanbul ignore next */ 
                console.log('2')
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
    async listStoppedVms (req, res, next) {
      let cont = [];
      await vmsModel.find()
      .populate('vmsType')
      .then((vmss) => {
        return res.status(201).json(vmss);          
        /*
        docker.api()
        .then(async (api) => {
          const promises = vmss.map(async function (vms) {
            let container = api.getContainer(vms.dockerId);
            await container.inspect()
            .then(async (data) => {
              if (!data.State.Running) {
                let vmsInfo = {
                  '_id': vms.id,
                  'containerId': vms.dockerId,
                  'startupParameters': vms.startupParameters,
                  'containerInfo': data,
                  'vmsType': vms.vmsType.name
                }
                cont.push(vmsInfo)
              }
            });
          });
          await Promise.all(promises);
          return res.status(201).json(cont);          
          
        })
        //return res.status(201).json(vmss);
        */
      })
      .catch(err => {
          /* istanbul ignore next */ 
          return res.status(422).send(err.errors);
      });
    },
    
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
                .populate('bindedTo')
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
                      'sdp': res.vmsType.sdp
                    }

                    if (res.bindedTo) {
                      vmsInfo.bindedTo = res.bindedTo.name
                    }
                    
                    cont.push(vmsInfo)
                  }
                })
              });              
              await Promise.all(promises);
              return res.status(201).json(cont);
        });
      })        
    },
    get: (req, res, next) => {
      let id = req.params.id;
      docker.api()
        .then((api) => {
          let id = req.params.id;
          var opts = {
            "filters": `{"id": ["${id}"]}`
          }
          api.listContainers(opts, function (err, container) {
            return res.status(201).json(container);
          });
        })
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

  bindSrc: (req, res, next) => {

    let vmsId = req.params.vmsId;
    let deviceId = req.params.deviceId;
    let port = req.params.port;

    vmsModel.findById(vmsId)
      .then((vms) => {
      // 1 - Get the ip of the container's VMS
      docker.api()
      .then((api) => {
        let container = api.getContainer(vms.dockerId);
        container.inspect(function (err, data) {
          let ipDockerContainer = data.NetworkSettings.IPAddress;
          var client  = mqtt.connect(process.env.MQTT_SERVER) 
          client.on('connect', function () {
            client.subscribe(deviceId, function (err) {
              if (!err) {
                // 2 - Send to MQQT the IP and PORT of this VMS, it will be published 
                // in a topic with the name of the device ID
                client.publish(deviceId, `${ipDockerContainer};${port}`)
                
                vms.bindedTo = deviceId;

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