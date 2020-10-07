const melindaFPSModel = require("../models/melindaFPS")
const vmsTypeModel = require("../models/vmsTypeModel")
const vmsModel = require("../models/vmsModel")
const nodeModel = require("../models/nodeModel")
const mqtt = require('mqtt')

const docker = require("../util/dockerApi")

const melindaController = {

    /**
     * startWorkflow
     * 
     * Save the maximum FPS of each VMS for each Edge Node
     */
    startWorkflow: async (req, res, next) => {
        console.log('Starting MELINDA Pipeline .... ');        
        
        let name = req.body.name
        let maxFPS = req.body.maxFPS
        let mlo_parameters = req.body.mlo_parameters
        let flo_parameters = req.body.flo_parameters
        let dlo_parameters = req.body.dlo_parameters
        let mloSelected = req.body.mloSelected
        let floSelected = req.body.floSelected
        let dloSelected = req.body.dloSelected

        // Get the VMSType of the MLO VMS Selected
        let mlo_type =  await vmsTypeModel.findById(mloSelected)
            .then(vmsType => {
                return vmsType
            })

        // Get the VMSType of the FLO VMS Selected
        let flo_type =  await vmsTypeModel.findById(floSelected)
            .then(vmsType => {
                return vmsType
            })

        // Get the VMSType of the DLO VMS Selected
        let dlo_type =  await vmsTypeModel.findById(dloSelected)
            .then(vmsType => {                
                return vmsType
            })

        // Generate the list of the nodes and the capabilites of each one in terms of the mlo, flo and dlo VMS
        // select all the edge nodes that can run the mloSelected
        possible_nodes = {}
        
        await melindaFPSModel.find({'vmsType': mloSelected})
            .populate('node')
            .then((nodes) => {
                for(let i = 0; i < nodes.length; i++) {
                    node = nodes[i]  
                    // if (node.FPS > 0) {
                    if (node.FPS > 0 && node.node.online == true) {
                        possible_nodes[node.node.id] = {
                            'edgeNodeId': node.node.id,
                            'ip': node.node.ip,
                            'mlo': node.FPS,
                            'flo': 0,
                            'dlo': 0
                        }
                    }
                }                
            })
            .catch((err) => {
                return res.status(500).json({
                    message: 'Error when selecting nodes to run MLO',
                    error: err
                })
            })
        
        // select all the edge nodes that can run the flo_selected
        await melindaFPSModel.find({'vmsType': floSelected})
            .populate('node')
            .then((nodes) => {                
                for(let i = 0; i < nodes.length; i++) {
                    node = nodes[i]                
                    // if (node.FPS > 0) {
                    if (node.FPS > 0 && node.node.online == true) {
                        if (typeof(possible_nodes[node.node.id]) != "undefined") {
                            possible_nodes[node.node.id].flo = node.FPS
                    } else {
                            possible_nodes[node.node.id] = {
                                'edgeNodeId': node.node.id,
                                'ip': node.node.ip,
                                'mlo': 0,
                                'flo': node.FPS,
                                'dlo': 0
                            }
                        }
                    }
                }                
            })
            .catch((err) => {
                return res.status(500).json({
                    message: 'Error when selecting nodes to run FLO',
                    error: err
                })
            })
        // select all the edge nodes that can run the mlo_selected
        await melindaFPSModel.find({'vmsType': dloSelected})
        .populate('node')
        .then((nodes) => {                
            for(let i = 0; i < nodes.length; i++) {
                node = nodes[i]                
                // if (node.FPS > 0) {
                if (node.FPS > 0 && node.node.online == true) {
                    if (typeof(possible_nodes[node.node.id]) != "undefined") {
                        possible_nodes[node.node.id].dlo = node.FPS
                } else {
                        possible_nodes[node.node.id] = {
                            'edgeNodeId': node.node.id,
                            'ip': node.node.ip,
                            'mlo': 0,
                            'flo': 0,
                            'dlo': node.FPS
                        }
                    }
                }
            }
        })
        .catch((err) => {
            return res.status(500).json({
                message: 'Error when selecting nodes to run FLO',
                error: err
            })
        })


        // create the array using the format that the algorithm understand
        nodes = []
        // itera graciosamente através de chave-valor (key-value)
        for (var [key, value] of Object.entries(possible_nodes)) {            
            nodes.push({
                'edgeNodeId': value.edgeNodeId,
                'mlo': parseInt(value.mlo),
                'flo': parseInt(value.flo),
                'dlo': parseInt(value.dlo)
            })
        }

        console.log('Starting the allocation algorithm');

        let topic_nodes = "nodes_list"
        let topic_response = "nodes_response"

        // post in the MQTT Topic
        var client  = mqtt.connect(process.env.MQTT_SERVER) 
        client.on('connect', function () {
            client.publish(topic_nodes, JSON.stringify(nodes), { qos: 2, retain: true })
            client.subscribe(topic_response)
        })
   
        // create the container to run the algoritm for choose the nodes where the VMS will run
        let orchestrator_parameter = [`${maxFPS}`, process.env.MQTT_SERVER_HOST, `${process.env.MQTT_SERVER_PORT}`, topic_nodes, topic_response] 

        let conf_container_orchestrator = {
            Image: process.env.MELINDA_CONTAINER_ORCHESTRATOR,
            Cmd: orchestrator_parameter,
            HostConfig: {
                NetworkMode: process.env.DOCKER_OVERLAY_NETWORK
            }
        }
    
        let container_orc = null
        await docker.api(process.env.MELINDA_HOST_ORCHESTRATOR)
            .then(async (api) => {
                // ----------
                await api.createContainer(conf_container_orchestrator).then(async (container) => {
                    container.start()
                    .then(async (data) => {
                        container_orc = data
                    }).catch(function(err) {
                        return res.status(500).json({
                            message: 'Error when initiate the VMS',
                            error: err
                        });
                    })
                })
            }).catch(function(err) {
                console.log(err);
                return res.status(500).json({
                    message: 'Error when initiate the VMS',
                    error: err
                })
            })

        // wait for the response and conintue creating the VMS in the edge nodes
        let aux_nodes_selected = null

        client.on('message', (topic, message, packet) => {                        
            aux_nodes_selected = JSON.parse(message.toString()) // payload is a buffer       
        })
        
        await new Promise(resolve => setTimeout(resolve, 6000));

        // remove the container that runned the orchestrator
        container_orc.remove()

        // BINDING ------------------------------------------------------
        // bind the id with the node ip 
        for (let i = 0; i < aux_nodes_selected['mlo_nodes'].length; i++) {
            let id = aux_nodes_selected['mlo_nodes'][i].id
            aux_nodes_selected['mlo_nodes'][i].ip = possible_nodes[id].ip
        }
        for (let i = 0; i < aux_nodes_selected['flo_nodes'].length; i++) {
            let id = aux_nodes_selected['flo_nodes'][i].id
            aux_nodes_selected['flo_nodes'][i].ip = possible_nodes[id].ip
        }
        for (let i = 0; i < aux_nodes_selected['dlo_nodes'].length; i++) {
            let id = aux_nodes_selected['dlo_nodes'][i].id
            aux_nodes_selected['dlo_nodes'][i].ip = possible_nodes[id].ip
        }

        let mlo_number = aux_nodes_selected['mlo_nodes'].length
        let flo_number = aux_nodes_selected['flo_nodes'].length
        let dlo_number = aux_nodes_selected['dlo_nodes'].length

        // verify if there are node available to run all the functions       
        // console.log(aux_nodes_selected);
        // console.log('---');
        // console.log(aux_nodes_selected['mlo_nodes'].length);
        // console.log(aux_nodes_selected['flo_nodes'].length);
        // console.log(aux_nodes_selected['dlo_nodes'].length);
        // console.log('---');         
         
        if (aux_nodes_selected['mlo_nodes'].length == 0) {
            console.log(aux_nodes_selected);
            return res.status(500).json({
                message: 'There are no edge nodes to run the The MLOs components',
                error: 'There are no edge nodes to run the The MLOs components'
            });
        }

        if (aux_nodes_selected['flo_nodes'].length == 0) {
            console.log(aux_nodes_selected);
            return res.status(500).json({
                message: 'There are no edge nodes to run the The FLOs components',
                error: 'There are no edge nodes to run the The FLOs components'
            });
        }

        if (aux_nodes_selected['dlo_nodes'].length == 0) {
            console.log(aux_nodes_selected);
            return res.status(500).json({
                message: 'There are no edge nodes to run the The DLOs components',
                error: 'There are no edge nodes to run the The DLOs components'
            });
        }        
        
        // the image broker will run in the same node as the DLO         
        console.log('Starting the VMSs based on the algorithm');

        // copy to the correct variable
        let edge_nodes_selected = {
            mlo: aux_nodes_selected.mlo_nodes,
            dlo: aux_nodes_selected.dlo_nodes,
            flo: aux_nodes_selected.flo_nodes,
            image_broker: {
                id: aux_nodes_selected.dlo_nodes[0].id,
                ip: aux_nodes_selected.dlo_nodes[0].ip
            }
        }

        console.log(edge_nodes_selected);

        // BINDING ------------------------------------------------------        
        // return;

        /**
         * This is the array with the edge nodes that will run the elements 
         * it will be executed by another allocation function
         let edge_nodes_selected = {
             image_broker: {id:'5f67700559daf4035152083f', ip:'localhost'},
             mlo: [{id:'5f67700559daf4035152083f', ip:'localhost'}],
             flo: [{id:'5f67700559daf4035152083f', ip:'localhost'}, {id:'5f67700559daf4035152083f', ip:'localhost'}],
             dlo: [{id:'5f67700559daf4035152083f', ip:'localhost'}, {id:'5f67700559daf4035152083f', ip:'localhost'}]
            }
        */
   
        let mlo_names = []
        let flo_names = []
        let dlo_names = []

        // a) Create the DLO VMSs
        for (let i = 0; i < dlo_number; i++) {
            // the name of the container will be used as paramter to start the image broker
            let aux_name = `dlo_${i}`
            
            // array with the names of the dlo container                       
            dlo_names.push(aux_name)

            // all the DLO are listening in the port 5575
            let conf_container_dlo = {
                name: aux_name,
                Image: dlo_type.dockerImage,
                Cmd: [dlo_parameters],
                ExposedPorts: {"5575/tcp": {}},
                HostConfig: {
                    NetworkMode: process.env.DOCKER_OVERLAY_NETWORK
                }
            }
            /*
            Only with ExposedPorts worked once the inside and outside port was the same!
            PortBindings: {
                "5575/tcp": [{"HostPort":"5575"}]
            }
            */            

            let dlo_created = await docker.api(edge_nodes_selected.dlo[i].ip)
                .then(async (api) => {
                    // ----------
                    await api.createContainer(conf_container_dlo).then(async (container) => {
                        await container.start()
                        .then(async (data) => {

                            let vms = new vmsModel({
                                name: aux_name,
                                dockerId: data.id,
                                startupParameters: dlo_parameters,
                                vmsType: dlo_type,
                                node: edge_nodes_selected.dlo[i].id,
                                outputType: 'Image',
                                bindedTo: []
                            })

                            // save the Dlo VMS 
                            await vms.save((err,vms) => {                                
                                if (err) {
                                    console.log(err);                                    
                                    return res.status(500).json({
                                        message: 'Error when creating VMS DLO',
                                        error: err
                                    });
                                }
                            })
                        }).catch(function(err) {
                            return res.status(500).json({
                                message: 'Error when initiate the VMS',
                                error: err
                            });
                        })
                    })
                }).catch(function(err) {
                    console.log(err);
                    return res.status(500).json({
                        message: 'Error when initiate the VMS',
                        error: err
                    })
                })  
        }
        // <- End (a)

        // b) Create the FLO VMSs
        for (let i = 0; i < flo_number; i++) {
            // the name of the container will be used as paramter to start the image broker
            let aux_name = `flo_${i}`
            
            // array with the names of the flo container
            flo_names.push(aux_name)
            
            // all the FLO are listening in the port 5565
            let conf_container_flo = {
                name: aux_name,
                Image: flo_type.dockerImage,
                Cmd: [flo_parameters],
                ExposedPorts: {"5565/tcp": {}},
                HostConfig: {
                    NetworkMode: process.env.DOCKER_OVERLAY_NETWORK
                }
            }

            let flo_created = await docker.api(edge_nodes_selected.flo[i].ip)
                .then(async (api) => {
                    // ----------
                    await api.createContainer(conf_container_flo).then(async (container) => {
                        await container.start()
                        .then(async (data) => {
                            let vms = new vmsModel({
                                name: aux_name,
                                dockerId: data.id,
                                startupParameters: flo_parameters,
                                vmsType: flo_type,
                                node: edge_nodes_selected.flo[i].id,
                                outputType: 'Image',
                                bindedTo: []
                            })        

                            // save the Flo VMS 
                            await vms.save((err,vms) => {
                                if (err) {
                                    console.log(err);                                                                        
                                    return res.status(500).json({
                                        message: 'Error when creating VMS FLO',
                                        error: err
                                    });
                                }
                            })
                        }).catch(function(err) {
                            return res.status(500).json({
                                message: 'Error when initiate the VMS FLO',
                                error: err
                            });
                        })
                    })
                })            
        }
        // <- End (b)

        // c) Create the Image Broker using the ips as parameter        
        let flo_parameter = `tcp://${flo_names[0]}:5565`
        for(let i = 1; i < flo_names.length; i++){
            flo_parameter = `${flo_parameter};tcp://${flo_names[i]}:5565`
        }
        
        // list of all the dlo vms names (used as ip in the start of the image broker)
        let dlo_parameter = `tcp://${dlo_names[0]}:5575`
        for(let i = 1; i < dlo_names.length; i++){
            dlo_parameter = `${dlo_parameter};tcp://${dlo_names[i]}:5575`            
        }

        image_broker_parameters = [flo_parameter, dlo_parameter]
        
        // The Image Broker is attached with the 5555 port and port bind with the container 
        let conf_container_image_broker = {
            name: 'image_broker',
            Image: 'alfa/component/image_broker',
            Cmd: image_broker_parameters,
            ExposedPorts: {"5555/tcp": {}},
            HostConfig: {
                NetworkMode: process.env.DOCKER_OVERLAY_NETWORK,
                PortBindings: {
                    "5555/tcp": [{"HostPort":"5555"}]
                }
            }
        }

        let image_broker_created = await docker.api(edge_nodes_selected.image_broker.ip)
            .then(async (api) => {
                // ----------
                await api.createContainer(conf_container_image_broker).then(async (container) => {
                    await container.start()
                    .then(async (data) => {
                    }).catch(function(err) {
                        console.log(err);
                        return res.status(500).json({
                            message: 'Error when start the Image Broker',
                            error: err
                        });
                    })
                }).catch(function(err) {
                    console.log(err);
                    return res.status(500).json({
                        message: 'Error when initiate the Image Broker',
                        error: err
                    });
                })
            })       
        // <- IMAGE BROKER CREATION 

        // d) Create the MLO VMSs
        for (let i = 0; i < mlo_number; i++) {
            // the name of the container will be used as paramter to start the image broker
            let aux_name = `mlo_${i}`

            // array with the names of the flo container
            mlo_names.push(aux_name)

            mlo_parameters = "tcp://image_broker:5555"

            let conf_container_mlo = {
                name: aux_name,
                Image: mlo_type.dockerImage,
                Cmd: [mlo_parameters],
                HostConfig: {
                  NetworkMode: process.env.DOCKER_OVERLAY_NETWORK
                }
            }

            let mlo_created = await docker.api(edge_nodes_selected.mlo[i].ip)
                .then(async (api) => {
                    // ----------
                    await api.createContainer(conf_container_mlo).then(async (container) => {
                        container.start()
                        .then(async (data) => {
                            let vms = new vmsModel({
                                name: aux_name,
                                dockerId: data.id,
                                startupParameters: mlo_parameters,
                                vmsType: mlo_type,
                                node: edge_nodes_selected.mlo[i].id,
                                outputType: 'Image',
                                bindedTo: []
                            })        

                            // save the Flo VMS 
                            await vms.save((err,vms) => {
                                if (err) {
                                    console.log(err);                                                                        
                                    return res.status(500).json({
                                        message: 'Error when creating VMS FLO',
                                        error: err
                                    });
                                }
                            })
                        }).catch(function(err) {                            
                            return res.status(500).json({
                                message: 'Error when initiate the VMS FLO',
                                error: err
                            });
                        })
                    })
                })
        }
        return res.status(201).json("{ok:ok}")
    },

    /**
     * stopWorkflow 
     * 
     * Stop all VMS mlo, flo and dlo, besides the image broker
     * 
     */
    stopWorkflow: async (req, res, next) => {
        
        // Get ALL the edge nodes online
        let nodes = await nodeModel.find({'online':true})
            .then(async nodes => {
                return nodes
            }).catch((err) => {
                return res.status(500).json({
                    message: 'Error getting nodes online',
                    error: err
                });
            })

        for(let i = 0; i < nodes.length; i++) {
            node = nodes[i]                     
            let api = await docker.api(node.ip)
                .then((api) => {
                    return api
                }).catch((err) => {
                    return res.status(500).json({
                        message: 'Error getting the API',
                        error: err
                    });
                })

            let containers = await api.listContainers().then(async (result) => {
                return result
            }).catch((err) => {
                return res.status(500).json({
                    message: 'Error getting containers',
                    error: err
                });
            })

            // a) stop the image broker
            // b) stop all MLO VMS
            // c) stop all FLO VMS
            // d) stop all DLO VMS
            for (let j = 0; j < containers.length; j++) {

                let vmsContainer = containers[j]

                let is_broker = vmsContainer.Names[0].indexOf('image_broker')
                let is_mlo    = vmsContainer.Names[0].indexOf('mlo_')
                let is_flo    = vmsContainer.Names[0].indexOf('flo_')
                let is_dlo    = vmsContainer.Names[0].indexOf('dlo_')
                
                if (is_broker == 1 || is_mlo == 1 || is_flo == 1 || is_dlo == 1) {
                    
                    let container = await api.getContainer(vmsContainer['Id'])
                    
                    // REMOVE the VMS DA COLLECTION if mlo, flo or dlo
                    if (is_broker != 1) {                                                                                       
                        await vmsModel.findOne({'dockerId':vmsContainer.Id})
                            .then(VMS => {
                                if (VMS) {
                                    vmsModel.deleteOne({_id: VMS._id},function(err){
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).json({
                                                message: 'Error when deleting vmsType.',
                                                error: err
                                            });
                                        }
                                    })
                                }
                            })
                    }

                    // stop the container 
                    await container.stop(async function (err, data) {
                        if (err) {
                            console.log(err);                            
                            return res.status(500).json({
                                message: 'Error stopping',
                                error: err
                            });
                        }
                        await container.remove()
                    });
                }                                    
            }
        }
        return res.status(201).json("{ok:ok}");                    
        return
        // lixo total aninhamento de 
        await nodeModel.find({'online':true})
            .then(async nodes => {
                for(let i = 0; i < nodes.length; i++) {
                    node = nodes[i]                    
                    console.log(node.ip);                                        
                    await docker.api(node.ip)
                        .then(async (api) => {
                            // Get the VMSType of the MLO VMS Selected
                            // var opts = {
                            //     "filters": `{"name": ["image_broker"]}`
                            // }
                            //await api.listContainers(opts).then(async (result) => {
                            await api.listContainers().then(async (result) => {

                                // a) stop the image broker
                                // b) stop all MLO VMS
                                // c) stop all FLO VMS
                                // d) stop all DLO VMS
                                for (let j = 0; j < result.length; j++) {

                                    let vmsContainer = result[j]

                                    let is_broker = vmsContainer.Names[0].indexOf('image_broker')
                                    let is_mlo    = vmsContainer.Names[0].indexOf('mlo_')
                                    let is_flo    = vmsContainer.Names[0].indexOf('flo_')
                                    let is_dlo    = vmsContainer.Names[0].indexOf('dlo_')
                                    
                                    if (is_broker == 1 || is_mlo == 1 || is_flo == 1 || is_dlo == 1) {
                                        
                                        console.log('eeeeeeeeeeeeeeeeeeeeee');
                                        
                                        console.log(container);
                                        
                                        let container = await api.getContainer(vmsContainer['Id'])
                                        
                                        // REMOVE the VMS DA COLLECTION if mlo, flo or dlo
                                        if (is_broker != 1) {                                                                                       
                                            await vmsModel.findOne({'dockerId':vmsContainer.Id})
                                                .then(VMS => {
                                                    vmsModel.deleteOne({_id: VMS._id},function(err){
                                                        if (err) {
                                                            console.log(err);
                                                            return res.status(500).json({
                                                                message: 'Error when deleting vmsType.',
                                                                error: err
                                                            });
                                                        }
                                                    })
                                                })
                                        }

                                        // stop the container 
                                        await container.stop(async function (err, data) {
                                            if (err) {
                                                console.log(err);                            
                                                return res.status(500).json({
                                                    message: 'Error stopping',
                                                    error: err
                                                });
                                            }
                                            await container.remove()
                                        });
                                    }                                    
                                }
                                console.log('xxxxxxxxxxxxxxx')
                            }).catch((err) => {
                                console.log(err);          
                                console.log('why');
                                
                                return res.status(500).json({
                                    message: 'Error getting the API',
                                    error: err
                                });
                            })              
                            return 1              
                        }).catch((err) => {
                            console.log(err);                            
                            console.log('why 2 ');
                            return res.status(500).json({
                                message: 'Error stopping image broker',
                                error: err
                            });
                        })
                    return res.status(201).json("{ok:ok}");                    
                }
            })
    },

    /**
     * saveEdgeNodeFPS
     * 
     * Save the maximum FPS of each VMS for each Edge Node
     */
    saveEdgeNodeFPS: async (req, res, next) => {

        edge_nodes = req.body.edge_nodes
        vmsTypeId = req.body.vmsTypeId

        // Remove all the previous values for FPS for the VMS Type Selected
        await melindaFPSModel.deleteMany({vmsType: vmsTypeId})

        // Iterate over the keys that are the edge nodes id's
        Object.keys(edge_nodes).forEach(async function(nodeId) {
            var fpsNode = edge_nodes[nodeId];

            const melindaFPS = new melindaFPSModel({
                FPS: fpsNode,
                node: nodeId,
                vmsType: vmsTypeId
            })

            await melindaFPS.save((err,node) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        message: 'Error when creating FPS to VMS to Edge Node',
                        error: err
                    });
                }
            })
        });

        return res.status(201).json("{ok:ok}");
    },

    /**
     * getMelindaVMS
     * 
     * Returns the list of VMS that are Melinda's VMS (mlo, flo and dlo)
     * the pattern name for MLO is: alfa/vms/melinda/mlo/*
     * the pattern name for FLO is: alfa/vms/melinda/flo/*
     * the pattern name for DLO is: alfa/vms/melinda/dlo/*
     */
    getMelindaVMS: (req, res, next) => {
        /**
         * type : mlo / flo / dlo
        */
        let melindaType = `alfa/vms/melinda/${req.params.melindaType}`;

        vmsTypeModel.find({src:0})
            .select('id, name dockerImage')
            .then(vmsTypes => {
                let ret = []
                vmsTypes.forEach(e => {
                    if (e.dockerImage.search(melindaType) != -1)
                        ret.push(e)                        
                    });
                return res.status(201).json(ret);
            })
            .catch(err => {
                /* istanbul ignore next */ 
                return res.status(422).send(err.errors);
            });
    },

    /**
     * getMelindaVMSFPS
     * 
     * Returns the previous values of FPS for a VMS in all edge nodes
     * vmsTypeId: Id of the VMS Type
     */
    getMelindaVMSFPS: (req, res, next) => {

       vmsTypeId = req.params.vmsTypeId
       
        melindaFPSModel.find({vmsType:vmsTypeId})
            .then(melindaFPS => {                
                return res.status(201).json(melindaFPS);
            })
            .catch(err => {
                /* istanbul ignore next */ 
                return res.status(422).send(err.errors);
            });
    },


}    
module.exports = melindaController