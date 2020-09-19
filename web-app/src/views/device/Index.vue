<template>
  <div>    
    <loading :active.sync="isLoading" :is-full-page="true"></loading>      
    <b-row>
        <b-col>            
            <h2>
                <v-icon style="width: 32px;" name="cast"></v-icon>
                Virtual Devices
            </h2>
        </b-col>
        <b-col class="text-right">
            <b-button to="/device/new" variant="success" class="mr-2">
                <v-icon name="plus"></v-icon>
                New
            </b-button>    
        </b-col>
    </b-row>

        <b-alert :show="msg.show" :variant=msg.type>
            {{ msg.text }}
        </b-alert>

    <b-table
        :busy="isBusy"
        :items="items" 
        :fields="fields" 
        striped 
        responsive="sm">

      <template v-slot:cell(location)="data">
          {{ data.item.location.name }}
      </template>
      
      <template v-slot:cell(node)="data">
          <span v-b-tooltip.hover :title=data.item.node.name>{{ data.item.node.ip }}</span>
      </template>

      <template v-slot:cell(actions)="row">
        <b-button v-show=!row.item.dockerId variant="success" size="sm" @click="starSrcDevice(row.item)" class="mr-2">
            <v-icon name="play-circle"></v-icon>
        </b-button>

        <b-button v-show=row.item.dockerId variant="secondary" size="sm" @click="stopSrcDevice(row.item)" class="mr-2">
            <v-icon name="stop-circle"></v-icon>
        </b-button>
        
        <b-button variant="primary" size="sm" @click="editDevice(row.item)" class="mr-2">
            <v-icon name="edit-2"></v-icon>
        </b-button>

        <b-button variant="danger" size="sm" @click="removeDevice(row.item)" class="mr-2">
            <v-icon name="trash"></v-icon>
        </b-button>

        <b-button v-show=row.item.dockerId variant="warning" size="sm" @click="containerDetails(row.item)" class="mr-2">
            <v-icon name="info"></v-icon>
        </b-button>

        <b-button v-show=row.item.dockerId variant="info" size="sm" @click="containerLog(row.item)" class="mr-2" title="Container Logs">
            <v-icon name="align-justify"></v-icon>
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
        There are no devices yet!
    </b-alert>

    <b-row>
        <b-col class="text-right">
            <strong>Total: {{ items.length }}</strong>
        </b-col>
    </b-row>
  </div>
</template>

<script>
import {apiDevice} from './api'
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
    name: 'deviceIndex',
    components: {Loading},
    data() {
        return {
            isBusy: true,
            isLoading: false,
            fields: [{
                key: 'name',
            },{
                key: 'connectionType'
            },{
                key:'location'
            },{
                key:'node',
                label: 'Edge Node',
                class: 'edgeNodeCol'
            },{
                key:'actions',
                class: 'deviceIndexActions'
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

        containerDetails (device) {
            this.$router.push(`/device/${device._id}/details`)
        },

        containerLog (device) {
            this.$router.push(`/device/${device._id}/log`)
        },

        stopSrcDevice (device) {
            apiDevice.stopSrcDevice(device._id)
                .then(() => {
                    this.refresh()
                    this.msg.text = "Virtual Device Stopped"
                    this.msg.type = "success"
                    this.msg.show = true

                })
                .catch((e) => {
                    this.refresh()
                    this.msg.text = `Error when stopping the SRC device ${e}`
                    this.msg.type = "danger"
                    this.msg.show = true
                })
        },
        starSrcDevice (device) {
            this.isLoading = true
            apiDevice.starSrcDevice(device._id)
                .then(() => {
                    this.refresh()
                    this.msg.text = "Virtual Device started"
                    this.msg.type = "success"
                    this.msg.show = true
                })
                .catch((e) => {
                    this.refresh()
                    this.msg.text = `Error when starting the SRC device ${e}`
                    this.msg.type = "danger"
                    this.msg.show = true
                })
        },
        editDevice (device) {
            this.$router.push(`/device/${device._id}/edit`)
        },
        removeDevice(device) {
            this.$swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.value) {
                    apiDevice.removeDevice(device._id)
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
            this.isLoading = false
            apiDevice.getDevices()
                .then((data) => {

                    for (let i = 0; i < data.length; i++) {
                        if (data[i].node == null) {
                            data[i].node = []
                            data[i].node['name'] = "ALERT - Edge Node Removed"
                        }
                    }

                    this.items = data
                    this.isBusy = false
                })
                .catch(e => {
                    console.log(e)
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
    .deviceIndexActions {
        width: 300px;
        text-align: center;
    }
    .edgeNodeCol {
        width: 150px;
        text-align: center;
    }    
</style>