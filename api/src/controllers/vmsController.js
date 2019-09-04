// var Docker = require('dockerode');
// var getDockerHost = require('get-docker-host');

const vmsModel = require("../models/vmsModel")
const vmsTypeModel = require("../models/vmsTypeModel")
const docker = require("../util/dockerApi")

const vmsController = {
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
                    dockerId: data.id,
                    startupParameters: startupParameters,
                    vmsType: vmsType
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
                  return res.status(422).send(err);
                });
              }).catch(function(err) {
                /* istanbul ignore next */ 
                return res.status(422).send(err);
              });
            })
            .catch(err => {
              /* istanbul ignore next */ 
              return res.status(422).send(err.errors);
            });
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
                .exec()
                .then((res) => {
                  if (res) {
                    let vmsInfo = {
                      '_id': res.id,
                      'containerId': res.dockerId,
                      'startupParameters': res.startupParameters,
                      'containerInfo': containerInfo,
                      'vmsType': res.vmsType.name
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
                  api.getContainer(vms.dockerId).stop();
                })

              return res.status(201).json(vms);
          })
        })
  },    
}

module.exports = vmsController