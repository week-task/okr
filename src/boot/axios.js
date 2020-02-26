// import Vue from 'vue'
import axios from 'axios'
import qs from 'qs'

export default ({ Vue }) => {
  axios.interceptors.request.use(function (config) {
    // const token = localStorage.getItem('token');
    // config.headers.common['Authorization'] = 'Bearer ' + token.split('z|')[0]
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if (config.method === 'post') {
      config.data = qs.stringify({
        ...config.data
      })
    }
    return config
  }, function (error) {
    // loadinginstace.close()
    return Promise.reject(error)
  })

  Vue.prototype.$axios = axios
}
