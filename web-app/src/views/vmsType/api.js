import { config } from '../../config'

export const apiVmsType = {
  newVmsType (vmsType) {
    if (!vmsType) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.post(`/vmsType/`,vmsType)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error whem creating a new vmsType ${e}`))
        })
    })
  },  
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
  removeVmsType (vmsTypeId) {
    if (!vmsTypeId) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.delete(`/vmsType/${vmsTypeId}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error whem removing a new vmsType ${e}`))
        })
    })
  },  
  getVmsTypes () {
    return new Promise((resolve, reject) => {
      config.api.get(`/vmsType/`)
        .then(resp => {
            resolve(resp.data)
        })
        .catch(e => {
            reject(e)
        })
    })
  },
  getVmsTypesSrc () {
    return new Promise((resolve, reject) => {
      config.api.get(`/vmsType/listSrc`)
        .then(resp => {
            resolve(resp.data)
        })
        .catch(e => {
            reject(e)
        })
    })
  },
  getVmsTypesVms () {
    return new Promise((resolve, reject) => {
      config.api.get(`/vmsType/listVms`)
        .then(resp => {
            resolve(resp.data)
        })
        .catch(e => {
            reject(e)
        })
    })
  },
  getVmsType (vmsTypeId) {
    return new Promise((resolve, reject) => {
      config.api.get(`/vmsType/${vmsTypeId}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch(e => {
          reject(e)
        })
    })
  }
}