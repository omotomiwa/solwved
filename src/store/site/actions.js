import { API } from "src/modules/ApiList.js"

export async function getSiteConfig(context, credentials) {
  const url = API.GET.siteConfig()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get",
      headers: {
        Accept: "application/json",
        ContentType: "application/json"
      }
    }).then(response => {
      context.commit("setFeatureEnabled", response.data)
      resolve("success")
    }).catch(error => {
      if (error.response) {
        if (error.response.data.errors !== undefined) {
          const errMessage = Object.values(error.response.data.errors)[0][0]
          reject(errMessage)
        }
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
      reject("Failed to get site configs")
    })
  })
}
