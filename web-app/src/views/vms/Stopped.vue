<template>
  <div>
    <b-row>
        <b-col>            
            <h2>
                <v-icon style="width: 32px;" name="pause-circle"></v-icon>
                VMS in All States (Running and Stopped)
            </h2>
        </b-col>
    </b-row>
    <b-table
        :busy="isBusy"
        :items="items" 
        :fields="fields" 
        striped 
        responsive="sm">

        <template slot="vmsType" slot-scope="row">
            {{row.item.vmsType.name}}
        </template>

        <template slot="containerId" slot-scope="row">
            {{row.item.dockerId | truncate(12, ' ')}}
        </template>

      <template v-slot:cell(actions)="row">
            <!--
            <b-button variant="success" size="sm" @click="detailsVms(row.item)" class="mr-2">
                <v-icon name="refresh-cw"></v-icon>
                Restart
            </b-button>
            -->
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

export default {
    name: 'vmsStopped',
    data() {
        return {
            isBusy: true,
            fields: [{
                key: 'containerId',
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
        width: 130px;
        text-align: center;
    }
</style>