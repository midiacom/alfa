<template>
    <div>

        <loading :active.sync="isLoading" :is-full-page="true"></loading>

        <h2>New VMS</h2>

        <b-alert :show="msg.show" :variant=msg.type>
            {{ msg.text }}
        </b-alert>

        <b-form @submit="onSubmit">

            <hr>
            <h4>Details of VMS Type</h4>
            <b-form-group>
                <strong>VMS Type:</strong> {{ vmsType.name }}
            </b-form-group>            

            <b-form-group>
                <strong>Docker Image:</strong> {{ vmsType.dockerImage }}
            </b-form-group>            

            <b-form-group>
                <strong>Description:</strong> {{ vmsType.description }}
            </b-form-group>

            <b-form-group id="input-group-3" label="Edge Node:" label-for="node">
                <b-form-select required style="margin-top:0px!important" id="nodeIp" v-model="form.nodeIp" :options="nodes" size="sm" class="mt-3"></b-form-select>
            </b-form-group>
            
            <b-form-group>
                <strong>Startup Parameters Example:</strong> {{ vmsType.startupParameters }}
            </b-form-group>

            <hr>

            <b-form-group id="input-group-2" label="Name:" label-for="name">
                <b-form-input required id="name" v-model="form.name" type="text"/>
            </b-form-group>

            <b-form-group id="input-group-3" label="Startup Parameters:" label-for="startupParameters">
                <b-form-input id="startupParameters" v-model="form.startupParameters" type="text"/>
            </b-form-group>

            <b-form-group id="input-group-3" label="Port Forward:" label-for="portForward" title="EXT_POST:INT_PORT (; for multiple forward) - This is for testing VMS only, by default leave empty">
                <b-form-input id="portForward" v-model="form.portForward" type="text"/>
            </b-form-group>

            <b-form-group id="input-group-6" label="Output Type:" label-for="outputType">
                <b-form-radio v-model="form.outputType" name="outputType" value="video">Video</b-form-radio>
                <b-form-radio v-model="form.outputType" name="outputType" value="audio">Audio</b-form-radio>
                <b-form-radio v-model="form.outputType" name="outputType" value="audioevideo">Audio & Video</b-form-radio>
                <b-form-radio v-model="form.outputType" name="outputType" value="audioevideo">Text</b-form-radio>
            </b-form-group>            

            <b-row>
                <b-col>
                    <b-button type="submit" variant="primary">Start</b-button>
                </b-col>
                <b-col class="text-right">
                    <b-button to="/vmsType" variant="secondary">Back</b-button>        
                </b-col>
            </b-row>
        </b-form>
  </div>
</template>

<script>
import {apiVms} from './api'
import {apiVmsType} from '../vmsType/api'
import {apiNode} from '../node/api'

import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
    name: 'vmsNew',
    components: {Loading},    
    data() {
        return {            
            nodes: [],
            vmsType: {
                name: '',
                dockerImage: '',
                startupParameters: '',
                description: ''                
            },
            form: {
                name: '',
                vmsType: '',
                startupParameters: '',
                nodeIp: '',
                node: '',
                outputType: 'video'
            },
            msg: {
                text: false,
                type: '',
                show: false
            },
            isLoading: false
        }
    },
    methods: {

        onSubmit(evt) {
            
            evt.preventDefault()
            
            this.isLoading = true;

            // find the node with the ip
            for(let i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].value == this.form.nodeIp) {
                    this.form.node = this.nodes[i].id
                }
            }

            apiVms.newVms(this.form)
                .then(() => {
                    this.msg.text = "VMS created"
                    this.msg.type = "success"
                    this.msg.show = true
                    this.isLoading = false;
                })
                .catch((e) => {
                    console.log(e)
                    this.msg.text = `Error when creating VMS ${e}`
                    this.msg.type = "danger"
                    this.msg.show = true
                    this.isLoading = false;
                })
        },

        refresh() {
            this.isLoading = false;
            apiVmsType.getVmsType(this.$route.params.id)
                .then((vmsType) => {
                    this.form.vmsType = vmsType._id
                    this.vmsType = vmsType
                })

            apiNode.getNodesForVmsSelect()
                .then((nodes) => {
                    this.nodes = nodes
                })
        }
    },
    created() {
        this.refresh()
    }
}
</script>