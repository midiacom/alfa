<template>
  <div class="home">

    <h2 class="text-center">
      <v-icon style="width: 48px;" name="bar-chart"></v-icon>
      Dashboard
    </h2>

    <b-alert :show="showMsg" variant="danger">
      <h3>Important!</h3>
      <strong>Before using this system you need to build the docker images from SRC and VMS. The easy way to do it is running ./compile_src_and_vms.sh at the alfa/alfa folder .</strong>
    </b-alert>

    <!-- This is the part of the system that imports the basic data -->
    <b-alert :show="showMsg" >
      <h3>It seems that is the first time you are here!</h3>
      <p>If it's true then to run the above button and import the initial data.</p>
      <hr>
      <strong>This button will gerenate the above data.</strong>
      <ul>
        <li>One Location</li>
        <li>5 SRC Types</li>
        <li>4 VMS Types</li>
        <li>6 Devices</li>
      </ul>

      <b-button variant="warning" @click="bootstrap()" size="lg">Import Data</b-button>

    </b-alert>


  <div :show="!showMsg" style="font-size:18px">
    <b-card-group deck>
      <b-card 
        bg-variant="light" 
        text-variant="black">
        <b-card-title>            
            <strong>
              <v-icon name="cast"></v-icon>
              Devices
            </strong>
        </b-card-title>
        <hr/>
        <b-card-text>
          <ul>
            <li>
              <strong>Created:</strong> {{ devices.total }}
            </li>
            <li>
              <strong>Started:</strong> {{ devices.started }}
            </li>
          </ul>
        </b-card-text>
        <b-button to="/device" variant="success" class="mr-2">
          List Devices
        </b-button>
      </b-card>

      <b-card bg-variant="light" text-variant="black">
        <b-card-title>            
            <strong>
              <v-icon name="command"></v-icon>
              VMS
            </strong>
        </b-card-title>
        <b-card-text>
          <ul>
            <li>
              <strong>Created:</strong> {{ vms.total }}
            </li>
            <li>
              <strong>Started:</strong> {{ vms.started }}
            </li>
          </ul>
        </b-card-text>
        <b-button to="/vms" variant="success" class="mr-2">
          List VMS
        </b-button>
      </b-card>

   </b-card-group>



  </div>
    
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
import {apiDevice} from './device/api'
import {apiVms} from './vms/api'
import {config} from '../config'

export default {
  name: 'home',
  data() {
      return {
          items: [],
          showMsg: false,
          devices: {
            total: 0,
            started: 0
          },
          vms: {
            total: 0,
            started: 0
          }
      }
  },  
  methods: {
    bootstrap () {
      config.api.get(`/bootstrap`)
        .then(() => {
          this.showMsg = false;
          this.refresh()
        })
        .catch(e => {
          console.log(e)
        })
    },
    refresh() {
      apiDevice.getDevices()
        .then((data) => {
          this.devices.total = data.length
          data.forEach((value) => {
            if (value.dockerId != "") {
              this.devices.started++;
            }
          });
        })

      apiVms.getAllVms()
        .then((data) => {
          this.vms.started = data.length
        })

      /*apiVms.getStoppedVms()
        .then((data) => {
          this.vms.total = data.length
        })*/

      apiLocation.getLocations()
          .then((data) => {
              if (data.length == 0) {
                this.showMsg = true;
              }
          })
          .catch(e => {
              console.log(e)
          })
    }
  },
  created() {
    this.refresh();
  }  
}
</script>
