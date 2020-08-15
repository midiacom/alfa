<template>
  <div class="home">

    <h2 class="text-center">
      Dashboard
    </h2>
    <hr>

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
        <li>One Edge Node</li>
        <li>One Location</li>
        <li>6 SRC Types</li>
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
              Virtual Devices
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
          List Virtual Devices
        </b-button>
      </b-card>

      <b-card bg-variant="light" text-variant="black">
        <b-card-title>            
            <strong>
              <v-icon name="command"></v-icon>
              VMS
            </strong>
        </b-card-title>
        <hr/>
        <b-card-text>
          <ul>
            <li>
              <strong>Created:</strong> {{ vms.started }}
            </li>
            <li>
              <strong>Running:</strong> #
            </li>
          </ul>
        </b-card-text>
        <b-button to="/vms/allvms" variant="success" class="mr-2 center">
          List VMS
        </b-button>
      </b-card>

      <b-card bg-variant="light" text-variant="black">
        <b-card-title>            
            <strong>
              <v-icon name="git-commit"></v-icon>
              Edge Nodes
            </strong>
        </b-card-title>
        <hr/>
        <b-card-text>
          <ul>
            <li>
              <strong>Deployed:</strong> {{ node.total }}
            </li>
            <li>
              <strong>Running:</strong> {{ node.running }}
            </li>
          </ul>
        </b-card-text>
        <b-button to="/vms/allvms" variant="success" class="mr-2">
          List Edge Nodes
        </b-button>
      </b-card>

   </b-card-group>

  <hr/>

  <div>
  <b-row>
    <b-col style="text-align:center">
      <b-button variant="info"  v-b-toggle.sidebar-right>
        <v-icon name="help-circle"></v-icon>
        More Informations
      </b-button>
      <b-sidebar width="30%" id="sidebar-right" title="" right shadow>
        <div class="px-3 py-2">
          <h4 style="text-align:center">ALFA - IoMT Manager</h4>
          <h5 style="text-align:center">A V-PRISM Implementation</h5>
          <p style="text-align:center">
            <b-img src="logo_vprism_color.png" width="100%"></b-img>
          </p>
          <p>
            Multimedia sensors have recently become a major data source in the Internet of Things (IoT), 
            giving rise to the Internet of Media Things (IoMT). Since multimedia applications are usually latency-sensitive, 
            data processing in the cloud is not always practical. A strategy to minimize delay is to
            process the multimedia streams closer to the data sources, 
            exploiting the resources at the edge of the network. V-PRISM, is an architecture to virtualize 
            and manage multimedia sensors with components deployed and executed in multiples edge nodes.
            The entity that processes the multimedia stream is called Virtual Multimedia Sensor (VMS),
            and they can be dynamically allocated by the execution of different types of resource allocation algorithm.
          </p>
          <a href="https://github.com/anselmobattisti/alfa" class="card-link">More Informations </a>
        </div>
      </b-sidebar>
    </b-col>
  </b-row>      
  </div>

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
import {apiNode} from './node/api'
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
          },
          node: {
            total: 0,
            running: 0
          }
      }
  },  
  methods: {
    bootstrap () {
      config.api.get(`/configuration/bootstrap`)
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

      apiNode.getNodes()
        .then((data) => {
          this.node.total = data.length

          data.forEach((value) => {
            if (value.online == true) {
              this.node.running++;
            }
          });
        })

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
