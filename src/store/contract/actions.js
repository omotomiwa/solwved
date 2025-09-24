import { API, API_METHODS } from "src/modules/ApiList.js"

export async function getCustomerAccess(context) {
  const url = API.GET.customerAccess()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setCustomers", response.data)
      resolve()
    }).catch(() => {
      reject("error getting list of Customers")
    })
  })
}

export async function getCustomerVendors(context, customerID) {
  const url = API.GET.customer.customerVendors(customerID)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setVendorsByCustomerID", {
        vendors: response.data,
        customer_id: customerID
      })
      resolve()
    }).catch(() => {
      reject("error getting Customer Vendors")
    })
  })
}

export async function getLinkedOrganisations(context, organisationId) {
  const url = API.GET.linkedOrganisations(organisationId)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setLinkedOrganisationsByID", {
        organisation_id: organisationId,
        organisations: response.data
      })
      resolve(response.data)
    }).catch(() => {
      reject("error getting Linked organisations")
    })
  })
}

export async function getReports(context, customerID) {
  const url = API.GET.customer.reports(customerID)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setSpendReportsByCustomer", {
        data: response.data,
        customer_id: customerID
      })
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function getSpendReport(context, obj) {
  const url = API.GET.customer.spendReport({
    customer_id: obj.customerID,
    report_id: obj.reportID
  })

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function updateSpendReport(context, obj) {
  const url = API.GET.customer.spendReport({
    customer_id: obj.customerID,
    report_id: obj.reportID
  })

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "patch",
      data: obj.updates
    }).then(response => {
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function approveSpendReport(context, obj) {
  const url = API.GET.customer.approveSpendReport({
    customer_id: obj.customerID,
    report_id: obj.reportID
  })

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function unApproveSpendReport(context, obj) {
  const url = API.GET.customer.unApproveSpendReport({
    customer_id: obj.customerID,
    report_id: obj.reportID
  })

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

//list of all contracts that an org is party to
export async function organisationContracts(context, obj) {
  let url = ""
  let organisationId
  if (obj.vendorId) {
    organisationId = obj.vendorId
    url = API.GET.vendor.contracts(organisationId)
  } else if (obj.customerId) {
    organisationId = obj.customerId
    url = API.GET.customer.contracts(organisationId)
  }

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setOrganisationContracts", { data: response.data, organisation_id: organisationId })
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

// This only returns contracts for which the organisation is the contract owner
export async function viewContracts(context, obj) {
  let queryParams = {}
  if (obj.vendorId) {
    queryParams = {
      ...queryParams,
      badge: "vendor",
      "filter[vendor_id]": obj.vendorId
    }
  } else if (obj.customerId) {
    queryParams = {
      ...queryParams,
      badge: "customer",
      "filter[customer_id]": obj.customerId
    }
  }
  let url = API_METHODS.queryString(
    API.GET.contracts(),
    queryParams
  )

  if (obj.filter) {
    url += "&" + obj.filter
  }
  if (obj.include) {
    url += "&include=" + obj.include
  }

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setContracts", { data: response.data })
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function viewContract(context, id) {
  const url = API_METHODS.queryString(
    API.GET.contract(id),
    {
      include: [
        "services.service_lines",
        "services.delivery_model",
        "services.financial_model",
        "vendor",
        "customer",
        "customer_contract_owner",
        "vendor_contract_owner",
        "programmes.projects",
        "projects",
        "services.capabilities.capability_outputs.output",
        "services.customer_requests.capabilities.capability",
        "services.customer_requests.requester"
      ].join(",")
    }
  )

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setContract", { data: response.data })
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function viewRequest(context, id) {
  const url = API.GET.request(id)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setRequest", { data: response.data })
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function service(context, obj) {
  const _method = obj.method

  const url = API_METHODS.queryString(
    obj.id ? API.COMMON.service(obj.id) : API.COMMON.services(),
    {
      include: [
        "contract.projects",
        "contract.customer",
        "contract.vendor",
        "service_lines",
        "delivery_model",
        "financial_model",
        "outputs",
        "capabilities.capability_outputs.output",
        "purchase_orders.milestones",
        "requests.consultant_engagements"
      ].join(",")
    }
  )

  const requestObj = {
    url: url,
    method: _method
  }

  if (_method === "post" || _method === "patch") {
    requestObj.data = obj.data
  }

  return new Promise((resolve, reject) => {
    this.$api.request(requestObj).then(response => {
      if (_method === "get") {
        context.commit("setServicesById", {
          service: response.data,
          service_id: obj.id
        })
        context.commit("setService", response.data)
      }
      resolve(response.data)
    }).catch(() => {
      reject("error saving data")
    })
  })
}

export function addServiceEngagement(context, obj) {
  context.commit("addServiceEngagement", {
    service_id: obj.service_id,
    request_id: obj.request_id,
    engagement: obj.engagement
  })
}

export function removeServiceEngagement(context, obj) {
  context.commit("removeServiceEngagement", {
    service_id: obj.service_id,
    request_id: obj.request_id,
    engagement_id: obj.engagement_id
  })
}

export function updateServiceEngagement(context, obj) {
  context.commit("updateServiceEngagement", {
    service_id: obj.service_id,
    request_id: obj.request_id,
    engagement: obj.engagement
  })
}

export function addMilestoneAssignment(context, obj) {
  context.commit("addMilestoneAssignment", obj)
}

export function removeMilestoneAssignment(context, obj) {
  context.commit("removeMilestoneAssignment", obj)
}

export function updateMilestoneAssignment(context, obj) {
  context.commit("updateMilestoneAssignment", obj)
}

export async function capabilities(context, stateId) {
  const url = API_METHODS.queryString(
    API.GET.capabilities(),
    { "filter[service_id]": stateId }
  )

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "GET"
    }).then(response => {
      context.commit("setCapabilities", { capes: response.data })
      resolve()
    }).catch(() => {
      reject("error saving data")
    })
  })
}

export async function customerrequests(context, obj) {
  let queryParam = {
    include: [
      "contract.vendor",
      "contract.customer",
      "contract.projects",
      "requester",
      "service.delivery_model",
      "service_line",
      "capabilities.capability",
      "capabilities.competency"
    ].join(",")
  }
  if (obj.serviceId) {
    queryParam = { ...queryParam, "filter[service_id]": obj.serviceId }
  }
  if (obj.matchVendor) {
    queryParam = { ...queryParam, [obj.matchVendor]: obj.matchVendorId }
  }
  if (obj.matchCustomer) {
    queryParam = { ...queryParam, [obj.matchCustomer]: obj.matchCustomerId }
  }

  const url = API_METHODS.queryString(
    API.GET.customerRequests(),
    queryParam
  ) + "&" + obj.filter

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "GET"
    }).then(response => {
      context.commit("setCustomerrequests", response.data)
      resolve()
    }).catch(() => {
      reject("error saving data")
    })
  })
}

