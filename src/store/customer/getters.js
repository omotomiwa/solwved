export function getCustomers(state) {
  return state.customers
}

export function getVendorsByCustomer(state) {
  return id => {
    if (state.vendorsByCustomerID[id] === undefined) {
      return []
    } else {
      return state.vendorsByCustomerID[id]
    }
  }
}

export function getSpendReports(state) {
  return id => {
    if (state.spendReportsByCustomer[id] === undefined) {
      return []
    } else {
      return state.spendReportsByCustomer[id]
    }
  }
}

export function getContracts(state) {
  return state.contracts
}

export function getContract(state) {
  return state.contract
}
