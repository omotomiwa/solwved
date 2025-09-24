import { useClearAllCookies } from "src/composables/cookies"
import { useLocalStorage } from "src/composables/localStorage.js"
import { localStorageKey } from "src/modules/StaticData.js"
import { API } from "src/modules/ApiList.js"

const { setLocalData, getLocalData, removeLocalData } = useLocalStorage()

export async function getCSRF(context, credentials) {
  const url = API.GET.getCSRF()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(function() {
      context.commit("setCookieReceived")
      resolve("success")
    })
  })
}

export function setDataCallNotice(context, data) {
  context.commit("setDataCallNotice", data)
}

export async function apiLogin(context, credentials) {
  const url = API.POST.login()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: credentials
    }).then(response => {
      context.commit("setLoggedIn", true)
      resolve(response.data)
    }).catch(error => {
      if (error.response) {
        if (error.response.data.errors !== undefined) {
          const errMessage = Object.values(error.response.data.errors)[0][0]
          reject(errMessage)
        } else if (error.response.status === 429) {
          reject("Sorry, you've had to many failed login attempts. Please wait 5 minutes before retrying")
        }
        reject("Sorry, that login was unsuccessful")
      } else if (error.request) {
        reject(error.request)
      } else {
        reject("Error", error.message)
      }
      reject("unknown error")
    })
  })
}

export async function forgottenPassword(context, userdata) {
  const url = API.POST.forgotPassword()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: userdata
    }).then(function() {
      context.commit("passwordResetEmailSent")
      resolve()
    }).catch(error => {
      if (error.response) {
        if (error.response.data.errors !== undefined) {
          const errMessage = Object.values(error.response.data.errors)[0][0]
          reject(errMessage)
        }
        reject("Sorry, we were not able to send the reset email. Please contact support")
      } else {
        reject("Sorry, we were not able to send the reset email. Please contact support")
      }
    })
  })
}

export async function resetPassword(context, userdata) {
  const url = API.POST.resetPassword()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: userdata
    }).then(function() {
      resolve("Password reset success")
    }).catch(error => {
      if (error.response) {
        if (error.response.data.errors !== undefined) {
          const errMessage = Object.values(error.response.data.errors)[0][0]
          reject(errMessage)
        }
        reject("Sorry, there was an error resetting your password")
      } else if (error.request) {
        reject("Sorry, there was an error resetting your password")
      } else {
        reject(error.message)
      }
    })
  })
}

export async function getUser(context) {
  const url = API.COMMON.user()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setUser", response.data)
      context.commit("setBadge", response.data.badge)
      context.commit("setBadges", response.data.badges)
      if (response.data.id !== getLocalData(localStorageKey.USER_ID)) {
        removeLocalData(localStorageKey.PAGE)
        removeLocalData(localStorageKey.PAGE_QUERY)
      }
      setLocalData(localStorageKey.USER_ID, response.data.id)
      resolve(response.data)
    }).catch(error => {
      if (error.response) {
        reject(error.response.data)
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
      reject("No user data available")
    })
  })
}

export async function checkLogin(context) {
  if (context.state.user) {
    return context.state.user
  } else {
    return await context.dispatch("getUser")
  }
}

export async function logout(context) {
  const url = API.POST.logout()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post"
    }).then(function() {
      Object.keys(context.rootState).forEach(moduleName => {
        context.commit(moduleName + "/reset", null, { root: true })
      })
      useClearAllCookies()
      removeLocalData(localStorageKey.PAGE)
      removeLocalData(localStorageKey.PAGE_QUERY)
      resolve(true)
    }).catch(error => {
      if (error.response) {
        reject(error.response.data)
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
    })
  })
}

export function passwordResetEmailSent(context) {
  context.commit("passwordResetEmailSent")
}

export async function updateUserDetails(context, _data) {
  const url = API.COMMON.user()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "patch",
      data: _data
    }).then(response => {
      context.commit("patchUser", response.data)
      resolve(response.data)
    }).catch(error => {
      if (error.response) {
        reject(error.response.data)
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
      console.log(error.config)
      reject("Failed to update user details")
    })
  })
}

export async function updatePassword(context, _data) {
  const url = API.PUT.updatePassword()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "put",
      data: _data
    }).then(response => {
      resolve(response.data)
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
      reject("Failed to update password")
    })
  })
}

