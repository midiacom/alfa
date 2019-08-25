<template>
  <div>
    <h2>Locations list</h2>
    <router-link to="/location/new">New</router-link>
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
        editLocation(location) {
            console.log(location)
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