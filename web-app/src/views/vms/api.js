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
  
  bindSrc (data) {
    if (!data) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.get(`/vms/bindSrc/${data.vmsId}/${data.deviceId}/${data.port}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error whem creating a new VMS ${e}`))
        })
      })
  },  

  getType (data) {
    if (!data) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.get(`/vms/type/${data}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error whem geting the VMS type ${e}`))
        })
      })
  },  
  
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

  getStoppedVms () {
    return new Promise((resolve, reject) => {
      config.api.get(`/vms/stopped`)
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