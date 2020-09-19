import { config } from '../../config'

export const apiNode = {
  
  newNode (node) {
    if (!node) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.post(`/node/`,node)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when creating a new node ${e}`))
        })
    })
  },  
  updateNode (node) {
    if (!node) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.put(`/node/${node.id}`,node)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when updating a node ${e}`))
        })
    })
  },  
  removeNode (nodeId) {
    if (!nodeId) {
      return Promise.reject(new Error('Data not informed'))
    }
    return new Promise((resolve, reject) => {
      config.api.delete(`/node/${nodeId}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch((e) => {
          reject(new Error(`Error when removing a new node ${e}`))
        })
    })
  },  

  getNodes () {
    return new Promise((resolve, reject) => {
      config.api.get(`/node/`)
        .then(resp => {
            resolve(resp.data)
        })
        .catch(e => {
            reject(e)
        })
    })
  },

  updateStatus () {
    return new Promise((resolve, reject) => {
      config.api.get(`/node/updateStatus`)
        .then(resp => {
            resolve(resp.data)
        })
        .catch(e => {
            reject(e)
        })
    })
  },

  getNode (nodeId) {
    return new Promise((resolve, reject) => {
      config.api.get(`/node/${nodeId}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch(e => {
          reject(e)
        })
    })
  },

  getNodeImages (nodeIp) {
    return new Promise((resolve, reject) => {
      config.api.get(`/node/images/${nodeIp}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch(e => {
          reject(e)
        })
    })  
  },

  getNodeStats (id) {
    return new Promise((resolve, reject) => {
      config.api.get(`/node/status/${id}`)
        .then(resp => {
          resolve(resp.data)
        })
        .catch(e => {
          reject(e)
        })
    })
  },

  /**
   * This will be used for the combobox that demands a different return format
   */
  getNodesForSelect () {
    return new Promise((resolve, reject) => {
      config.api.get(`/node/`)
        .then(resp => {
            let ret = []
            resp.data.forEach(element => {
              let online = "Online"
              if (!element.online) {
                online = "Offline"
              }
              ret.push({
                value: element.ip,
                text: `${element.name} / ${element.ip} (${online})`,
                id: element._id
              })
            });
            resolve(ret)
        })
        .catch(e => {
            reject(e)
        })
    })
  },  

  /**
   * This will be used for the VMS combobox that demands a different return format
   */
  getNodesForVmsSelect () {
    return new Promise((resolve, reject) => {
      config.api.get(`/node/nodeOptions`)
        .then(resp => {
            let ret = []
            resp.data.forEach(element => {
              ret.push({
                value: element.ip,
                text: `${element.name}`,
                id: element._id
              })
            });
            resolve(ret)
        })
        .catch(e => {
            reject(e)
        })
    })
  },  
}