import axios from 'axios'

export const config = {
    API_MAPS: '',
    URL_API: process.env.VUE_APP_MY_URL_API,
    URL_APP: process.env.VUE_APP_MY_URL_APP,
    COLOR_DANGER: 'red',
    COLOR_SUCCESS: 'green',
    COLOR_DEFAULT: 'grey',
    COLOR_WARNING: 'yellow',
    api: ''
}

// console.log(process.env.VUE_APP_MY_URL_API)

config.api = axios.create({
    baseURL: config.URL_API
})