export async function customerrequest(context, id) {
  const url = API_METHODS.queryString(
    API.GET.customerRequest(id),
    {
      include: [
        "contract.vendor",
        "contract.customer",
        "contract.projects",
        "service.delivery_model",
        "service.capabilities",
        "service_line",
        "requester",
        "capabilities.capability",
        "capabilities.competency"
      ].join(",")
    }
  )

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "GET"
    }).then(response => {
      context.commit("setCustomerrequest", response.data)
      resolve()
    }).catch(() => {
      reject("error saving data")
    })
  })
}

export async function getOrganisationPurchaseOrders(context, obj) {
  let organisationType
  let organisationId
  if (obj.vendorId) {
    organisationType = "vendor"
    organisationId = obj.vendorId
  } else if (obj.customerId) {
    organisationType = "customer"
    organisationId = obj.customerId
  }
  const url = API.GET.purchaseOrders({
    organisation_type: organisationType,
    organisation_id: organisationId
  })

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setOrganisationPurchaseOrders", { data: response.data, organisation_id: organisationId })
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
      reject("Failed to get PurchaseOrders")
    })
  })
}

export async function getPurchaseOrderMilestones(context, purchaseOrderID) {
  const url = API.GET.purchaseOrderMilestones(purchaseOrderID)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      resolve(response)
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
      reject("Failed to get PurchaseOrderMilestones")
    })
  })
}

export async function updatePurchaseOrderMilestones(context, obj) {
  const url = API.POST.purchaseOrderMilestones(obj.purchaseOrderID)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: obj.updates
    }).then(response => {
      resolve(response)
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
      reject("Failed to update PurchaseOrderMilestones")
    })
  })
}

// general datacall method
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

export async function createTemplateFromService(context, data) {
  const url = API.POST.createTemplateFromService(data.organisation_id)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: data
    }).then(response => {
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function createServiceTemplate(context, data) {
  const url = API.POST.createServiceTemplate(data.organisation_id)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: data
    }).then(response => {
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function applyServiceTemplate(context, data) {
  const url = API.POST.applyServiceTemplate()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: data
    }).then(response => {
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function getServiceTemplates(context, organisationId) {
  const url = API.GET.serviceTemplates(organisationId)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function getServiceTemplate(context, __data) {
  const url = API.GET.serviceTemplate({
    organisation_id: __data.organisation_id,
    template_id: __data.template_id
  })

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function deleteServiceTemplate(context, data) {
  const url = API.DELETE.serviceTemplate({
    vendor_id: data.organisation_id,
    template_id: data.template_id
  })

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "delete"
    }).then(response => {
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}
