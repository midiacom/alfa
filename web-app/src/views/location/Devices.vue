<template>
  <div>    
    <b-row>
        <b-col>            
            <h2>
                <v-icon name="map-pin"></v-icon>
                Devices in "{{location.name}}"
            </h2>
        </b-col>
    </b-row>
    <b-table 
    :busy="isBusy"
    :items="items" 
    :fields="fields" 
    striped 
    responsive="sm">
        <template slot="[actions]" slot-scope="row">
            <b-button variant="primary" size="sm" @click="editDevice(row.item)" class="mr-2">
                Edit
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
        :show=!items.length
        >There are no devices in this location yet!</b-alert>

    <b-row>
        <b-col class="text-right">
            <strong>Total: {{ items.length }}</strong>
        </b-col>
    </b-row>

    </div>
</template>

<script>
import {apiLocation} from './api'

export default {
    name: 'locationDevices',
    data() {
        return {
            isBusy: true,
            location: {
                name: ''
            },
            fields: [{
                key: 'name',
            },{
                key:'actions',
                class: 'locationDeviceActions'
            }],
            items: []
        }
    },
    methods: {
        editDevice (location) {
            this.$router.push(`/device/${location._id}/edit`)
        },
        refresh() {
            this.isBusy = true
            apiLocation.getLocation(this.$route.params.id)
                .then((data) => {
                    this.location = data
                    this.isBusy = false
                })
                .catch(e => {
                    console.log(e)
                    this.isBusy = false
                })

            apiLocation.getDevices(this.$route.params.id)
                .then((data) => {
                    this.items = data
                })
                .catch(e => {
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
    .locationDeviceActions {
        width: 100px;
        text-align: center;
    }
</style>