<template>
  <div>    
    <loading :active.sync="isLoading" :is-full-page="true"></loading>      
    <b-row>
        <b-col>            
            <h2>
                <v-icon style="width: 32px;" name="git-commit"></v-icon>
                Available VMS in the Edge Node
            </h2>
        </b-col>
        <!-- <b-col class="text-right">
            <b-button to="/node/new" variant="success" class="mr-2">
                <v-icon name="plus"></v-icon>
                New
            </b-button>
        </b-col> -->
    </b-row>
    <b-row>
        <b-col>            
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

      <!-- <template v-slot:cell(actions)="row">
        <b-button variant="danger" size="sm" @click="removeNode(row.item)" class="mr-2">
            <v-icon name="trash"></v-icon>
            Remove
        </b-button>
      </template>         -->

        <div slot="table-busy" class="text-center text-danger my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
        </div>      
    </b-table>

    <b-alert 
        variant="secondary" 
        class="text-center" 
        :show=!items.length>
        There are no images yet!
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
                key: 'image',
                label: 'VMS Name'
            }],
            items: [],
            msg: {
                text: false,
                type: ''
            }
        }
    },
    methods: {        

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
                        })
                        .catch(e => {
                            console.log(e)
                        })
                }
            })
        },

        refresh() {
            this.isBusy = true
            this.isLoading = false
            apiNode.getNodeImages(this.$route.params.ip)
                .then((data) => {
                    this.items = data
                    this.isBusy = false
                })
                .catch(e => {
                    this.msg.text = "Error when listing images"
                    this.msg.type = "danger"
                    this.isBusy = false
                    console.log(e)
                })
        }
    },
    created() {
        this.refresh()
    }
}
</script>

<style>
    .nodeImagesActions {
        width: 390px;
        text-align: center;
    }
</style>