// import Vue from 'vue'
import axios from 'axios'
// import qs from 'qs'

export default ({ Vue }) => {
  axios.interceptors.request.use(function (config) {
    // const token = localStorage.getItem('token');
    // config.headers.common['Authorization'] = 'Bearer ' + token.split('z|')[0]
    config.headers['Content-Type'] = 'application/json'
    if (config.method === 'post') {
      config.data = JSON.stringify({
        ...config.data
      })
    }
    // console.log('before config', config)
    // config.data = JSON.stringify({
    //   ...config.data
    // })
    // console.log(config)
    return config
  }, function (error) {
    // loadinginstace.close()
    return Promise.reject(error)
  })

  Vue.prototype.$axios = axios
}
