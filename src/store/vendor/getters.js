export function getVendors(state) {
  return state.vendors
}

export function getConsultantsByVendor(state) {
  return id => {
    if (state.consultantsByVendorID[id] === undefined) {
      return []
    } else {
      return state.consultantsByVendorID[id]
    }
  }
}

export function getConsultantTypes(state) {
  return state.consultantTypes
}

export function getCustomersByVendor(state) {
  return id => {
    if (state.customersByVendorID[id] === undefined) {
      return []
    } else {
      return state.customersByVendorID[id]
    }
  }
}

export function getMiDataByVendor(state) {
  return id => {
    if (state.miDataByVendorID[id] === undefined) {
      return []
    } else {
      return state.miDataByVendorID[id]
    }
  }
}

export function getSpendReports(state) {
  return id => {
    if (state.spendReportsByVendor[id] === undefined) {
      return []
    } else {
      return state.spendReportsByVendor[id]
    }
  }
}

export function getEngagementsByConsultantID(state) {
  return id => {
    if (state.engagementsByConsultantID[id] === undefined) {
      return []
    } else {
      return state.engagementsByConsultantID[id]
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

export function getContractsByVendor(state) {
  return id => {
    if (state.contractsByVendorID[id] === undefined) {
      return []
    } else {
      return state.contractsByVendorID[id]
    }
  }
}

export function getReportByService(state) {
  return id => {
    if (state.contractReportByServiceID[id] === undefined) {
      return false
    } else {
      return state.contractReportByServiceID[id]
    }
  }
}

export function getServiceByID(state) {
  return id => {
    if (state.serviceByID[id] === undefined) {
      return false
    } else {
      return state.serviceByID[id]
    }
  }
}

export function getRequestByID(state) {
  return id => {
    if (state.requestByID[id] === undefined) {
      return false
    } else {
      return state.requestByID[id]
    }
  }
}

export function getVendorDocuments(state) {
  return state.documents || []
}

export function getServiceAlerts(state) {
  return state.serviceAlerts
}

export function getServiceAlert(state) {
  return state.serviceAlert
}

export function getServiceAlertStatuses(state) {
  return state.serviceAlertStatuses
}

export function getServiceAlertCount(state) {
  state.serviceAlerts.length ? state.serviceAlerts.length : 10
  // return 10
}
