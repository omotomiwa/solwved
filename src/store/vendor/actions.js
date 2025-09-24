import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import { API, API_METHODS } from "src/modules/ApiList.js"

export async function getVendorAccess(context) {
  const url = API.GET.vendor.access()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setVendors", response.data)
      resolve()
    }).catch(() => {
      reject("error getting list of Vendors")
    })
  })
}

export async function getVendorConsultants(context, vendorID) {
  const url = API.GET.vendor.consultants(vendorID)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setConsultantsByVendorID", {
        consultants: response.data,
        vendor_id: vendorID
      })
      resolve()
    }).catch(() => {
      reject(
        "error getting Vendor " +
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

export async function getConsultantTypes(context) {
  const url = API.GET.consultantTypes()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setConsultantTypes", response.data)
      resolve()
    }).catch(() => {
      reject(
        "error getting Vendor " +
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

export async function getVendorConsultantEngagements(context, obj) {
  const url = API.GET.vendor.consultantEngagements({
    vendor_id: obj.vendorID,
    consultant_id: obj.consultantID
  })

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setEngagementsByConsultantID", {
        engagements: response.data,
        consultant_id: obj.consultantID
      })
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
        "Failed to get " +
        OrganisationTypeMethods.changeConsultant(
          context.getters["admin/getIsBuiltEnvironment"],
          {
            isCamelCase: false
          }
        ) +
        " engagements"
      )
    })
  })
}

export async function createConsultant(context, obj) {
  const url = API.PUT.vendor.createConsultant(obj.vendorID)

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
      reject(
        "Failed to create " +
        OrganisationTypeMethods.changeConsultant(
          context.getters["admin/getIsBuiltEnvironment"],
          {
            isCamelCase: false
          }
        )
      )
    })
  })
}

export async function getVendorUsers(context, vendorID) {
  const url = API_METHODS.queryString(
    API.GET.vendor.users(vendorID),
    { include: "user" }
  )

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setUsersByVendorID", {
        users: response.data,
        vendor_id: vendorID
      })
      resolve()
    }).catch(error => {
      reject("error getting Vendor users" + error)
    })
  })
}

export async function createVendorUser(context, obj) {
  const url = API.PUT.vendor.createVendorUser(obj.vendorID)

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
      reject("Failed to create Vendor User")
    })
  })
}

export async function updateSpecial(context, obj) {
  const url = API.PUT.updateSpecialUser(obj.data.id)

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
      reject("Failed to update Vendor User")
    })
  })
}

export async function deleteVendorUser(context, obj) {
  const url = API.DELETE.vendor.user(obj.vendorID)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "delete",
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
      reject("Failed to delete Vendor User")
    })
  })
}

export async function getVendorContracts(context, vendorID) {
  const url = API.GET.vendor.contracts(vendorID)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setContractsByVendorID", {
        contracts: response.data,
        vendor_id: vendorID
      })
      resolve()
    }).catch(() => {
      reject("error getting Vendor contracts")
    })
  })
}

export async function getVendorCustomers(context, vendorID) {
  const url = API.GET.vendor.customers(vendorID)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setCustomersByVendorID", {
        customers: response.data,
        vendor_id: vendorID
      })
      resolve()
    }).catch(() => {
      reject("error getting Vendor customers")
    })
  })
}

export async function updateVendorContract(context, obj) {
  const url = API.PATCH.vendor.updateContract({
    vendor_id: obj.vendorID,
    contract_id: obj.contractID
  })

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "patch",
      data: obj.data
    }).then(() => {
      // context.commit('setContractsByVendorID', { contracts: response.data, vendor_id: vendorID })
      resolve()
    }).catch(() => {
      reject("error updating contract")
    })
  })
}

export async function getServiceReport(context, obj) {
  const url = API_METHODS.queryString(
    API.GET.vendor.serviceReport({
      vendor_id: obj.vendor_id,
      service_id: obj.service_id
    }),
    { startDate: obj.startDate, endDate: obj.endDate }
  )

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setReportByServiceID", {
        data: response.data,
        service_id: obj.service_id
      })
      resolve(response)
    }).catch(response => {
      reject("error getting contract service report data " + response)
    })
  })
}

