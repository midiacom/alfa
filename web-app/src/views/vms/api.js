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
          reject(new Error(`Error when creating a new VMS ${e}`))
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
          reject(new Error(`Error when creating a new VMS ${e}`))
        })
      })
  },  

  unbindSrc (data) {
    if (!data) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.get(`/vms/unbindSrc/${data.vmsId}/${data.deviceId}/${data.port}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when creating a new VMS ${e}`))
        })
      })
  },  

  stopVms (data) {
    if (!data) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.get(`/vms/stop/${data}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when stopping the VMS ${e}`))
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
          reject(new Error(`Error when getting the VMS type ${e}`))
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
          reject(new Error(`Error when removing a new vmsType ${e}`))
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
  },

  getContainerDetails (vmsId) {
    return new Promise((resolve, reject) => {
      config.api.get(`/vms/getContainerDetails/${vmsId}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch(e => {
          reject(e)
        })
    })
  }
}