<template>
  <div>
    <loading :active.sync="isLoading" :is-full-page="true"></loading>
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

    <b-table
        small
        :busy="isBusy"
        :items="items" 
        :fields="fields" 
        striped 
        responsive="sm">

        <template v-slot:cell(ipAddress)="row">
            {{row.item.containerInfo.NetworkSettings.Networks.bridge.IPAddress }}
        </template>

        <template v-slot:cell(bindedTo)="row">
            {{ row.item.bindedTo | showPorts }}
            
        </template>

        <template v-slot:cell(dockerId)="row">
            <a href="#" @click="detailsVms(row.item)">
                {{row.item.containerId | truncate(12, ' ')}}
            </a>
        </template>


        <template v-slot:cell(status)="row">
                
            <span style="text-transform: capitalize">
                {{row.item.containerInfo.State }} /
            </span>
                {{ row.item.containerInfo.Status }}
        </template>

      <template v-slot:cell(actions)="row">
            
            <b-button variant="success" size="sm" @click="bindSrc(row.item)" class="mr-2">
                <v-icon name="minimize-2"></v-icon>
                Bind / Unbind
            </b-button>

<!--
            <b-button v-show=row.item.bindedTo variant="secondary" size="sm" @click="unbindSrc(row.item)" class="mr-2">
                <v-icon name="maximize-2"></v-icon>
                Unbind
            </b-button>

            <b-button variant="primary" size="sm" @click="detailsVms(row.item)" class="mr-2">
                <v-icon name="code"></v-icon>
                Details
            </b-button>
-->
            <b-button variant="danger" size="sm" @click="stopVms(row.item)" class="mr-2">
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
        There are no VMS yet!
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
    name: 'vmsIndex',
    components: {Loading},
    data() {
        return {
            isBusy: true,
            isLoading: false,
            sdp: '',
            fields: [{
                key: 'dockerId',
                label: 'Container ID'
            },{
                key: 'vmsType',
                label: 'VMS Type'
            },{
                key: 'name'
            },{
                key: 'startupParameters',
                label: 'Parameters'
            },{
                key: 'ipAddress',
                label: 'IP'
            },{            
                key: 'bindedTo',
                label: 'Binded'
            },{
                key: 'Status',
                label:'Up Time'
            },{
                key:'actions',
                class: 'vmsIndexActions2'
            }],
            items: []
        }
    },
    methods: {
        showSdp (vms) {
            this.sdp = vms.sdp
            this.$refs['sdpModal'].show()
        }, 
        bindSrc (vms) {
            this.$router.push(`/vms/${vms._id}/bindSrc`)
        },
        detailsVms (vms) {
            this.$router.push(`/vms/${vms.containerId}/details`)
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
                    this.isLoading = false
                })
                .catch(e => {
                    console.log(e)
                    this.isBusy = false
                    this.isLoading = false
                })
        }
    },
    created() {
        this.refresh()
    },

}
</script>

<style>
    .vmsIndexActions2 {
        width: 380px;
        text-align: center;
    }
</style>