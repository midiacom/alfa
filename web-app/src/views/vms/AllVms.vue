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
                <v-icon style="width: 32px;" name="pause-circle"></v-icon>
                All VMSs Started (Running and Stopped)
            </h2>

            <b-alert :show="msg.text" :v-show="msg.text" :variant=msg.type>
                {{ msg.text }}
            </b-alert>
        </b-col>
    </b-row>
    
    <b-table
        :busy="isBusy"
        :items="items" 
        :fields="fields" 
        striped 
        responsive="sm">

        <template v-slot:cell(vmsType)="row">
            {{row.item.vmsType.name}}
        </template>

        <template v-slot:cell(dockerId)="row">
            <a href="#" @click="detailsVms(row.item)">
                {{row.item.dockerId | truncate(12, ' ')}}
            </a>
        </template>

        <template v-slot:cell(node)="row">
            {{ row.item.node.name }} / {{ row.item.node.ip }}
        </template>


      <template v-slot:cell(actions)="row">
            <b-button variant="success" size="sm" @click="bindSrc(row.item)" class="mr-2">
                <v-icon name="minimize-2"></v-icon>
                Bind / Unbind
            </b-button>

            <b-button variant="success" size="sm" @click="restartVms(row.item)" class="mr-2">
                <v-icon name="play-circle"></v-icon>
                Recreate
            </b-button>

            <b-button variant="danger" size="sm" @click="removeStoppedVms(row.item)" class="mr-2">
                <v-icon name="trash"></v-icon>
                Remove
            </b-button>

            <b-button variant="secondary" size="sm" @click="stopVms(row.item)" class="mr-2">
                <v-icon name="stop-circle"></v-icon>
                Stop
            </b-button>

            <b-button variant="primary" size="sm" @click="showSdp(row.item)" class="mr-2">
                <v-icon name="eye"></v-icon>
                View
            </b-button>

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
            msg: {
                text: false,
                type: ''
            },            
            fields: [{
                key: 'dockerId',
                label: '#'
            },{
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
            items: []
        }
    },
    methods: {

        showSdp (vms) {
            this.sdp = vms.sdp
            this.$refs['sdpModal'].show()
        }, 

        detailsVms (vms) {
            this.$router.push(`/vms/${vms._id}/details`)
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
                            this.refresh()
                            that.isLoading = false
                        })
                        .catch(e => {
                            console.log(e)
                        })
                }
            })
        },

        restartVms (vms) {
            this.isLoading = true

            let form = {
                name: vms.name,
                vmsType: vms.vmsType._id,
                startupParameters: vms.startupParameters,
                id: vms._id
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
                    this.items = data
                    this.isBusy = false
                })
                .catch(e => {
                    this.isBusy = false
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
        width: 650px;
        text-align: center;
    }
</style>