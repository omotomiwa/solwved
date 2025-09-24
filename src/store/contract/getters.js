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

export function getLinkedOrganisations(state) {
  return id => {
    if (state.linkedOrganisationsByID[id] === undefined) {
      return []
    } else {
      return state.linkedOrganisationsByID[id]
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

export function getOrganisationContracts(state) {
  return id => {
    if (state.organisationContracts[id] === undefined) {
      return []
    } else {
      return state.organisationContracts[id]
    }
  }
}

export function getOrganisationPurchaseOrders(state) {
  return id => {
    if (state.organisationPurchaseOrders[id] === undefined) {
      return []
    } else {
      return state.organisationPurchaseOrders[id]
    }
  }
}

export function getContracts(state) {
  return state.contracts
}

export function getContract(state) {
  return state.contract
}

export function getRequest(state) {
  return state.request
}

export function getService(state) {
  return state.service
}

export function getServicesById(state) {
  return id => {
    if (state.servicesById[id] === undefined) {
      return false
    } else {
      return state.servicesById[id]
    }
  }
}

export function getCapabilities(state) {
  return state.capabilities.capes
}

export function getCustomerrequests(state) {
  return state.customerrequests
}

export function getCustomerrequest(state) {
  return state.customerrequest
}

export function getCustomerRequestCapabilities(state) {
  return state.customerRequestCapabilities
}
