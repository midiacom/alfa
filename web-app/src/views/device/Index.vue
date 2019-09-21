<template>
  <div>    
    <b-row>
        <b-col>            
            <h2>
                <v-icon style="width: 32px;" name="cast"></v-icon>
                Devices
            </h2>
        </b-col>
        <b-col class="text-right">
            <b-button to="/device/new" variant="success" class="mr-2">
                <v-icon name="plus"></v-icon>
                New
            </b-button>    
        </b-col>
    </b-row>
    <b-row>
        <b-col>            
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
      <template slot="location" slot-scope="row">
          {{ row.item.location.name }}
      </template>

      <template slot="[actions]" slot-scope="row">
        <b-button v-show=!row.item.dockerId variant="success" size="sm" @click="starSrcDevice(row.item)" class="mr-2">
            <v-icon name="play-circle"></v-icon>
            Start SRC
        </b-button>

        <b-button v-show=row.item.dockerId variant="secondary" size="sm" @click="stopSrcDevice(row.item)" class="mr-2">
            <v-icon name="stop-circle"></v-icon>
            Stop SRC
        </b-button>
        
        <b-button variant="primary" size="sm" @click="editDevice(row.item)" class="mr-2">
            <v-icon name="edit-2"></v-icon>
            Edit
        </b-button>

        <b-button variant="danger" size="sm" @click="removeDevice(row.item)" class="mr-2">
            <v-icon name="trash"></v-icon>
            Remove
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

export default {
    name: 'deviceIndex',
    data() {
        return {
            isBusy: true,
            fields: [{
                key: 'name',
            },{
                key:'location'
            },{
                key:'actions',
                class: 'deviceIndexActions'
            }],
            items: [],
            msg: {
                text: false,
                type: ''
            }
        }
    },
    methods: {
        stopSrcDevice (device) {
            apiDevice.stopSrcDevice(device._id)
                .then(() => {
                    this.refresh()
                    this.msg.text = "Device SRC stopped"
                    this.msg.type = "success"
                })
                .catch((e) => {
                    this.refresh()
                    this.msg.text = `Error when stopping the SRC device ${e}`
                    this.msg.type = "danger"
                })
        },
        starSrcDevice (device) {
            apiDevice.starSrcDevice(device._id)
                .then(() => {
                    this.refresh()
                    this.msg.text = "Device SRC started"
                    this.msg.type = "success"
                })
                .catch((e) => {
                    this.refresh()
                    this.msg.text = `Error when starting the SRC device ${e}`
                    this.msg.type = "danger"
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
            apiDevice.getDevices()
                .then((data) => {
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
        width: 320px;
        text-align: center;
    }
</style>