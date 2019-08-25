<template>
  <div>
    
    <b-row>
        <b-col>            
            <h2>
                <v-icon name="cast"></v-icon>
                Devices
            </h2>
        </b-col>
        <b-col class="text-right">
            <b-button to="/device/new" variant="success" size="sm" class="mr-2">New</b-button>    
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
        <b-button variant="primary" size="sm" @click="editDevice(row.item)" class="mr-2">
            Edit
        </b-button>

        <b-button variant="danger" size="sm" @click="removeDevice(row.item)" class="mr-2">
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
            items: []
        }
    },
    methods: {
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
        width: 250px;
        text-align: center;
    }
</style>