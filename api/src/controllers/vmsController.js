// var Docker = require('dockerode');
// var getDockerHost = require('get-docker-host');
// const locationModel = require("../models/locationModel")

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
                  console.log(data)
                  return res.status(201).json(data);
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

          /*
          let cont = []
          api.listContainers(function (err, containers) {
            containers.forEach(function (containerInfo) {
              //docker.getContainer(containerInfo.Id).stop(cb);
              //console.log(containerInfo)
              cont.push(containerInfo)
            });   
            return res.status(201).json(cont);
          })*/
        });
    },
    list: (req, res, next) => {
      docker.api()
        .then((api) => {
          let cont = []
          api.listContainers(function (err, containers) {
            containers.forEach(function (containerInfo) {
              cont.push(containerInfo)
            });   
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
            console.log(container)
            return res.status(201).json(container);
          });          
          /*
          var containerDetail = api.getContainer(id);          
          console.log(containerDetail)
          containerDetail.inspect(function (err, data) {            
            return res.status(201).json(data);
          });*/
        })
    },
}

module.exports = vmsController