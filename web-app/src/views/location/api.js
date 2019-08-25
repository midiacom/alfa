import { config } from '../../config'

export const apiLocation = {
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