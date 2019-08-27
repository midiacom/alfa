var Docker = require('dockerode');
var getDockerHost = require('get-docker-host');

const d = {
    api () {
        return new Promise((resolve, reject) => {
            getDockerHost((error, ipHost) => {
                if (ipHost) {
                    // if you whant to know the ip
                    var dockerApi = new Docker({host: ipHost, port: 4243});                    
                    resolve(dockerApi);                
                } else {
                    reject(new Error(`Error whem connection to docker ${error}`))
                }
            })
        })
    }
}

module.exports = d