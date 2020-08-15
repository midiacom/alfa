<template>
  <div>
    <b-row>
        <b-col>            
            <h2>
                <v-icon style="width: 32px;" name="map-pin"></v-icon>                                
                Locations
            </h2>
        </b-col>
        <b-col class="text-right">
            <b-button to="/location/new" variant="success" class="mr-2">
                <v-icon name="plus"></v-icon>
                New Location
            </b-button>    
        </b-col>
    </b-row>
    <b-table
        :busy="isBusy"
        :items="items" 
        :fields="fields" 
        striped 
        responsive="sm">
      <template v-slot:cell(actions)="row">
        <b-button variant="primary" size="sm" @click="editLocation(row.item)" class="mr-2">
            <v-icon name="edit-2"></v-icon>
        </b-button>

        <b-button variant="danger" size="sm" @click="removeLocation(row.item)" class="mr-2">
            <v-icon name="trash"></v-icon>
        </b-button>

        <b-button variant="warning" size="sm" @click="devicesLocation(row.item)" class="mr-2">
            <v-icon name="cpu"></v-icon>
            Devices
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
        There are no locations yet!
    </b-alert>

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
    name: 'locationIndex',
    data() {
        return {
            isBusy: true,
            fields: [{
                key: 'name',
            },{
                key:'actions',
                class: 'locationIndexActions'
            }],
            items: []
        }
    },
    methods: {
        editLocation (location) {
            this.$router.push(`/location/${location._id}/edit`)
        },
        devicesLocation (location) {
            this.$router.push(`/location/${location._id}/devices`)
        },
        removeLocation(location) {
            this.$swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.value) {
                    apiLocation.removeLocation(location._id)
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
            apiLocation.getLocations()
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
    .locationIndexActions {
        width: 285px;
        text-align: center;
    }
</style>