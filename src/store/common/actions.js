import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import { API, API_METHODS } from "src/modules/ApiList.js"

export async function getCurrencies(context) {
  const url = API.GET.currencies()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setCurrencies", response.data)
      resolve()
    }).catch(() => {
      reject("error getting list of Currencies")
    })
  })
}

export async function getCompetencies(context) {
  const url = API.GET.competencies()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setCompetencies", response.data)
      resolve()
    }).catch(() => {
      reject("error getting list of Competencies")
    })
  })
}

export async function getSelectors(context, payload) {
  const url = API.GET.selectors(payload.model)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setSelectors", response.data)
      resolve()
    }).catch(() => {
      reject("error getting list of Selectors")
    })
  })
}

export async function getOrganisations(context, querystring) {
  const url = API.GET.organisations() + "?" + querystring

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setOrganisations", response.data)
      resolve()
    }).catch(() => {
      reject("error getting Organisations")
    })
  })
}

export async function getUserOrganisation(context, id) {
  const url = API.GET.organisation(id)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("userOrganisation", response.data)
      resolve()
    }).catch(() => {
      reject("error getting Organisations")
    })
  })
}

export async function getRaidLogs(context, filter) {
  const url = API_METHODS.queryString(
    API.COMMON.raidLogs(),
    {
      include: [
        "status",
        "service.contract.customer",
        "service.contract.vendor",
        "service_line",
        "consultant",
        "created_by",
        "type",
        "category",
        "impact",
        "outcome"
      ].join(",")
    }
  ) + "&" + filter

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setRaidLogs", response.data)
      resolve(response.data)
    }).catch(() => {
      reject(
        "error getting list of " +
        OrganisationTypeMethods.changeRaid(
          context.getters["admin/getIsBuiltEnvironment"],
          {
            isCamelCase: true
          }
        ) +
        " Logs"
      )
    })
  })
}

export async function getRaidLog(context, id) {
  const url = API_METHODS.queryString(
    API.COMMON.raidLog(id),
    {
      include: [
        "status",
        "service.contract.customer",
        "service.contract.vendor",
        "service_line",
        "consultant",
        "created_by",
        "type",
        "category",
        "impact",
        "outcome"
      ].join(",")
    }
  )

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setRaidLog", response.data)
      resolve()
    }).catch(() => {
      reject(
        "error getting single " +
        OrganisationTypeMethods.changeRaid(
          context.getters["admin/getIsBuiltEnvironment"],
          {
            isCamelCase: true
          }
        ) +
        " Log"
      )
    })
  })
}

export async function raidLog(context, obj) {
  const url = API.COMMON.raidLog(obj.id)
  const requestObj = {
    url: url,
    method: obj.method
  }

  if (["put", "patch"].includes(obj.method)) {
    requestObj.data = obj.data
  }

  return new Promise((resolve, reject) => {
    this.$api.request(requestObj).then(response => {
      resolve(response)
    }).catch(() => {
      reject(
        OrganisationTypeMethods.changeRaid(
          context.getters["admin/getIsBuiltEnvironment"],
          {
            isCamelCase: true
          }
        ) +
        " Log " +
        obj.method +
        " error"
      )
    })
  })
}

export async function getChangeRequest(context, id) {
  const url = API.GET.changeRequest(id)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setChangeRequest", response.data)
      resolve()
    }).catch(() => {
      reject("error getting single Change Request")
    })
  })
}

export async function getChangeRequests(context, obj) {
  const url = API_METHODS.queryString(
    API.COMMON.changeRequests(),
    { type: obj.type }
  ) + "&" + obj.filter

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setChangeRequests", response.data)
      resolve()
    }).catch(() => {
      reject("error getting list of Change Requests")
    })
  })
}

export async function clearChangeRequests(context) {
  context.commit("setChangeRequests", [])
}

export async function getServiceContractView(context) {
  const url = API.GET.serviceContractView()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setServiceContractView", response.data)
      resolve()
    }).catch(() => {
      reject("error getting serviceContractView")
    })
  })
}

//TODO Only get consultants that work on the selected Service
export async function getConsultantEngagementView(context) {
  const url = API.GET.consultantEngagementView()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setConsultantEngagementView", response.data)
      resolve()
    }).catch(() => {
      reject("error getting consultantEngagementView")
    })
  })
}

export async function getServiceConsultantEngagements(context, serviceId) {
  const url = API.GET.serviceConsultantEngagements(serviceId)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setServiceConsultantEngagements", response.data)
      resolve()
    }).catch(() => {
      reject(
        "error getting service " +
        OrganisationTypeMethods.changeConsultant(
          context.getters["admin/getIsBuiltEnvironment"],
          {
            isPlural: true,
            isCamelCase: false
          }
        )
      )
    })
  })
}

export async function createRaidLog(context, obj) {
  const url = API.COMMON.raidLogs()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: obj
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
      reject(
        "Failed to create " +
        OrganisationTypeMethods.changeRaid(
          context.getters["admin/getIsBuiltEnvironment"],
          {
            isCamelCase: true
          }
        ) +
        " log"
      )
    })
  })
}

export async function createServiceAlert(context, obj) {
  const url = API.COMMON.serviceAlerts()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: obj
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
      reject(
        "Failed to create " +
        OrganisationTypeMethods.changeRaid(
          context.getters["admin/getIsBuiltEnvironment"],
          {
            isCamelCase: true
          }
        ) +
        " log"
      )
    })
  })
}

export async function createChangeRequest(context, obj) {
  const url = API.COMMON.changeRequests()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: obj
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
      reject("Failed to create Change Request")
    })
  })
}

export async function purchaseOrderSpend(context, id) {
  const url = API.GET.purchaseOrderSpend(id)

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
      reject("Failed to get PO Spend data")
    })
  })
}

export async function pendingCustomerRequestsByService(context, id) {
  const url = API.GET.pendingCustomerRequestsByService(id)

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
      reject("Failed to get pending orders for this service")
    })
  })
}
