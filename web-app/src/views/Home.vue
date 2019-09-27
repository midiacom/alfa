<template>
  <div class="home">

    <h2 class="text-center">
      <v-icon style="width: 48px;" name="bar-chart"></v-icon>
      Dashboard
    </h2>

    <!-- This is the part of the system that imports the basic data -->
    <b-alert :show="items.length>0" >
      <h3>It seems that is the first time you are here!</h3>
      <p>If it's true then to run the above button and import the initial data.</p>
      <hr>
      <strong>This button will gerenate the above data.</strong>
      <ul>
        <li>One Location</li>
        <li>4 SRC Types</li>
        <li>3 VMS Types</li>
        <li>4 Devices</li>
      </ul>

      <strong>This button will compile the dockerfiles of SRC and VMS, it can takes a while. .</strong>
      <b-button variant="warning" @click="bootstrap()" size="lg">Import Data</b-button>

    </b-alert>

    <!-- <b-card-group deck>
      <b-card header="Location" class="text-center">
        <b-card-text>
          10
        </b-card-text>
      </b-card>
      <b-card header="Devices" class="text-center">
        <b-card-text>
          20
        </b-card-text>
      </b-card>
    </b-card-group> -->
  </div>
</template>

<script>

import {apiLocation} from './location/api'
import { config } from '../config'

export default {
  name: 'home',
  data() {
      return {
          items: []
      }
  },  
  methods: {
    bootstrap () {
      config.api.get(`/bootstrap`)
        .then(resp => {
          this.refresh()
        })
        .catch(e => {
          reject(e)
        })
    },
    refresh() {
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
    this.refresh();
  }  
}
</script>
