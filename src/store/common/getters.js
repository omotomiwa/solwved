export function getSelectors(state) {
  return state.selectors ?? []
}

export function getCurrencies(state) {
  return state.currencies ?? []
}

export function getOrganisations(state) {
  return state.organisations
}

export function getUserOrganisation(state) {
  return state.userOrganisation
}

export function getRaidLogs(state) {
  return state.raidLogs
}

export function getRaidLog(state) {
  return state.raidLog
}

export function getChangeRequests(state) {
  return state.changeRequests
}

export function getChangeRequest(state) {
  return state.changeRequest
}

export function getServiceContractView(state) {
  return state.serviceContractView
}

export function getConsultantEngagementView(state) {
  return state.consultantEngagementView
}

export function getServiceConsultantEngagements(state) {
  return state.serviceConsultantEngagements
}

export function getCompetencies(state) {
  return state.competencies
}
