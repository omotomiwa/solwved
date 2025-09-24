import initialState from "./state"

export function reset(state, obj) {
  Object.assign(state, initialState())
}

export function setSelectors(state, data) {
  state.selectors = data
}

export function setCurrencies(state, data) {
  state.currencies = data
}

export function setOrganisations(state, data) {
  state.organisations = data
}

export function userOrganisation(state, data) {
  state.userOrganisation = data
}

export function setRaidLogs(state, data) {
  state.raidLogs = data
}

export function setRaidLog(state, data) {
  state.raidLog = data
}

export function setChangeRequests(state, data) {
  state.changeRequests = data
}

export function setChangeRequest(state, data) {
  state.changeRequest = data
}

export function setServiceContractView(state, data) {
  state.serviceContractView = data
}

export function setConsultantEngagementView(state, data) {
  state.consultantEngagementView = data
}

export function setServiceConsultantEngagements(state, data) {
  state.serviceConsultantEngagements = data
}

export function setCompetencies(state, a) {
  if (Array.isArray(a) && a.length > 0) {
    state.competencies = a
  }
}
