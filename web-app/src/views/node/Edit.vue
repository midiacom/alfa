<template>
    <div>
        <h2>Edit Edge Node</h2>

        <b-alert :show="msg.text" :v-show="msg.text" :variant=msg.type>
            {{ msg.text }}
        </b-alert>

        <b-form @submit="onSubmit">
        <b-form-group id="input-group-1" label="Name:" label-for="name">
            <b-form-input id="name" v-model="form.name" type="text" required/>
        </b-form-group>

        <b-form-group id="input-group-2" label="Description:" label-for="description">
            <b-form-input id="description" v-model="form.description" type="text"/>
        </b-form-group>

        <b-row>
            <b-col>
                <b-button type="submit" variant="primary">Save</b-button>
            </b-col>
            <b-col class="text-right">
                <b-button to="/node" variant="secondary">Back</b-button>        
            </b-col>
        </b-row>
    </b-form>
  </div>

</template>

<script>
import {apiNode} from './api'

export default {
    name: 'deviceEdit',
    data() {
        return {
            locations: [],
            form: {
                id: '',
                name: '',
                description: ''
            },
            msg: {
                text: false,
                type: ''
            }
        }
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault()
            apiNode.updateNode(this.form)
                .then(() => {
                    this.msg.text = "Node saved"
                    this.msg.type = "success"
                })
                .catch((e) => {
                    this.msg.text = `Error when saving node ${e}`
                    this.msg.type = "danger"
                })
        },
        refresh() {
            apiNode.getNode(this.$route.params.id)
                .then((node) => {
                    this.form.id = node._id
                    this.form.name = node.name                    
                    this.form.description = node.description
                })
        }
    },
    created() {
        this.refresh()
    }
}
</script>