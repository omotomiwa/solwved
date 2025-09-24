import { OrganisationType } from "src/modules/StaticData.js"
import { API, API_METHODS } from "src/modules/ApiList.js"

export async function getOrganisationContracts(context, id) {
  const url = API.GET.organisationContracts(id)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setContractsByOrganisationID", { contracts: response.data, organisationId: id })
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
      reject("Failed to get Contracts")
    })
  })
}

export async function addOrganisationContract(context, obj) {
  context.commit("addContractByOrganisationID", { contract: obj.contract, organisationId: obj.organisationId })
}

export async function updateOrganisation(context, obj) {
  const url = API.PUT.updateOrganisation(obj.organisationID)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "put",
      data: obj.data
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
      reject("Failed to update organisation")
    })
  })
}

export async function getCustomerUsers(context, customerID) {
  // const querystring = 'type=customer&include=user,customer&filter[customer_id]=' + customerID
  const url = API.GET.customerUsers(customerID)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setUsersByCustomerID", { users: response.data, customer_id: customerID })
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
      reject("Failed to get Customer Users")
    })
  })
}

export async function getVendorUsers(context, vendorID) {
  const url = API_METHODS.queryString(
    API.GET.specialUsers(),
    {
      type: "vendor",
      include: ["user", "vendor"].join(","),
      "filter[vendor_id]": vendorID
    }
  )

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setUsersByVendorID", { users: response.data, vendor_id: vendorID })
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
      reject("Failed to get Vendor Users")
    })
  })
}

export async function createVendorUser(context, _data) {
  const url = API.POST.createVendorUser()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
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
      console.log(error.config)
      reject("Failed to create Customer User")
    })
  })
}

export async function service(context, obj) {
  const _method = obj.method

  const requestObj = {
    url: obj.id ? API.COMMON.service(obj.id) : API.COMMON.services(),
    method: _method
  }

  if (_method === "post" || _method === "patch" || _method === "put") {
    requestObj.data = obj.data
  }

  return new Promise((resolve, reject) => {
    this.$api.request(requestObj).then(response => {
      if (_method === "get") {
        context.commit("setServicesById", { service: response.data, service_id: obj.id })
      }
      resolve()
    }).catch(() => {
      reject("error saving data")
    })
  })
}

// super admin calls can all go through this
export async function datacall(context, obj) {
  const _call = obj.call
  const _method = obj.method
  let _url = "/api/admin/" + _call
  if (obj.id !== undefined) {
    _url += "/" + obj.id
  }
  const requestObj = {
    url: _url,
    method: _method
  }

  if (_method === "post" || _method === "patch") {
    requestObj.data = obj.data
  }

  return new Promise((resolve, reject) => {
    this.$api.request(requestObj).then(response => {
      if (_method === "get") {
        const mutation = "set" + _call[0].toUpperCase() + _call.slice(1)
        context.commit(mutation, response.data)
      }
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function datacallDt(context, obj) {
  const _call = obj.call
  const _method = obj.method
  let _url = "/api/" + _call
  if (obj.id !== undefined) {
    _url += "/" + obj.id
  }
  const requestObj = {
    url: _url,
    method: _method
  }

  if (_method === "post" || _method === "patch" || _method === "put" || _method === "delete") {
    requestObj.data = obj.data
  }

  return new Promise((resolve, reject) => {
    this.$api.request(requestObj).then(response => {
      if (_method === "get") {
        const mutation = "set" + _call[0].toUpperCase() + _call.slice(1)
        context.commit(mutation, response.data)
      }
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function getSpecialUsers(context, querystring, commitTo = "setSpecialUsers") {
  const url = API.GET.specialUsers() + "?" + querystring

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit(commitTo, response.data)
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
      reject("Failed to get Contract detail")
    })
  })
}

export async function getOrganisation(context, id) {
  const url = API.GET.organisation(id)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setOrganisation", response.data)
      context.commit("setIsBuiltEnvironment", response.data?.org_type === OrganisationType.BUILT_ENVIRONMENT)
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
      reject("Failed to get Organisation")
    })
  })
}

export async function checkOrganisation(context, id) {
  if (Object.keys(context.state.organisation).length) {
    context.commit("setIsBuiltEnvironment", context.state.organisation?.org_type === OrganisationType.BUILT_ENVIRONMENT)
    return context.state.organisation
  } else {
    return await context.dispatch("getOrganisation", id)
  }
}

export async function organisationRelationships(context, obj) {
  const _method = obj.method
  const requestObj = {
    url: API.COMMON.organisationRelationships(),
    method: _method
  }

  if (_method === "post" || _method === "delete") {
    requestObj.data = obj.data
  }

  return new Promise((resolve, reject) => {
    this.$api.request(requestObj).then(response => {
      if (_method === "get") {
        context.commit("setOrganisationRelationships", response.data)
      } else if (_method === "post") {
        context.commit("addOrganisationRelationship", response.data)
      } else if (_method === "delete") {
        context.commit("deleteOrganisationRelationship", response.data)
      }
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
      reject("Organisation relationships datacall failed")
    })
  })
}

/* Call doesn't call a mutation */
export async function datacallSimple(context, obj) {
  const _call = obj.call
  const _method = obj.method
  let _url = "/api/admin/" + _call
  if (obj.id !== undefined) {
    _url += "/" + obj.id
  }
  const requestObj = { url: _url, method: _method }

  if (_method === "post" || _method === "patch") {
    requestObj.data = obj.data
  }
  return new Promise((resolve, reject) => {
    this.$api.request(requestObj).then(response => {
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function getAllVendors(context) {
  const url = API.GET.allVendors()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setAllVendors", response.data)
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
      reject("Failed to get All Vendors")
    })
  })
}

export async function getAllCustomers(context) {
  const url = API.GET.allCustomers()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setAllCustomers", response.data)
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
      reject("Failed to get All Vendors")
    })
  })
}

export async function getOrganisationTypes(context) {
  const url = API.GET.organisationTypes()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setOrganisationTypes", response.data)
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
      reject("Failed to get Organisation Types")
    })
  })
}
