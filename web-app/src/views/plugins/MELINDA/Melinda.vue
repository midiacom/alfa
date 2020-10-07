<template>
    <div>
        <h2>
            <v-icon style="width: 32px;"  name="codesandbox"></v-icon>
            MELINDA Workflow
        </h2>

        <b-alert :show="msg.show" :variant=msg.type>
            {{ msg.text }}
        </b-alert>

        <b-container class="bv-example-row">
            <b-row class="text-center">
                <b-col>
                    <b-button size="lg" variant="success" @click="show_workflow = true">
                        <v-icon style="width: 32px;" name="arrow-right-circle"></v-icon>
                        New Workflow
                    </b-button>
                </b-col>
                <b-col>
                    <b-button size="lg" @click="show_workflow = false">
                        <v-icon style="width: 32px;" name="settings"></v-icon>
                        Configurations
                    </b-button>
                </b-col>
                <b-col>
                    <b-button size="lg" variant="danger" @click="stopWorkflow">
                        <v-icon style="width: 32px;" name="x-octagon"></v-icon>
                        Stop Workflow
                    </b-button>
                </b-col>
            </b-row>
        </b-container>

        <hr/>

        <b-form @submit="onSubmitStartWorkFlow" v-show="show_workflow">
 
            <b-container class="bv-example-row">            

                <h3> 
                    <v-icon style="width: 32px;" name="arrow-right-circle"></v-icon>
                    Create a New Workflow
                </h3>

                <!-- Meta Data -->
                <b-row>
                    <b-col>
                        <b-form-group id="input-group-1" label="Application Name:" label-for="name">
                            <b-form-input style="width:350px" id="name" v-model="form.name" type="text" required/>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group id="input-group-1" label="Maximum FPS:" label-for="fps">
                            <b-form-input style="width:100px" id="fps" v-model="form.maxFPS" type="number" required/>
                        </b-form-group>
                    </b-col>
                </b-row>

                <!-- VMS MLO Type-->            
                <b-row>
                    <b-col>
                        <b-form-group id="input-group-1" label="MLO VMS:" label-for="mlo">
                                            <b-form-select 
                                    @input="onChangeVMSType(mloSelected, 'mlo')"
                                    v-model="mloSelected" 
                                    :options="MelindaVMSMlo" 
                                    ></b-form-select>
                        </b-form-group>            
                    </b-col>
                    <b-col>
                        <b-form-group id="input-group-1" label="Parameters:" label-for="mlo_parameters">
                            <b-form-input style="width:400px" id="mlo_parameters" v-model="form.mlo_parameters" type="text" />
                        </b-form-group>
                    </b-col>
                    <!-- <b-col>
                        <b-form-group id="input-group-1" label="MLO Number:" label-for="mlo_number">
                            <b-form-input style="width:100px" id="mlo_number" v-model="form.mlo_number" type="number" required/>
                        </b-form-group>
                    </b-col> -->
                </b-row>

                <!-- VMS FLO Type-->
                <b-row>
                    <b-col>
                        <b-form-group id="input-group-1" label="FLO VMS:" label-for="flo">
                            <b-form-select 
                                    @input="onChangeVMSType(floSelected, 'flo')"
                                    v-model="floSelected" 
                                    :options="MelindaVMSFlo" 
                                    ></b-form-select>
                        </b-form-group>            
                    </b-col>
                    <b-col>
                        <b-form-group id="input-group-1" label="Parameters:" label-for="flo_parameters">
                            <b-form-input style="width:400px" id="flo_parameters" v-model="form.flo_parameters" type="text" />
                        </b-form-group>
                    </b-col>
                    <!-- <b-col>
                        <b-form-group id="input-group-1" label="FLO Number:" label-for="flo_number">
                            <b-form-input style="width:100px" id="flo_number" v-model="form.flo_number" type="number" required/>
                        </b-form-group>
                    </b-col> -->
                </b-row>

                <!-- VMS DLO Type-->
                <b-row>
                    <b-col>
                        <b-form-group id="input-group-1" label="DLO VMS:" label-for="dlo">
                            <b-form-select 
                                    @input="onChangeVMSType(dloSelected, 'dlo')"
                                    v-model="dloSelected" 
                                    :options="MelindaVMSDlo" 
                                    ></b-form-select>
                        </b-form-group>            
                    </b-col>
                    <b-col>
                        <b-form-group id="input-group-1" label="Parameters:" label-for="dlo_parameters">
                            <b-form-input style="width:400px" id="dlo_parameters" v-model="form.dlo_parameters" type="text" />
                        </b-form-group>
                    </b-col>                    
                    <!-- <b-col>
                        <b-form-group id="input-group-1" label="DLO Number:" label-for="dlo">
                            <b-form-input style="width:100px" id="dlo_number" v-model="form.dlo_number" type="number" required/>
                        </b-form-group>
                    </b-col> -->
                </b-row>

                <b-row class="text-center">
                    <b-col>
                        <b-button type="submit" variant="primary">Create Workflow</b-button>
                    </b-col>
                </b-row>

            </b-container>                
        </b-form>
 
        <b-container class="bv-example-row"  v-show="!show_workflow">
            <hr>
            <h3>
                <v-icon style="width: 32px;" name="settings"></v-icon>
                Configurations</h3>
            <b-card-group deck>
                <b-card bg-variant="light"  text-variant="black">
                    <b-card-title>
                        <strong>VMS MLO </strong>
                        <b-form-select 
                            @input="onChangeVMSType(mloSelected, 'mlo')"
                            v-model="mloSelected" 
                            :options="MelindaVMSMlo" 
                            size="sm" 
                            class="mt-3"></b-form-select>
                    </b-card-title>
                    <hr/>

                    <b-card-text>
                        <b-form @submit="onSubmitMlo">
                            <b-row v-for="node in nodes" :key="node.id">
                        
                                <b-col>
                                    <b-form-group>
                                        <h5 v-if="node.text.indexOf('Online') == -1">
                                        <b-badge variant="danger">{{ node.text.substring(0,node.text.indexOf('('))}}</b-badge></h5>
                                        <h5 v-else> <b-badge variant="success">{{ node.text.substring(0,node.text.indexOf('('))}}</b-badge></h5>
                                        <b-form-input 
                                            type="text" 
                                            size="sm" 
                                            :value="edge_mlo[node.id]" 
                                            @change="changeFPS(node, $event, 'mlo')"
                                            required/>
                                    </b-form-group>
                                </b-col>
                            </b-row>
                            <b-row class="text-center">
                                <b-col>
                                    <b-button type="submit" variant="primary">Save MLO</b-button>
                                </b-col>
                            </b-row>
                        </b-form>
                    </b-card-text>
                </b-card>

                <b-card bg-variant="light"  text-variant="black">
                    <b-card-title>
                        <strong>VMS FLO </strong>
                        <b-form-select 
                            @input="onChangeVMSType(floSelected, 'flo')"
                            v-model="floSelected" 
                            :options="MelindaVMSFlo"
                            size="sm" 
                            class="mt-3"></b-form-select>
                    </b-card-title>
                    <hr/>
                        <b-form @submit="onSubmitFlo">
                            <b-row v-for="node in nodes" :key="node.id">
                                <b-col>
                                    <b-form-group>
                                        <h5 v-if="node.text.indexOf('Online') == -1">
                                        <b-badge variant="danger">{{ node.text.substring(0,node.text.indexOf('('))}}</b-badge></h5>
                                        <h5 v-else> <b-badge variant="success">{{ node.text.substring(0,node.text.indexOf('('))}}</b-badge></h5>
                                        <b-form-input 
                                            type="text" 
                                            size="sm" 
                                            :value="edge_flo[node.id]" 
                                            @change="changeFPS(node, $event, 'flo')"
                                            required/>
                                    </b-form-group>
                                </b-col>
                            </b-row>
                            <b-row class="text-center">
                                <b-col>
                                    <b-button type="submit" variant="primary">Save FLO</b-button>
                                </b-col>
                            </b-row>
                        </b-form>                
                </b-card>

                <b-card bg-variant="light"  text-variant="black">
                    <b-card-title>
                        <strong>VMS DLO </strong>
                        <b-form-select 
                            @input="onChangeVMSType(dloSelected, 'dlo')"
                            v-model="dloSelected" 
                            :options="MelindaVMSDlo"
                            size="sm" 
                            class="mt-3"></b-form-select>
                    </b-card-title>
                    <hr/>
                        <b-form @submit="onSubmitDlo">
                            <b-row v-for="node in nodes" :key="node.id">
                                <b-col>
                                    <b-form-group>
                                        <h5 v-if="node.text.indexOf('Online') == -1">
                                        <b-badge variant="danger">{{ node.text.substring(0,node.text.indexOf('('))}}</b-badge></h5>
                                        <h5 v-else> <b-badge variant="success">{{ node.text.substring(0,node.text.indexOf('('))}}</b-badge></h5>
                                        <b-form-input 
                                            type="text" 
                                            size="sm" 
                                            :value="edge_dlo[node.id]" 
                                            @change="changeFPS(node, $event, 'dlo')"
                                            required/>
                                    </b-form-group>
                                </b-col>
                            </b-row>
                            <b-row class="text-center">
                                <b-col>
                                    <b-button type="submit" variant="primary">Save DLO</b-button>
                                </b-col>
                            </b-row>
                        </b-form>                
                </b-card>
            </b-card-group>      
        </b-container>
  </div>
