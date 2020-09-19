import { config } from '../../config'
import { apiVmsType } from '../vmsType/api'

export const apiDevice = {
  getConnectionTypes() {
    return new Promise((resolve) => {
      let conectionTypes = []
      // only the sources
      apiVmsType.getVmsTypesSrc()
        .then((vmsTypes) => {
          vmsTypes.forEach(type => {       
            conectionTypes.push({
              text: type.name,
              value: type.dockerImage
            })     
          })
          resolve(conectionTypes);
        })
    })
  },
  newDevice (device) {
    if (!device) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.post(`/device/`,device)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when creating a new device ${e}`))
        })
    })
  },  
  updateDevice (device) {
    if (!device) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.put(`/device/${device.id}`,device)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when updating a device ${e}`))
        })
    })
  },  
  starSrcDevice (deviceId) {
    if (!deviceId) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.get(`/device/${deviceId}/startSrc`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when starting the SRC for the device ${e}`))
        })
    })
  },  
  stopSrcDevice (deviceId) {
    if (!deviceId) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.get(`/device/${deviceId}/stopSrc`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when stopping the SRC for the device ${e}`))
        })
    })
  },  

  removeDevice (deviceId) {
    if (!deviceId) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.delete(`/device/${deviceId}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when removing a new device ${e}`))
        })
    })
  },  

  getDevices () {
    return new Promise((resolve, reject) => {
      config.api.get(`/device/`)
        .then(resp => {
            resolve(resp.data)
        })
        .catch(e => {
            reject(e)
        })
    })
  },

  getDevicesToSelect () {
    return new Promise((resolve, reject) => {
      config.api.get(`/device/`)
        .then(resp => {
          let devices = []
          resp.data.forEach(device=> {
              devices.push({
                text: device.name,
                value: device._id
              })     
            })
            resolve(devices);
          })    
          .catch(e => {
              reject(e)
          })
      })
  },

  getDevicesToSelectSRCStarted () {
    return new Promise((resolve, reject) => {
      config.api.get(`/device/`)
        .then(resp => {
          let devices = []
          resp.data.forEach(device=> {
              if (device.dockerId) {
                devices.push({
                  text: device.name,
                  value: device._id
                })
              }
            })
            resolve(devices);
          })    
          .catch(e => {
              reject(e)
          })
      })
  },

  getDevice (deviceId) {
    return new Promise((resolve, reject) => {
      config.api.get(`/device/${deviceId}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch(e => {
          reject(e)
        })
    })
  },


  getContainerDetails (deviceId) {
    return new Promise((resolve, reject) => {
      config.api.get(`/device/getContainerDetails/${deviceId}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch(e => {
          reject(e)
        })
    })
  },

  getLog (deviceId) {
    return new Promise((resolve, reject) => {
      config.api.get(`/device/log/${deviceId}`)
        .then(resp => {
            resolve(resp.data)
        })
        .catch(e => {
            reject(e)
        })
    })
  }
}