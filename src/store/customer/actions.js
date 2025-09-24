import { API, API_METHODS } from "src/modules/ApiList.js"

export async function getCustomerAccess(context) {
  // const url = "/api/customer/user/list" //old endpoint changed 2022/12/02
  const url = API.GET.customer.access()

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
  const url = API.GET.customer.vendors(customerID)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setVendorsByCustomerID", { vendors: response.data, customer_id: customerID })
      resolve()
    }).catch(() => {
      reject("error getting Customer Vendors")
    })
  })
}

export async function approveService(context, data) {
  const url = API_METHODS.queryString(
    API.GET.customer.approveService(data.id),
    data.data
  )

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(function() {
      resolve()
    }).catch(() => {
      reject("error approving service")
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
      context.commit("setSpendReportsByCustomer", { data: response.data, customer_id: customerID })
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
  const url = API.PATCH.customer.updateSpendReport({
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

export async function viewContracts(context) {
  const url = API.GET.contracts()

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

export async function getServiceAlerts(context) {
  const url = API.GET.serviceAlert(1)

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

export async function getServiceAlert(context) {
  const url = API.GET.serviceAlert(1)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setServiceAlerts", { data: response.data })
      return resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}
