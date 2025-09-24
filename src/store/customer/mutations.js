import initialState from "./state"

export function reset(state, obj) {
  Object.assign(state, initialState())
}

export function setCustomers(state, data) {
  if (Array.isArray(data)) {
    state.customers = data
  }
}

export function setVendorsByCustomerID(state, obj) {
  if (Array.isArray(obj.vendors)) {
    state.vendorsByCustomerID[obj.customer_id] = obj.vendors
  }
}

export function setSpendReportsByCustomer(state, obj) {
  state.spendReportsByCustomer[obj.customer_id] = obj.data
}

export function setContracts(state, obj) {
  state.contracts = obj.data
}

export function setContract(state, obj) {
  state.contract = obj.data
}

export function setServiceAlerts(state, obj) {
  state.serviceAlerts = [...obj.data]
}
