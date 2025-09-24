export function getEngagements(state) {
  return state.engagements
}

export function getEngagement(state) {
  return (id) => {
    state.engagements.find(function(engagement) {
      if (parseInt(engagement.id) === parseInt(id)) {
        return engagement
      }
      return false
    })
  }
}

export function getDeliveryData(state) {
  return state.deliveryData
}

export function getDeliveryRecords(state) {
  if (Object.keys(state.deliveryRecords).length === 0) {
    return false
  } else {
    return state.deliveryRecords
  }
}

export function getContracts(state) {
  return state.contracts
}

export function getFallowWeek(state) {
  return state.fallowWeek
}
export function getInvoices(state) {
  return state.invoices
}
export function getWeek(state) {
  return state.week
}
export function getOrganisation(state) {
  return state.organisation
}
