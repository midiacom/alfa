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
        .catch((error) => {
          reject(new Error(`Error when creating a new VMS (MSG: ${error.response.data.error})`))
        })
      })
  },  

  addFoward (form) {
    if (!form) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.post(`/vms/addfoward`,form)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when forwarding ${e}`))
        })
      })
  },  

  remFoward (data) {  
    if (!data) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.get(`/vms/remfoward/${data.vmsId}/${data.forwardId}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when forwarding ${e}`))
        })
      })
  },  

  updateVms (vms) {
    if (!vms) {
      return Promise.reject(new Error('Data not informed'))
    }
    console.log(vms)
    return new Promise((resolve, reject) => {
      config.api.put(`/vms/${vms.id}`,vms)
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

  getLog (vmsId) {
    return new Promise((resolve, reject) => {
      config.api.get(`/vms/log/${vmsId}`)
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
  },

  getMonitor (nameMonitor) {
    return new Promise((resolve, reject) => {
      config.api.get(`/vms/monitors/${nameMonitor}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch(e => {
          reject(e)
        })
    })
  }
}