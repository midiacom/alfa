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
          reject(new Error(`Error when creating a new location ${e}`))
        })
    })
  },  
  updateLocation (location) {
    if (!location) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.put(`/location/${location.id}`,location)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when updating a location ${e}`))
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
          reject(new Error(`Error when removing a new location ${e}`))
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
  /**
   * This will be used for the combobox that demands a diferente return format
   */
  getLocationsForSelect () {
    return new Promise((resolve, reject) => {
      config.api.get(`/location/`)
        .then(resp => {
            let ret = []
            resp.data.forEach(element => {
              ret.push({
                value: element._id,
                text: element.name
              })
            });
            resolve(ret)
        })
        .catch(e => {
            reject(e)
        })
    })
  },
  getLocation (locationId) {
    return new Promise((resolve, reject) => {
      config.api.get(`/location/${locationId}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch(e => {
          reject(e)
        })
    })
  },
  getDevices (locationId) {
    return new Promise((resolve, reject) => {
      config.api.get(`/location/${locationId}/devices`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch(e => {
          reject(e)
        })
    })
  }
}