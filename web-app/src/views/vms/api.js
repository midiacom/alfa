import { config } from '../../config'

export const apiVms = {
  newVms (vms) {
    if (!vms) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.post(`/vms/`,vms)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error whem creating a new VMS ${e}`))
        })
      })
  },  
  /*
  updateVmsType (vmsType) {
    if (!vmsType) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.put(`/vmsType/${vmsType.id}`,vmsType)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error whem updating  avmsType ${e}`))
        })
    })
  },  
   */  
  removeVms (vmsId) {
    if (!vmsId) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.delete(`/vms/${vmsId}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error whem removing a new vmsType ${e}`))
        })
    })
  },  

  getAllVms () {
    return new Promise((resolve, reject) => {
      config.api.get(`/vms/`)
        .then(resp => {
            resolve(resp.data)
        })
        .catch(e => {
            reject(e)
        })
    })
  },

  getVms (vmsId) {
    return new Promise((resolve, reject) => {
      config.api.get(`/vms/${vmsId}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch(e => {
          reject(e)
        })
    })
  }
}