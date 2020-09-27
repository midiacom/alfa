import { config } from '../../../config'

export const apiMELINDA = {
  
    startWorkflow (data) {

        if (!data) {
            return Promise.reject(new Error('Data not informed'))
        }

        return new Promise((resolve, reject) => {
            config.api.post(`/plugins/melinda/startworkflow`,data)
                .then(resp => {
                    resolve(resp.data)
                })
                .catch((e) => {
                    reject(new Error(`${e.response.data.message}`))
                })
            })
    },

    saveEdgeNodeFPS (nodes) {

        if (!nodes) {
            return Promise.reject(new Error('Data not informed'))
        }

        return new Promise((resolve, reject) => {
            config.api.post(`/plugins/melinda/fps`,nodes)
                .then(resp => {
                    resolve(resp.data)
                })
                .catch((e) => {
                    reject(new Error(`Error when saving the FPS for each edge node ${e}`))
                })
            })
    },

    getMelindaVMS (melindaType) {
        return new Promise((resolve, reject) => {
          config.api.get(`/plugins/melinda/vmstypes/${melindaType}`)
            .then(resp => {
                resolve(resp.data)
            })
            .catch(e => {
                reject(e)
            })
        })
      },

    stopWorkflow () {
        return new Promise((resolve, reject) => {
            config.api.get(`/plugins/melinda/stopworkflow/`)
                .then(resp => {
                    resolve(resp.data)
                })
                .catch(e => {
                    reject(e)
                })
            })
    },

    getMelindaVMSFPS (vmsTypeId) {
        return new Promise((resolve, reject) => {
          config.api.get(`/plugins/melinda/vmstypesfps/${vmsTypeId}`)
            .then(resp => {
                resolve(resp.data)
            })
            .catch(e => {
                reject(e)
            })
        })
      },
}