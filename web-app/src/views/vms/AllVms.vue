<template>
  <div>
    
    <loading :active.sync="isLoading" :is-full-page="true"></loading>

    <b-modal 
        ok-only
        size="lg"
        ref="sdpModal" 
        id="modal-1" 
        title="Example of how to display the result of the VMS">
        <h2>SDP File Content</h2>
        <b-alert show=true variant="info">
            Copy and past this content in a .sdp file and open it using VLC to show de content of the VMS. Change the port to the correct one.
        </b-alert>
        <pre>{{ sdp }}</pre>

        <h2>Gstreamer Example</h2>
        <pre>
gst-launch-1.0 \
    udpsrc port=5001 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! autovideosink
        </pre>

        <pre>
gst-launch-1.0 \
    udpsrc port=10000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! decodebin \
    ! queue2 \
    ! autovideosink
    </pre>
    </b-modal>

    <b-row>
        <b-col>            
            <h2>
            <v-icon style="width: 32px;" name="send"></v-icon>
                Running VMS
            </h2>
        </b-col>
        <b-col class="text-right">
            <b-button to="/vmsType" variant="success" class="mr-2">
                <v-icon name="plus"></v-icon>
                Start a New VMS
            </b-button>    
        </b-col>
    </b-row>    
     
    <b-alert :show=msg.show :variant=msg.type>
        {{ msg.text }}
    </b-alert>

    <b-table
        :busy="isBusy"
        :items="items" 
        :fields="fields" 
        striped 
        responsive="sm">

        <template v-slot:cell(vmsType)="row" align-v="center">            
            <span v-if="row.item.vmsType">
                {{ row.item.vmsType.name }}
            </span>
            <span v-else>
                <b-alert show variant="warning">
                    VMS Type not found
                </b-alert>                
            </span>

        </template>

        <template v-slot:cell(startupParameters)="row">
            <em>
                {{row.item.startupParameters}}   
            </em>

            <em v-show="row.item.portForward">
                <br/><strong>Port Foward</strong>
                {{row.item.portForward}}   
            </em>

        </template>

        <template v-slot:cell(name)="row">
            {{row.item.name }}
        </template>

        <template v-slot:cell(node)="row">
            <span v-if="row.item.node">
                {{ row.item.node.name }} / {{ row.item.node.ip }}
            </span>
        </template>

      <template v-slot:cell(actions)="row">
            
            <b-button title="Bind / Unbind" variant="success" size="sm" @click="bindSrc(row.item)" class="mr-2">
                <v-icon name="minimize-2"></v-icon>
            </b-button>

            <b-button title="Recreate" variant="info" size="sm" @click="restartVms(row.item)" class="mr-2">
                <v-icon name="refresh-cw"></v-icon>
            </b-button>    

            <!-- <b-button title="View" variant="primary" size="sm" @click="showSdp(row.item)" class="mr-2">
                <v-icon name="eye"></v-icon>
            </b-button> 


            <b-button title="Edit" variant="outline-primary" size="sm" @click="editVms(row.item)" class="mr-2">
                <v-icon name="edit-2"></v-icon>
            </b-button>
            
            <b-button title="Container Details" variant="warning" size="sm" @click="detailsVms(row.item)" class="mr-2">
                <v-icon name="info"></v-icon>
            </b-button>

            <b-button @click="isRunning(row.item)" title="Status" variant="outline-warning" size="sm" class="mr-2">
                <v-icon name="activity"></v-icon>
            </b-button>

            <b-button title="Remove" variant="danger" size="sm" @click="removeStoppedVms(row.item)" class="mr-2">
                <v-icon name="trash"></v-icon>
            </b-button>
            -->

            <b-button title="Stop" variant="danger" size="sm" @click="stopVms(row.item)" class="mr-2">
                <v-icon name="stop-circle"></v-icon>
            </b-button>

            <b-dropdown size="sm" variant="secondary" id="dropdown-1" text="Actions" class="m-md-2">
                <b-dropdown-item variant="primary" @click="showSdp(row.item)">
                    <v-icon name="eye"></v-icon> - VMS View
                </b-dropdown-item>

                <b-dropdown-item @click="editVms(row.item)">
                    <v-icon name="edit-2"></v-icon> - VMS Edit
                </b-dropdown-item>

                <b-dropdown-item @click="isRunning(row.item)">
                    <v-icon name="activity"></v-icon> - Status
                </b-dropdown-item>

                <b-dropdown-item @click="detailsVms(row.item)">
                    <v-icon name="info"></v-icon> - Details
                </b-dropdown-item>
                
                <b-dropdown-item @click="logVMS(row.item)">
                    <v-icon name="align-justify"></v-icon> - Logs
                </b-dropdown-item>

                <b-dropdown-item variant="danger" @click="removeStoppedVms(row.item)">
                    <v-icon name="trash"></v-icon> - Remove
                </b-dropdown-item>

                <b-dropdown-divider></b-dropdown-divider>

                <b-dropdown-item v-show=row.item.monitor.length variant="success" @click="monitor(row.item)">
                    <v-icon name="bar-chart-2"></v-icon> - Forward Status
                </b-dropdown-item>

                <b-dropdown-item v-show=row.item.monitor.length variant="info" @click="forwardManager(row.item)">
                    <v-icon name="arrow-up-right"></v-icon> - Forward Manager
                </b-dropdown-item>
            </b-dropdown>                  

      </template>        

        <div slot="table-busy" class="text-center text-danger my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
        </div>      
    </b-table>
    <b-alert 
        variant="secondary" 
        class="text-center" 
        :show=!items.length>
        There are no VMS stopped!
    </b-alert>

    <b-row>
        <b-col class="text-right">
            <strong>Total: {{ items.length }}</strong>
        </b-col>
    </b-row>

  </div>
