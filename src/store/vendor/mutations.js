import initialState from "./state"

export function reset(state, obj) {
  Object.assign(state, initialState())
}

export function setVendors(state, data) {
  if (Array.isArray(data)) {
    state.vendors = data
  }
}

export function setConsultantsByVendorID(state, obj) {
  if (Array.isArray(obj.consultants)) {
    state.consultantsByVendorID[obj.vendor_id] = obj.consultants
  }
}

export function setConsultantTypes(state, obj) {
  if (Array.isArray(obj)) {
    state.consultantTypes = obj
  }
}

export function setEngagementsByConsultantID(state, obj) {
  if (Array.isArray(obj.engagements)) {
    state.engagementsByConsultantID[obj.consultant_id] = obj.engagements
  }
}

export function setUsersByVendorID(state, obj) {
  if (Array.isArray(obj.users)) {
    state.usersByVendorID[obj.vendor_id] = obj.users
  }
}

export function setContractsByVendorID(state, obj) {
  if (Array.isArray(obj.contracts)) {
    state.contractsByVendorID[obj.vendor_id] = obj.contracts
  }
}

export function setCustomersByVendorID(state, obj) {
  if (Array.isArray(obj.customers)) {
    state.customersByVendorID[obj.vendor_id] = obj.customers
  }
}

export function setMiDataByVendor(state, obj) {
  state.miDataByVendorID[obj.vendor_id] = obj.data
}

export function setSpendReportsByVendor(state, obj) {
  state.spendReportsByVendor[obj.vendor_id] = obj.data
}

export function setReportByServiceID(state, obj) {
  state.contractReportByServiceID[obj.service_id] = obj.data
}

export function setServiceByID(state, obj) {
  state.serviceByID[obj.service_id] = obj.data
}

export function setRequestByID(state, obj) {
  state.requestByID[obj.request_id] = obj.data
}

export function setVendorDocuments(state, obj) {
  state.documents = obj
}

export function setServiceAlerts(state, obj) {
  state.serviceAlerts = [...obj.data]
}

export function setServiceAlert(state, obj) {
  state.serviceAlert = obj.data
}

export function setServiceAlertStatuses(state, obj) {
  state.serviceAlertStatuses = obj.data
}
export function setGenerateInvoices(state, invoices) {
  if (Array.isArray(invoices)) {
    state.invoices = invoices
  }
}