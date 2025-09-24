import { boot } from "quasar/wrappers"
import axios from "axios"
import { API } from "src/modules/ApiList.js"

// import { LocalStorage } from 'quasar'

//let apiURL = process.env.VUE_APP_API_URL
let apiURL = import.meta.env.VITE_API_URL || "http://localhost:3000"

const config = {
  baseURL: apiURL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  },
  withCredentials: true,
  params: {}
}

const axiosConfig = {
  baseURL: apiURL,
  timeout: 10000,
  params: {}
}

const api = axios.create(config)
const axiosApi = axios.create(axiosConfig)

export default boot(({ app, store }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axiosApi
  store.$axios = axiosApi
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  store.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  // need to define store variable here so that it can be used in the interceptor response
  const _store = store

  api.interceptors.response.use(
    (response) => {
      return response
    },
    error => {
      if (error.response?.status === 401 || error.response?.status === 419) {
        // store.dispatch('auth/logout')
        // window.location.reload()

        const unauthenticatedRoutes = [API.COMMON.user(), API.POST.login()]

        if (!unauthenticatedRoutes.includes(error.response.config.url)) {
          //default message
          const d = {
            show: true,
            title: "Unauthorised",
            message:
              "Your have made an authorised request. It might be that your login session has expired. Please reload the page to login again."
          }
          _store.dispatch("auth/setDataCallNotice", d)
        }
      }
      return Promise.reject(error.response)
    }
  )
})

export {
  axiosApi,
  api
}