</template>

<script>
import {apiVms} from './api'
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
    name: 'allVms',
    components: {Loading},
    data() {
        return {
            isBusy: true,
            isLoading: false,
            sdp: '',
            fields: [{
                key: 'name',
            },{
                key: 'node',
                label: 'Edge Node'                
            },{
                key: 'vmsType',
                label: 'VMS Type'
            },{
                key: 'startupParameters'
            },{
                key:'actions',
                class: 'vmsIndexActionsStopped'
            }],
            items: [],
            msg: {
                text: false,
                type: '',
                show: false
            }            
        }
    },
    methods: {

        monitor (vms) {
            this.$router.push(`/vms/${vms.nameMonitor}/monitor`)
        },

        forwardManager (vms) {
            this.$router.push(`/vms/${vms._id}/ffmanager`)
        },

        logVMS (vms) {
            this.$router.push(`/vms/${vms._id}/log`)
        },

        showSdp (vms) {
            this.sdp = vms.sdp
            this.$refs['sdpModal'].show()
        }, 

        detailsVms (vms) {
            this.$router.push(`/vms/${vms._id}/details`)
        },

        editVms (vms) {
            this.$router.push(`/vms/${vms._id}/edit`)
        },

        isRunning(vms) {
            this.isLoading = true
            apiVms.getContainerDetails(vms._id)
                .then((data) => {
                    if (data == null || data.length == 0) {
                        this.$swal.fire({
                            text: "Stopped!",
                            type: 'error',
                        })                        
                    } else {
                        this.$swal.fire({
                            text: "Running!",
                            type: 'success',
                        })
                    }
                    this.isLoading = false
                })
                .catch(e => {
                    this.isLoading = false
                    console.log(e)
                })
        },

        bindSrc (vms) {
            this.$router.push(`/vms/${vms._id}/bindSrc`)
        },

        stopVms(vms) {
            let that = this;
            this.$swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, stop it!'
            }).then((result) => {                
                if (result.value) {
                    that.isLoading = true
                    apiVms.stopVms(vms._id)
                        .then(() => {
                            that.refresh()
                            that.msg.text = "VMS stopped"
                            that.msg.type = "success"
                            that.msg.show = true
                            that.isLoading = false;
                        })
                        .catch(e => {
                            that.msg.text = `${e}`
                            that.msg.type = "danger"
                            that.msg.show = true
                            that.isLoading = false;
                            console.log(e)
                        })
                }
            })
        },

        restartVms (vms) {
            this.isLoading = true
            
            console.log(vms)

            let form = {
                name: vms.name,
                vmsType: vms.vmsType._id,
                startupParameters: vms.startupParameters,
                portForward: vms.portForward,
                id: vms._id,
                node: vms.node._id,
                nodeIp: vms.node.ip
            };

            apiVms.newVms(form)
                .then(() => {
                    this.refresh()
                    this.msg.text = "VMS started"
                    this.msg.type = "success"
                    this.isLoading = false;
                })
                .catch((e) => {
                    this.refresh()
                    this.msg.text = `Error when starting the VMS ${e}`
                    this.msg.type = "danger"
                    this.isLoading = false;
                })
        },


        removeStoppedVms(vms) {
            this.$swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, stop it!'
            }).then((result) => {
                if (result.value) {
                    apiVms.removeVms(vms._id)
                        .then(() => {
                            this.refresh()
                        })
                        .catch(e => {
                            console.log(e)
                        })
                }
            })
        },

        refresh() {
            this.isBusy = true
            apiVms.getAllVms()
                .then((data) => {

                    for (let i = 0; i < data.length; i++) {                        
                        if (data[i].node == null) {
                            data[i].node = []
                            data[i].node['name'] = "ALERT - Edge Node Removed"
                        }
                    }
                                        
                    this.items = data
                    this.isBusy = false
                    this.isLoading = false;
                })                
                .catch(e => {
                    this.isBusy = false
                    console.log(e)
                })
        }
    },
    created() {
        this.refresh()
    }
}
</script>

<style>
    .vmsIndexActionsStopped {
        width: 315px;
        text-align: center;
    }
</style>