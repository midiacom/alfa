<template>
  <div>    
    <loading :active.sync="isLoading" :is-full-page="true"></loading>      
    <b-row>
        <b-col>            
            <h2>
                <v-icon style="width: 32px;" name="git-commit"></v-icon>
                Edge Nodes
            </h2>
        </b-col>
        <b-col class="text-right">
            <b-button @click="updateStatus()" variant="info" class="mr-2">
                <v-icon name="refresh-ccw"></v-icon>
                Update Status
            </b-button>    
            <b-button to="/node/new" variant="success" class="mr-2">
                <v-icon name="plus"></v-icon>
                New
            </b-button>    
        </b-col>
    </b-row>
    <b-row>
        <b-col>            
            <b-alert :show="msg.show" :variant=msg.type>
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

      <template v-slot:cell(online)="data">

        <b-badge v-show=data.item.online variant="success">Online</b-badge>
        <b-badge v-show=!data.item.online variant="danger">Offline</b-badge>

      </template>

      <template v-slot:cell(actions)="row">        

        <b-button variant="primary" size="sm" @click="editNode(row.item)" class="mr-2">
            <v-icon name="edit-2"></v-icon>
        </b-button>

        <b-button variant="danger" size="sm" @click="removeNode(row.item)" class="mr-2">
            <v-icon name="trash"></v-icon>
        </b-button>
    
        <b-button v-show=row.item.online variant="warning" size="sm" @click="statusNode(row.item)" class="mr-2">
            <v-icon name="info"></v-icon>
        </b-button>

        <b-button v-show=row.item.online variant="secondary" size="sm" @click="imagesNode(row.item)" class="mr-2">
            <v-icon name="cpu"></v-icon>
            VN Images
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
        There are no nodes yet!
    </b-alert>

    <b-row>
        <b-col class="text-right">
            <strong>Total: {{ items.length }}</strong>
        </b-col>
    </b-row>
  </div>
</template>

<script>
import {apiNode} from './api'
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
    name: 'nodeIndex',
    components: {Loading},
    data() {
        return {
            isBusy: true,
            isLoading: false,
            fields: [{
                key: 'name'
            },{
                key: 'ip',
                label: 'IP',
                class: 'nodeIpList'
            },{
                key: 'online',
                label: 'Status',
                class: 'nodeStatusList'
            },{
                key: 'virtualEntityNum',
                label: 'VMS Num.',
                class: 'vmsNumList'
            },
            {
                key:'actions',
                class: 'nodeIndexActions'
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
        editNode (node) {
            this.$router.push(`/node/${node._id}/edit`)
        },

        imagesNode (node) {
            this.$router.push(`/node/${node.ip}/images`)
        },

        statusNode (node) {
            this.$router.push(`/node/${node._id}/status`)
        },

        updateStatus () {
            this.isBusy = true
            this.isLoading = false
            apiNode.updateStatus()
                .then(() => {
                    this.refresh()
                })
                .catch(e => {
                    console.log(e)
                    this.isBusy = false
                })              
        },

        removeNode(node) {
            this.$swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.value) {
                    apiNode.removeNode(node._id)
                        .then(() => {
                            this.refresh()
                            this.msg.text = "Edge node emoved"
                            this.msg.type = "success"
                            this.msg.show = true                            
                        })
                        .catch(e => {
                            console.log(e)
                            this.msg.text = "Erro when removind edge node"
                            this.msg.type = "danger"
                            this.msg.show = true
                        })
                }
            })
        },
        refresh() {
            this.isBusy = true
            this.isLoading = false
            apiNode.getNodes()
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
    .nodeIndexActions {
        width: 350px;
        text-align: left;        
    }
    .nodeStatusList {
        width: 60px;
        text-align: center;
    }
    .nodeIpList {
        width: 100px;
        text-align: left;
    }
    .vmsNumList {
        width: 140px;
        text-align: center;
    }
</style>