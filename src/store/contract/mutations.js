import initialState from "./state"

export function reset(state) {
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

export function setLinkedOrganisationsByID(state, obj) {
  if (Array.isArray(obj.organisations)) {
    state.linkedOrganisationsByID[obj.organisation_id] = obj.organisations
  }
}

export function setSpendReportsByCustomer(state, obj) {
  state.spendReportsByCustomer[obj.customer_id] = obj.data
}

export function setOrganisationContracts(state, obj) {
  state.organisationContracts[obj.organisation_id] = obj.data
}

export function setOrganisationPurchaseOrders(state, obj) {
  state.organisationPurchaseOrders[obj.organisation_id] = obj.data
}

export function setContracts(state, obj) {
  state.contracts = obj.data
}

export function setRequest(state, obj) {
  state.request = obj.data
}

export function setContract(state, obj) {
  state.contract = obj.data
}

export function setService(state, obj) {
  state.service = obj
}

export function setServicesById(state, obj) {
  state.servicesById[obj.service_id] = obj.service
}

export function addServiceEngagement(state, obj) {
  const request = state.servicesById[obj.service_id].requests.find(request => request.id === obj.request_id)
  request.consultant_engagements.push(obj.engagement)
}

export function removeServiceEngagement(state, obj) {
  const request = state.servicesById[obj.service_id].requests.find(request => request.id === obj.request_id)
  const index = request.consultant_engagements.findIndex(el => el.id === obj.engagement_id)
  request.consultant_engagements.splice(index, 1)
}

export function updateServiceEngagement(state, obj) {
  const request = state.servicesById[obj.service_id].requests.find(request => request.id === obj.request_id)
  const index = request.consultant_engagements.findIndex(el => el.id === obj.engagement.id)
  request.consultant_engagements[index] = obj.engagement
}

export function addMilestoneAssignment(state, obj) {
  const po = state.servicesById[obj.service_id].purchase_orders.find(po => po.id === obj.purchase_order_id)
  const milestone = po.milestones.find(m => m.id === obj.purchase_order_milestone_id)
  if (milestone.engagements === undefined) {
    milestone.engagements = []
  }
  milestone.engagements.push({
    id: obj.id,
    consultant_engagement_id: obj.consultant_engagement_id,
    purchase_order_milestone_id: obj.purchase_order_milestone_id,
    units: obj.units
  })
}

export function updateMilestoneAssignment(state, obj) {
  const po = state.servicesById[obj.service_id].purchase_orders.find(po => po.id === obj.purchase_order_id)
  const milestone = po.milestones.find(m => m.id === obj.milestone_id)
  const index = milestone.engagements.findIndex(el => el.id === obj.id)
  milestone.engagements[index].units = obj.units
}

export function removeMilestoneAssignment(state, obj) {
  const po = state.servicesById[obj.service_id].purchase_orders.find(po => po.id === obj.purchase_order_id)
  const milestone = po.milestones.find(m => m.id === obj.milestone_id)
  const index = milestone.engagements.findIndex(el => el.id === obj.id)
  milestone.engagements.splice(index, 1)
}

export function setCapabilities(state, capes) {
  state.capabilities = capes
}

export function setCustomerrequests(state, a) {
  if (Array.isArray(a)) {
    state.customerrequests = a
  }
}

export function setCustomerrequest(state, a) {
  state.customerrequest = a
}

export function setCustomerRequestCapabilities(state, cRc) {
  state.customerRequestCapabilities = cRc
}
