<template>
  <div>
    <loading :active.sync="isLoading" :is-full-page="true"></loading>

    <b-row>
        <b-col>            
            <h2>
                <v-icon style="width: 32px;" name="pause-circle"></v-icon>
                All VMSs Started (Running and Stopped)
            </h2>

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

        <template v-slot:cell(vmsType)="row">
            {{row.item.vmsType.name}}
        </template>

        <template v-slot:cell(dockerId)="row">
            {{row.item.dockerId | truncate(12, ' ')}}
        </template>

      <template v-slot:cell(actions)="row">
            <b-button variant="success" size="sm" @click="restartVms(row.item)" class="mr-2">
                <v-icon name="play-circle"></v-icon>
                Restart
            </b-button>

            <b-button variant="danger" size="sm" @click="removeStoppedVms(row.item)" class="mr-2">
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
        There are no VMS stopped!
    </b-alert>

    <b-row>
        <b-col class="text-right">
            <strong>Total: {{ items.length }}</strong>
        </b-col>
    </b-row>

  </div>
</template>

<script>
import {apiVms} from './api'
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
    name: 'vmsStopped',
    components: {Loading},
    data() {
        return {
            isBusy: true,
            isLoading: false,
            msg: {
                text: false,
                type: ''
            },            
            fields: [{
                key: 'name',
            },{
                key: 'vmsType'
            },{
                key: 'startupParameters'
            },{
                key:'actions',
                class: 'vmsIndexActionsStopped'
            }],
            items: []
        }
    },
    methods: {
        restartVms (vms) {
            this.isLoading = true

            let form = {
                name: vms.name,
                vmsType: vms.vmsType._id,
                startupParameters: vms.startupParameters,
                id: vms._id
            };

            apiVms.newVms(form)
                .then(() => {
                    this.refresh()
                    this.msg.text = "VMS started"
                    this.msg.type = "success"
                    this.isLoading = false;
                })
                .catch((e) => {
                    this.refresh()
                    this.msg.text = `Error when starting the VMS ${e}`
                    this.msg.type = "danger"
                    this.isLoading = false;
                })
        },

        detailsVms (vms) {
            this.$router.push(`/vms/${vms.containerId}/details`)
        },
        removeStoppedVms(vms) {
            this.$swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, stop it!'
            }).then((result) => {
                if (result.value) {
                    apiVms.removeVms(vms._id)
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
            apiVms.getStoppedVms()
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
    .vmsIndexActionsStopped {
        width: 230px;
        text-align: center;
    }
</style>