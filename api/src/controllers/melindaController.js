const melindaFPSModel = require("../models/melindaFPS")
const vmsTypeModel = require("../models/vmsTypeModel")
const vmsModel = require("../models/vmsModel")

const docker = require("../util/dockerApi")

const melindaController = {

    /**
     * startWorkflow
     * 
     * Save the maximum FPS of each VMS for each Edge Node
     */
    startWorkflow: async (req, res, next) => {
        
        let name = req.body.name
        let maxFPS = req.body.maxFPS
        let mlo_number = req.body.mlo_number
        let flo_number = req.body.flo_number
        let dlo_number = req.body.dlo_number
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
       

        /**
         * This is the array with the edge nodes that will run the elements 
         * it will be executed by another allocation function
        */
        let edge_nodes_selected = {
            mlo: [{id:'5f2484b37c803900291ea3d6', ip:'localhost'}],
            flo: [{id:'5f2484b37c803900291ea3d6', ip:'localhost'}],
            dlo: [{id:'5f2484b37c803900291ea3d6', ip:'localhost'}]
        }

        // a) Create the DLO VMSs
        for (let i = 0; i < dlo_number; i++) {
            let conf_container_dlo = {
                Image: dlo_type.dockerImage,
                Cmd: [dlo_parameters],
                HostConfig: {
                  NetworkMode: process.env.DOCKER_OVERLAY_NETWORK
                }
            }

            let dlo_created = await docker.api(edge_nodes_selected.dlo[i].ip)
                .then(async (api) => {
                    console.log(api);
                    
                    // ----------
                    await api.createContainer(conf_container_dlo).then(async (container) => {
                        console.log(container);
                        
                        container.start()
                        .then(async (data) => { 
                            console.log(data);
                            
                            let vms = new vmsModel({
                                name: name,
                                dockerId: data.id,
                                startupParameters: dlo_parameters,
                                vmsType: dlo_type,
                                node: edge_nodes_selected.dlo[i].id,
                                outputType: 'Image',
                                bindedTo: []
                            })
        
                            console.log(vms);
                            
                            // save the Mlo VMS 
                            await vms.save((err,vms) => {
                              /* istanbul ignore next */ 
                                if (err) {
                                    console.log(err)
                                    return res.status(500).json({
                                    message: 'Error when creating vmsType',
                                    error: err
                                    });
                                }
                            })
                        }).catch(function(err) {                        
                            console.log('---------------')
                            console.log(err)
                            console.log('---------------')
                            return res.status(500).json({
                                message: 'Erro ao instanciar o VMS',
                                error: err
                            });
                        })
                    })
                })
        }

        console.log(dlo_created);
        console.log('aaaaaaaaa');
        

        // b) Create the FLO VMSs

        // c) Create the Image Broker using the ips as parameter

        // d) Create the MLO VMSs

        // e) Bind with the selected virtual device
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