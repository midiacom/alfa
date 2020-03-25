var Docker = require('dockerode');
var getDockerHost = require('get-docker-host');

const d = {

    api (node_ip) {
        if (node_ip == 'localhost') {
            return new Promise((resolve, reject) => {
                getDockerHost((error, ipHost) => {
                    if (ipHost) {
                        // if you whant to know the ip
                        var dockerApi = new Docker({host: ipHost, port: process.env.DOCKER_PORT_API});                    
                        resolve(dockerApi);                
                    } else {
                        reject(new Error(`Error whem connection to docker ${error}`))
                    }
                })
            })
        } else {
            return new Promise((resolve, reject) => {
                var dockerApi = new Docker({host: node_ip, port: process.env.DOCKER_PORT_API});                    
                resolve(dockerApi);                            
            })        
        }
    }

    /*
    Old Method
    api () {
        return new Promise((resolve, reject) => {
            getDockerHost((error, ipHost) => {
                if (ipHost) {
                    // if you whant to know the ip
                    var dockerApi = new Docker({host: ipHost, port: process.env.DOCKER_PORT_API});                    
                    resolve(dockerApi);                
                } else {
                    reject(new Error(`Error whem connection to docker ${error}`))
                }
            })
        })
    }
    */
}

module.exports = d