export async function unsubmitDeliveryRecord(context, obj) {
  const url = API.PATCH.vendor.unSubmitDeliveryRecord({
    vendor_id: obj.vendorId,
    delivery_record_id: obj.deliveryRecordId
  })

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "patch",
      data: {
        submitted: 0
      }
    }).then(response => {
      resolve(response.data)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function getMiData(context, vendorID) {
  const url = API_METHODS.queryString(
    API.GET.vendor.miData(vendorID),
    {
      include: [
        "delivery_records",
        "contract_projects",
        "user",
        "request",
        "vendor",
        "customer",
        "contract",
        "consultant_engagement.projects"
      ].join(","),
      "filter[afterStart]": "2021-07-15",
      "filter[beforeEnd]": "2022-07-15"
    }
  )

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setMiDataByVendor", {
        data: response.data,
        vendor_id: vendorID
      })
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function getReports(context, vendorID) {
  const url = API.GET.vendor.reports(vendorID)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setSpendReportsByVendor", {
        data: response.data,
        vendor_id: vendorID
      })
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function getSpendReport(context, obj) {
  const url = API.GET.vendor.spendReport({
    vendor_id: obj.vendorID,
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
  const url = API.PATCH.vendor.updateSpendReport({
    vendor_id: obj.vendorID,
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
  const url = API.GET.vendor.approveSpendReport({
    vendor_id: obj.vendorID,
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
  const url = API.GET.vendor.unApproveSpendReport({
    vendor_id: obj.vendorID,
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

export async function deleteSpendReport(context, obj) {
  const url = API.DELETE.vendor.spendReport({
    vendor_id: obj.vendorID,
    report_id: obj.reportID
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

export async function generateSpendReport(context, obj) {
  const url = API.POST.vendor.generateSpendReport(obj.vendorID)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: obj.data
    }).then(response => {
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function getService(context, obj) {
  const url = API.GET.vendor.service({
    vendor_id: obj.vendor_id,
    service_id: obj.service_id
  })

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setServiceByID", {
        data: response.data,
        service_id: obj.service_id
      })
      resolve()
    }).catch(() => {
      reject("error getting contract service data")
    })
  })
}

export async function getRequest(context, obj) {
  const url = API.GET.vendor.request({
    vendor_id: obj.vendor_id,
    request_id: obj.request_id
  })

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setRequestByID", {
        data: response.data,
        request_id: obj.request_id
      })
      resolve()
    }).catch(() => {
      reject("error getting contract request data")
    })
  })
}

export async function consultantEngagement(context, obj) {
  const vendorID = obj.vendorID
  const _method = obj.method
  let _url = API.COMMON.vendor.consultantEngagement(vendorID)
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
      resolve(response.data)
    }).catch(error => {
      if (error.response) {
        if (error.response.data.errors !== undefined) {
          const errMessage = Object.values(error.response.data.errors)[0][0]
          reject(errMessage)
        } else if (error.response.data.error !== undefined) {
          const errMessage = error.response.data.error
          reject(errMessage)
        }
      } else if (error.data) {
        reject(error.data.error)
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
      console.log(error.config)
      reject("Failed to create Engagement")
    })
  })
}

export async function consultantEngagementMilestones(context, obj) {
  const _method = obj.method
  let _url = API.COMMON.consultantEngagementMilestones()
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
      resolve(response.data)
    }).catch(error => {
      if (error.response) {
        if (error.response.data.errors !== undefined) {
          const errMessage = Object.values(error.response.data.errors)[0][0]
          reject(errMessage)
        } else if (error.response.data.error !== undefined) {
          const errMessage = error.response.data.error
          reject(errMessage)
        }
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
      console.log(error.config)
      reject("Failed to create Engagement Milestone")
    })
  })
}

export async function getVendorDocuments(context, vendorId) {
  const url = API.GET.vendor.documents(vendorId)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setVendorDocuments", response.data)
      // context.commit('setCustomers', response.data)
      resolve()
    }).catch(() => {
      reject("error getting documents")
    })
  })
}

export async function postServiceAlert() {
  const url = API.POST.vendor.serviceAlert()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post"
    }).then(response => {
      // context.commit('setServiceAlerts', { data: response.data })
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function getServiceAlerts(context, obj) {
  let queryParam = {
    include: [
      "service.contract.vendor",
      "service.contract.customer",
      "service.requests",
      "engagement",
      "submitter",
      "notes.user",
      "status"
    ].join(","),
    sort: "created_at"
  }
  if (obj.matchCustomerId) {
    queryParam = { ...queryParam, "filter[customer_id]": obj.matchCustomerId }
  }
  if (obj.matchVendorId) {
    queryParam = { ...queryParam, "filter[vendor_id]": obj.matchVendorId }
  }

  const url = API_METHODS.queryString(
    API.COMMON.serviceAlerts(),
    queryParam
  )

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setServiceAlerts", { data: response.data })
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function getServiceAlert(context, obj) {
  const url = API_METHODS.queryString(
    API.GET.serviceAlert(obj),
    {
      include: [
        "service.contract.customer",
        "service.contract.vendor",
        "engagement",
        "submitter",
        "notes.user",
        "notes.attachments.media",
        "status",
        "project",
        "service_line"
      ].join(","),
      sort: "created_at"
    }
  )

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setServiceAlert", { data: response.data })
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function getServiceAlertStatuses(context) {
  const url = API.GET.serviceAlertStatuses()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setServiceAlertStatuses", { data: response.data })
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function createNote(context, formData) {
  const url = API.POST.vendor.createNote()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      data: formData
    }).then(response => {
      resolve(response)
    }).catch(e => {
      console.log(e)
      reject(e)
    })
  })
}

export async function deployOrder(context, obj) {
  const url = API.POST.vendor.deployOrder(obj.customerRequestID)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: {
        engagements: obj.engagements,
        organisation_id: obj.organisation_id
      }
    }).then(response => {
      resolve(response)
    }).catch(e => {
      console.log(e)
      reject(e)
    })
  })
}
export async function generateInvoice(context, payload) {
  return new Promise((resolve, reject) => {
    this.$api.request({
      url: "/api/timesheets/vendors/timesheet",
      method: "post",
      data: payload
    })
    .then(function(response) {
      resolve(response.data)  // Return the server response data
    })
    .catch(function(error) {
      if (error.response) {
        reject(error.response.data.message || "An error occurred while generating invoice")
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
    })
  })
}


export async function getInvoices(context, params = {}) {
  return new Promise((resolve, reject) => {
    this.$api.request({
     // url: "/api/timesheets/invoices",
       url: "/api/timesheets/vendors/timesheet",
      method: "get",
      params: params // 👈 inject query parameters here
    }).then(function(response) {
      context.commit('setGenerateInvoices', response.data)
      resolve(response.data)
    }).catch(function(error) {
      if (error.response) {
        reject(error.response)
      } else {
        reject(error)
      }
    })
  })
}