</template>

<script>
import {apiMELINDA} from './api'
import {apiNode} from '../../node/api'

export default {
    name: 'deviceNew',
    data() {
        return {
            nodes: [],
            show_workflow: true,
            MelindaVMSMlo: [],
            MelindaVMSFlo: [],
            MelindaVMSDlo: [],
            mloSelected: null,
            floSelected: null,
            dloSelected: null,
            edge_mlo:{},
            edge_flo:{},
            edge_dlo:{},
            form: {
                name: 'WF Teste',
                maxFPS: 20,
                mlo_number: 1,
                flo_number: 1,
                dlo_number: 1,
                mlo_parameters: '',
                dlo_parameters: '',
                flo_parameters: '',
                mloSelected: null,
                floSelected: null,
                dloSelected: null                
            },
            msg: {
                text: false,
                type: '',
                show: false
            }
        }
    },

    methods: {
        
        onSubmitStartWorkFlow(evt) {
            evt.preventDefault()

            this.form.mloSelected = this.mloSelected
            this.form.floSelected = this.floSelected
            this.form.dloSelected = this.dloSelected

            apiMELINDA.startWorkflow(this.form)
                .then(() => {
                    this.msg.text = "Workflow created"
                    this.msg.type = "success"
                    this.msg.show = true
                })
                .catch((e) => {
                    console.log(e);                    
                    this.msg.text = `Error when creating the workflow ${e}`
                    this.msg.type = "danger"
                    this.msg.show = true
                })
        },

        changeFPS: function(node, FPS, melindaType){
            if (melindaType == "flo")  {
                this.$set(this.edge_flo, node.id, parseInt(FPS))
                return
            }

            if (melindaType == "dlo") {
                this.$set(this.edge_dlo, node.id, parseInt(FPS))
                return
            }

            this.$set(this.edge_mlo, node.id, parseInt(FPS))
        }, 
        
        onChangeVMSType(vmsTypeId, melindaType) {

            if (!vmsTypeId) return

            apiMELINDA.getMelindaVMSFPS(vmsTypeId)
                .then((result) => {
                    result.forEach(e => {                        
                        if (melindaType == 'mlo') {
                            this.$set(this.edge_mlo, e.node, parseInt(e.FPS))                            
                        }

                        if (melindaType == 'flo') {
                            this.$set(this.edge_flo, e.node, parseInt(e.FPS))                            
                        }

                        if (melindaType == 'dlo') {
                            this.$set(this.edge_dlo, e.node, parseInt(e.FPS))                            
                        }
                    });
                })
        },


        onSubmitMlo(evt) {
            evt.preventDefault()
            let payload = {
                edge_nodes: this.edge_mlo,
                vmsTypeId: this.mloSelected
            }

            // Save the FPS for the VMS in a particular edge node
            apiMELINDA.saveEdgeNodeFPS(payload)
                .then(() => {
                    this.msg.text = "The total of FPS for the MLO in the Edge Nodes was Saved"
                    this.msg.type = "success"
                    this.msg.show = true
                })
                .catch((e) => {
                    this.msg.text = `Error when saving MLO FPS ${e}`
                    this.msg.type = "danger"
                    this.msg.show = true
                })
        },

        onSubmitDlo(evt) {
            evt.preventDefault()
            let payload = {
                edge_nodes: this.edge_dlo,
                vmsTypeId: this.dloSelected
            }

            // Save the FPS for the VMS in a particular edge node
            apiMELINDA.saveEdgeNodeFPS(payload)
                .then(() => {
                    this.msg.text = "The total of FPS for the DLO in the Edge Nodes was Saved"
                    this.msg.type = "success"
                    this.msg.show = true
                })
                .catch((e) => {
                    this.msg.text = `Error when saving DLO FPS ${e}`
                    this.msg.type = "danger"
                    this.msg.show = true
                })
        },

        onSubmitFlo(evt) {
            evt.preventDefault()
            let payload = {
                edge_nodes: this.edge_flo,
                vmsTypeId: this.floSelected
            }

            // Save the FPS for the VMS in a particular edge node
            apiMELINDA.saveEdgeNodeFPS(payload)
                .then(() => {
                    this.msg.text = "The total of FPS for the FLO in the Edge Nodes was Saved"
                    this.msg.type = "success"
                    this.msg.show = true
                })
                .catch((e) => {
                    this.msg.text = `Error when saving FLO FPS ${e}`
                    this.msg.type = "danger"
                    this.msg.show = true
                })
        },

        stopWorkflow() {

            // Save the FPS for the VMS in a particular edge node
            apiMELINDA.stopWorkflow()
                .then(() => {
                    this.msg.text = "The workflow was stoppped!"
                    this.msg.type = "success"
                    this.msg.show = true
                })
                .catch((e) => {
                    this.msg.text = `Error when stopping the workflow ${e}`
                    this.msg.type = "danger"
                    this.msg.show = true
                })
        }
    },

    created() {
        // Get all the edge nodes and put in a array 
        apiNode.getNodesForSelect()
            .then((nodes) => {
                nodes.forEach(node => {
                    this.$set(this.edge_mlo, node.id, 0)
                    this.$set(this.edge_flo, node.id, 0)
                    this.$set(this.edge_dlo, node.id, 0)
                })

                this.nodes = nodes
            })

        // get all the VMS tha are mlo's
        apiMELINDA.getMelindaVMS('mlo')
            .then((result) => {
                result.forEach(e => {
                    this.MelindaVMSMlo.push({                        
                        text: e.name,
                        value: e._id
                    })
                });
            })

        apiMELINDA.getMelindaVMS('flo')
            .then((result) => {
                result.forEach(e => {
                    this.MelindaVMSFlo.push({
                        text: e.name,
                        value: e._id
                    })
                });
            })

        apiMELINDA.getMelindaVMS('dlo')
            .then((result) => {
                result.forEach(e => {
                    this.MelindaVMSDlo.push({
                        text: e.name,
                        value: e._id
                    })
                });
            })
    }
}
</script>

<style scoped>
.greentextclass {
    color: green
}
.redtextclass {
    color: red
}
</style>