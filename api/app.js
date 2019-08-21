const express = require("express")
const Docker = require('dockerode');

var docker = new Docker({socketPath: '/var/run/docker.sock'});

const PORT = 3000;
const HOST = '0.0.0.0';

const app = express();

app.get("/", (req, res) => {
    docker.listContainers(function (err, containers) {
        console.log(err);
        containers.forEach(function (containerInfo) {
          docker.getContainer(containerInfo.Id).stop(cb);
        });
      });
    //res.send("Hello Worlds");
})

app.listen(PORT,HOST);