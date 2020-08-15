<template>
  <div>
    <b-row>
        <b-col>            
            <h2>
                <v-icon style="width: 32px;" name="command"></v-icon>
                VMS Types
            </h2>
        </b-col>
        <b-col class="text-right">
            <b-button to="/vmsType/new" variant="success" class="mr-2">
                <v-icon name="plus"></v-icon>
                New VMS Type
            </b-button>    
        </b-col>
    </b-row>
    <b-table
        :busy="isBusy"
        :items="items" 
        :fields="fields" 
        striped 
        responsive="sm">

        <template slot="[dockerImage]" slot-scope="row">
            {{ row.item.dockerImage }}
        </template>
      <template v-slot:cell(actions)="row">
            <b-button variant="success" size="sm" @click="newVms(row.item)" class="mr-2">
                <v-icon name="play-circle"></v-icon>
                Start
            </b-button>

            <b-button variant="primary" size="sm" @click="editVmsType(row.item)" class="mr-2">
                <v-icon name="edit-2"></v-icon>
            </b-button>

            <b-button variant="danger" size="sm" @click="removeVmsType(row.item)" class="mr-2">
                <v-icon name="trash"></v-icon>
            </b-button>
      </template>        

        <div slot="table-busy" class="text-center text-danger my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong> Loading...</strong>
        </div>      
    </b-table>
    <b-alert 
        variant="secondary" 
        class="text-center" 
        :show=!items.length>
        There are no VMS Types yet!
    </b-alert>

    <b-row>
        <b-col class="text-right">
            <strong>Total: {{ items.length }}</strong>
        </b-col>
    </b-row>

  </div>
</template>

<script>
import {apiVmsType} from './api'

export default {
    name: 'vmsTypeIndex',
    data() {
        return {
            isBusy: true,
            fields: [{
                key: 'name',
            },{
                key: 'dockerImage'
            },{
                key:'actions',
                class: 'vmsTypeIndexActions'
            }],
            items: []
        }
    },
    methods: {
        editVmsType (vmsType) {
            this.$router.push(`/vmsType/${vmsType._id}/edit`)
        },
        newVms (vmsType) {
            this.$router.push(`/vms/new/${vmsType._id}/`)
        },
        removeVmsType(vmsType) {
            this.$swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.value) {
                    apiVmsType.removeVmsType(vmsType._id)
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
            apiVmsType.getVmsTypesVms()
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
    .vmsTypeIndexActions {
        width: 240px;
        text-align: center;
    }
</style>