<template>
  <div>
    
    <b-row>
        <b-col>
            <h2>Locations list</h2>
        </b-col>
        <b-col class="text-right">
            <b-button variant="success" @click="newLocation" size="sm" class="mr-2">
                New
            </b-button>    
        </b-col>
    </b-row>
    <b-table :items="items" :fields="fields" striped responsive="sm">
      <template slot="[actions]" slot-scope="row">
        <b-button variant="primary" size="sm" @click="editLocation(row.item)" class="mr-2">
            Edit
        </b-button>
        <b-button variant="danger" size="sm" @click="removeLocation(row.item)" class="mr-2">
            Remove
        </b-button>
      </template>        
    </b-table>
  </div>
</template>

<script>
import {apiLocation} from './api'

export default {
    name: 'locationIndex',
    data() {
        return {
            fields: ['name','actions'],
            items: []
        }
    },
    methods: {
        newLocation() {
            this.$router.push(`/location/new/`)
        },
        editLocation (location) {
            this.$router.push(`/location/edit/${location._id}`)
        },
        removeLocation(location) {
            apiLocation.removeLocation(location._id)
                .then((data) => {
                    this.refresh()
                })
                .catch(e => {
                    console.log(e)
                })       
        },
        refresh() {
            apiLocation.getLocations()
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