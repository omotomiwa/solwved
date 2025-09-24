import initialState from "./state"

export function reset(state, obj) {
  Object.assign(state, initialState())
}

export function setEngagements(state, data) {
  if (Array.isArray(data)) {
    state.engagements = data
  }
}

export function setDeliveryRecords(state, records) {
  if (Array.isArray(records) && records.length) {
    const consultantEngagementId = records[0].consultant_engagement_id
    state.deliveryRecords[consultantEngagementId] = []
    records.forEach(element => {
      state.deliveryRecords[consultantEngagementId].push(element)
    })
  }
}

export function setFallowWeek(state, data) {
  if (Array.isArray(data)) {
    state.fallowWeek = data
  }
}

export function setInvoices(state, invoices) {
  if (Array.isArray(invoices)) {
    state.invoices = invoices
  }
}
export function setInvoicesApproval(state, data) {
  state.invoicesApproval = data
}
export function setOrganisation(state, o) {
  state.organisation = o
}