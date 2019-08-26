import axios from 'axios'

export const config = {
    API_MAPS: '',
    URL_API: 'http://localhost:3000',
    URL_APP: 'http://localhost:8080',
    COLOR_DANGER: 'red',
    COLOR_SUCCESS: 'green',
    COLOR_DEFAULT: 'grey',
    COLOR_WARNING: 'yellow',
    api: ''
}

config.api = axios.create({
    baseURL: config.URL_API
})