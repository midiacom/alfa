import { config } from '../../config'

export const apiConfiguration = {
  
  cleanDb () {    
    return new Promise((resolve, reject) => {
      config.api.get(`/configuration/cleanDb`,)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when cleaning DB ${e}`))
        })
      })
  },

  bootstrap () {    
    return new Promise((resolve, reject) => {
      config.api.get(`/configuration/bootstrap`,)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when bootstraping ${e}`))
        })
      })
  }
}