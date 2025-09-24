export function getUsersByCustomer(state) {
  return id => {
    if (state.usersByCustomerID[id] === undefined) {
      return []
    } else {
      return state.usersByCustomerID[id]
    }
  }
}

export function getContractsById(state) {
  return id => {
    if (state.contractsByID[id] === undefined) {
      return []
    } else {
      return state.contractsByID[id]
    }
  }
}

export function getContractsByOrganisationId(state) {
  return id => {
    if (state.contractsByOrganisationID[id] === undefined) {
      return []
    } else {
      return state.contractsByOrganisationID[id]
    }
  }
}

export function getServicesById(state) {
  return id => {
    if (state.servicesByID[id] === undefined) {
      return []
    } else {
      return state.servicesByID[id]
    }
  }
}

export function getUsersByVendor(state) {
  return id => {
    if (state.usersByVendorID[id] === undefined) {
      return []
    } else {
      return state.usersByVendorID[id]
    }
  }
}

export function getOrganisations(state) {
  return state.organisations
}

export function getOrganisation(state) {
  return state.organisation
}

export function getIsBuiltEnvironment(state) {
  return state.isBuiltEnvironment
}

export function getOrganisationRelationships(state) {
  return state.organisationRelationsips
}

export function getDeliveryModels(state) {
  return state.deliverymodels
}

export function getFinancialModels(state) {
  return state.financialmodels
}

export function getContracts(state) {
  return state.contracts
}

export function getOrganisationById(state) {
  return id => {
    if (state.organisations[id] === undefined) {
      return false
    } else {
      return state.organisations[id]
    }
  }
}

export function getUsers(state) {
  return state.users
}

export function getAdminUsers(state) {
  return state.adminUsers
}

export function getVendorUsers(state) {
  return state.vendorUsers
}

export function getCustomerUsers(state) {
  return state.vendorUsers
}

export function getCompetencies(state) {
  return state.competencies
}

export function allVendors(state) {
  return state.allVendors
}

export function allCustomers(state) {
  return state.allCustomers
}

export function getOrganisationTypes(state) {
  return state.organisationTypes
}
