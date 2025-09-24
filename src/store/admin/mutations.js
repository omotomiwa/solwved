import initialState from "./state"

export function reset(state) {
  Object.assign(state, initialState())
}

export function setUsersByCustomerID(state, obj) {
  if (Array.isArray(obj.users)) {
    state.usersByCustomerID[obj.customer_id] = obj.users
  }
}

export function setUsersByVendorID(state, obj) {
  if (Array.isArray(obj.users)) {
    state.usersByVendorID[obj.vendor_id] = obj.users
  }
}

export function setOrganisations(state, a) {
  if (Array.isArray(a) && a.length > 0) {
    state.organisations = a
  }
}

export function setDeliverymodels(state, a) {
  if (Array.isArray(a) && a.length > 0) {
    state.deliverymodels = a
  }
}

export function setFinancialmodels(state, a) {
  if (Array.isArray(a) && a.length > 0) {
    state.financialmodels = a
  }
}

export function setContracts(state, a) {
  if (Array.isArray(a) && a.length > 0) {
    state.contracts = a
  }
}

export function setContractsByID(state, obj) {
  state.contractsByID[obj.contract_id] = obj.contract
}

export function setContractsByOrganisationID(state, obj) {
  state.contractsByOrganisationID[obj.organisationId] = obj.contracts
}

export function addContractByOrganisationID(state, obj) {
  state.contractsByOrganisationID[obj.organisationId].push(obj.contract)
}

export function setServicesById(state, obj) {
  state.servicesByID[obj.service_id] = obj.service
}

export function setUsers(state, a) {
  if (Array.isArray(a) && a.length > 0) {
    state.users = a
  }
}

export function setSpecialUsers(state, a) {
  state.users = a
}

export function setVendorUsers(state, a) {
  state.users = a
}

export function setCustomerUsers(state, a) {
  state.users = a
}

export function setOrganisation(state, o) {
  state.organisation = o
}

export function setAdminusers(state, a) {
  if (Array.isArray(a) && a.length > 0) {
    state.adminUsers = a
  }
}

export function setCompetencies(state, a) {
  if (Array.isArray(a) && a.length > 0) {
    state.competencies = a
  }
}

export function setAllVendors(state, a) {
  if (Array.isArray(a) && a.length > 0) {
    state.allVendors = a
  }
}

export function setAllCustomers(state, a) {
  if (Array.isArray(a) && a.length > 0) {
    state.allCustomers = a
  }
}

export function setOrganisationRelationships(state, a) {
  if (Array.isArray(a) && a.length > 0) {
    state.organisationRelationsips = a
  }
}

export function addOrganisationRelationship(state, obj) {
  state.organisationRelationsips.push(obj)
}

export function deleteOrganisationRelationship(state, obj) {
  // state.organisationRelationsips.push(obj)
  const test = element =>
    (element.org1_id === obj.org1_id && element.org2_id === obj.org2_id) ||
    (element.org1_id === obj.org2_id && element.org2_id === obj.org1_id)
  const index = state.organisationRelationsips.findIndex(test)
  if (index !== undefined) {
    state.organisationRelationsips.splice(index, 1)
  }
}

export function setOrganisationTypes(state, a) {
  if (Array.isArray(a) && a.length > 0) {
    state.organisationTypes = a
  }
}

export function setIsBuiltEnvironment(state, a) {
  state.isBuiltEnvironment = a
}
