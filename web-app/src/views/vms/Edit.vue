<template>
    <div>

        <loading :active.sync="isLoading" :is-full-page="true"></loading>

        <h2>Edit VMS</h2>

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
                <strong>VMS Description:</strong> {{ vmsType.description }}
            </b-form-group>            

            <b-form-group>
                <strong>Startup Parameters Example:</strong> {{ vmsType.startupParameters }}
            </b-form-group>

            <hr>

            <b-form-group id="input-group-3" label="Edge Node:" label-for="node">
                <b-form-select style="margin-top:0px!important" id="nodeIp" v-model="form.nodeIp" :options="nodes" size="sm" class="mt-3"></b-form-select>
            </b-form-group>

            <b-form-group id="input-group-2" label="Name:" label-for="name">
                <b-form-input id="name" v-model="form.name" type="text"/>
            </b-form-group>

            <b-form-group id="input-group-3" label="Startup Parameters:" label-for="startupParameters">
                <b-form-input id="startupParameters" v-model="form.startupParameters" type="text"/>
            </b-form-group>

            <b-row>
                <b-col>
                    <b-button type="submit" variant="primary">Save</b-button>
                </b-col>
                <b-col class="text-right">
                    <b-button to="/vms/allvms" variant="secondary">Back</b-button>        
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
                node: ''
            },
            msg: {
                show: false,
                text: false,
                type: ''
            },
            isLoading: false
        }
    },
    methods: {
        onSubmit(evt) {
            // find the node with the ip
            for(let i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].value == this.form.nodeIp) {
                    this.form.node = this.nodes[i].id
                }
            }

            evt.preventDefault()
            this.isLoading = true;
            apiVms.updateVms(this.form)
                .then(() => {
                    this.msg.text = "VMS Updated"
                    this.msg.type = "success"
                    this.msg.show = true
                    this.isLoading = false
                })
                .catch((e) => {
                    this.msg.text = `Error when updating VMS ${e}`
                    this.msg.type = "danger"
                    this.isLoading = false
                    this.msg.show = true
                })
        },

        refresh() {
            this.isLoading = false;

            apiNode.getNodesForSelect()
                .then((nodes) => {
                    this.nodes = nodes
                })

            apiVms.getVms(this.$route.params.id)
                .then((vms) => {

                    apiVmsType.getVmsType(vms.vmsType)
                        .then((vmsType) => {
                            this.form.vmsType = vmsType._id
                            this.vmsType = vmsType
                        })

                    this.form.id = vms._id
                    this.form.name = vms.name
                    this.form.dockerId = vms.dockerId
                    this.form.startupParameters = vms.startupParameters
                    this.form.node = vms.node._id
                    this.form.nodeIp = vms.node.ip

                })
        }
    },
    created() {
        this.refresh()
    }
}
</script>