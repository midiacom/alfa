import { config } from '../../config'

export const apiDevice = {
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
          reject(new Error(`Error whem creating a new device ${e}`))
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
          reject(new Error(`Error whem updating  adevice ${e}`))
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
          reject(new Error(`Error whem removing a new device ${e}`))
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
  }
}