<template>
  <div>
    <b-row>
        <b-col>            
            <h2>
                <v-icon style="width: 32px;" name="send"></v-icon>
                Running VMS
            </h2>
        </b-col>
        <b-col class="text-right">
            <b-button to="/vmsType" variant="success" class="mr-2">
                <v-icon name="plus"></v-icon>
                New
            </b-button>    
        </b-col>
    </b-row>
    <b-table
        :busy="isBusy"
        :items="items" 
        :fields="fields" 
        striped 
        responsive="sm">

        <template slot="containerId" slot-scope="row">
            {{row.item.containerId | truncate(12, ' ')}}
        </template>

        <template slot="[Status]" slot-scope="row">
            {{ row.item.containerInfo.State }}
            {{ row.item.containerInfo.Status }}
        </template>

        <template slot="[actions]" slot-scope="row">
            
            <b-button variant="success" size="sm" @click="bindSrc(row.item)" class="mr-2">
                <v-icon name="minimize-2"></v-icon>
                Bind SRC
            </b-button>


            <b-button variant="primary" size="sm" @click="detailsVms(row.item)" class="mr-2">
                Details
            </b-button>

            <b-button variant="danger" size="sm" @click="removeVms(row.item)" class="mr-2">
                Stop
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
        There are no VMS yet!
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

export default {
    name: 'vmsIndex',
    data() {
        return {
            isBusy: true,
            fields: [{
                key: 'vmsType',
            },{
                key: 'startupParameters'
            },{            
                key: 'bindedTo'
            },{
                key: 'Status'
            },{
                key:'actions',
                class: 'vmsIndexActions'
            }],
            items: []
        }
    },
    methods: {
        bindSrc (vms) {
            this.$router.push(`/vms/${vms._id}/bindSrc`)
        },
        detailsVms (vms) {
            this.$router.push(`/vms/${vms.containerId}/details`)
        },
        removeVms(vms) {
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
            apiVms.getAllVms()
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
    .vmsIndexActions {
        width: 300px;
        text-align: center;
    }
</style>