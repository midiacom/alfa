// var Docker = require('dockerode');
// var getDockerHost = require('get-docker-host');
// const locationModel = require("../models/locationModel")

const deviceModel = require("../models/deviceModel")
const docker = require("../util/dockerApi")

const vmsController = {
    post: (req, res, next) => {
      docker.api()
        .then((api) => {
          let cont = []
          api.listContainers(function (err, containers) {
            containers.forEach(function (containerInfo) {
              //docker.getContainer(containerInfo.Id).stop(cb);
              //console.log(containerInfo)
              cont.push(containerInfo)
            });   
            return res.status(201).json(cont);
          });
        })
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
}

module.exports = vmsController