export async function updateProfile(context, _data) {
  const url = API.PUT.updateProfile()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "put",
      data: _data
    }).then(response => {
      resolve(response.data)
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
      reject("Failed to update profile information")
    })
  })
}

export async function emailVerification() {
  const url = API.POST.emailVerification()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post"
    }).then(response => {
      resolve(response.data)
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
      reject("Failed to send email verification request")
    })
  })
}

export async function verifyEmail(context, _data) {
  const url = API.GET.verifyEmail({
    user_id: _data.user_id,
    email_hash: _data.emailhash
  })

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      resolve(response.data)
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
      console.log(error.config)
      reject("Failed to verify the email")
    })
  })
}

export async function clearCache() {
  const url = API.POST.clearCache()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post"
    }).then(response => {
      resolve(response.data)
    }).catch(error => {
      if (error.data) {
        reject(error.data)
      } else if (error.response) {
        if (error.response.data.errors !== undefined) {
          const errMessage = Object.values(error.response.data.errors)[0][0]
          reject(errMessage)
        }
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
      reject("Failed to clear cache")
    })
  })
}

export async function enable2fa() {
  const url = API.POST.enable2fa()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post"
    }).then(response => {
      resolve(response.data)
    }).catch(error => {
      if (error.data) {
        reject(error.data)
      } else if (error.response) {
        if (error.response.data.errors !== undefined) {
          const errMessage = Object.values(error.response.data.errors)[0][0]
          reject(errMessage)
        }
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
      reject("Failed to enable two factor authentication")
    })
  })
}

export async function disable2fa() {
  const url = API.DELETE.disable2fa()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "delete"
    }).then(response => {
      resolve(response.data)
    }).catch(error => {
      if (error.data) {
        reject(error.data)
      } else if (error.response) {
        if (error.response.data.errors !== undefined) {
          const errMessage = Object.values(error.response.data.errors)[0][0]
          reject(errMessage)
        }
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
      reject("Failed to enable two factor authentication")
    })
  })
}

export async function get2faImage() {
  const url = API.GET.get2faImage()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      resolve(response.data)
    }).catch(error => {
      if (error.data) {
        reject(error.data)
      } else if (error.response) {
        if (error.response.data.errors !== undefined) {
          const errMessage = Object.values(error.response.data.errors)[0][0]
          reject(errMessage)
        }
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
      reject("Failed to get 2FA QR Code")
    })
  })
}

export async function get2faRecoveryCodes() {
  const url = API.GET.get2faRecoveryCodes()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      resolve(response.data)
    }).catch(error => {
      if (error.data) {
        reject(error.data)
      } else if (error.response) {
        if (error.response.data.errors !== undefined) {
          const errMessage = Object.values(error.response.data.errors)[0][0]
          reject(errMessage)
        }
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
      reject("Failed to get 2FA Recovery Code")
    })
  })
}

export async function verify2fa(context, _data) {
  const url = API.POST.verify2fa()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: _data
    }).then(response => {
      resolve(response.data)
    }).catch(error => {
      if (error.data) {
        reject(error.data)
      } else if (error.response) {
        if (error.response.data.errors !== undefined) {
          const errMessage = Object.values(error.response.data.errors)[0][0]
          reject(errMessage)
        }
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
      reject("Failed to confirm 2FA Code")
    })
  })
}

export async function confirm2fa(context, _data) {
  const url = API.POST.confirm2fa()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: _data
    }).then(response => {
      resolve(response.data)
    }).catch(error => {
      if (error.data) {
        reject(error.data)
      } else if (error.response) {
        if (error.response.data.errors !== undefined) {
          const errMessage = Object.values(error.response.data.errors)[0][0]
          reject(errMessage)
        }
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
      reject("Failed to confirm 2FA Code")
    })
  })
}

export async function changeRecoveryCode() {
  const url = API.POST.changeRecoveryCode()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post"
    }).then(response => {
      resolve(response.data)
    }).catch(error => {
      if (error.data) {
        reject(error.data)
      } else if (error.response) {
        if (error.response.data.errors !== undefined) {
          const errMessage = Object.values(error.response.data.errors)[0][0]
          reject(errMessage)
        }
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
      reject("Failed to change Recovery Code")
    })
  })
}
