import { config } from '../../config'

export const apiLocation = {
  newLocation (location) {
    if (!location) {
      return Promise.reject(new Error('Data not informed'))
    }

    return new Promise((resolve, reject) => {
      config.api.post(`/location/`,location)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error('Error whem creating a new location'))
        })
    })
  },  
  removeLocation (locationId) {
    if (!locationId) {
      return Promise.reject(new Error('Data not informed'))
    }

    return new Promise((resolve, reject) => {
      config.api.delete(`/location/${locationId}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error('Error whem removing a new location'))
        })
    })
  },  
  getLocations () {
    return new Promise((resolve, reject) => {
      config.api.get(`/location/`)
        .then(resp => {
            resolve(resp.data)
        })
        .catch(e => {
            reject(e)
        })
    })
  },

  getLocation (constructionId) {
    return new Promise((resolve, reject) => {
      config.api.get(`/location/companyplan/${constructionId}`)
        .then(resp => {
          resolve(resp.data)
        })
    })
  }
}