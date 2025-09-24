import { API, API_METHODS } from "src/modules/ApiList.js"
import { OrganisationType } from "src/modules/StaticData.js"

export async function saveDeliveryRecord(context, record) {
  const url = API.POST.consultant.saveDeliveryRecord()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: record
    }).then(function() {
      resolve()
    }).catch(error => {
      if (error.response) {
        reject(error.response.data.message)
      } else if (error.request) {
        reject(error.request)
      } else {
        console.log("Error", error.message)
        reject(error.message)
      }
    })
  })
}

export async function updateDeliveryRecord(context, updates) {
  const url = API.POST.consultant.updateDeliveryRecord()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: updates
    }).then(response => {
      resolve(response)
    }).catch(error => {
      if (error.response) {
        reject(error.response)
      }
      reject(error)
    })
  })
}

export async function submitDeliveryRecords(context, _data) {
  const url = API.POST.consultant.submitDeliveryRecords()

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: _data
    }).then(response => {
      resolve(response)
    }).catch(error => {
      if (error.response) {
        reject(error.response)
      }
      reject(error)
    })
  })
}

export async function getDeliveryRecords(context, data) {
  const url = API.GET.consultant.deliveryRecords(data.consultant_engagement_id)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setDeliveryRecords", response.data)
      resolve(response.data)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function engagements(context) {
  const url = API.GET.consultant.engagements()

  this.$api.request({
    url: url,
    method: "get"
  }).then(response => {
    context.commit("setEngagements", response.data)
  }).catch(error => {
    if (error.response) {
      console.log(error.response.data)
      console.log(error.response.status)
      console.log(error.response.headers)
    } else if (error.request) {
      console.log(error.request)
    } else {
      console.log("Error", error.message)
    }
    console.log(error.config)
  })
}

export async function getContracts() {
  const url = API.GET.contracts()

  this.$api.request({
    url: url,
    method: "get"
  }).then(() => {
  }).catch(error => {
    if (error.response) {
      console.log(error.response.data)
      console.log(error.response.status)
      console.log(error.response.headers)
    } else if (error.request) {
      console.log(error.request)
    } else {
      console.log("Error", error.message)
    }
    console.log(error.config)
  })
}

export async function fallowWeek(context) {
  const url = API.GET.consultant.fallowWeek()

  this.$api.request({
    url: url,
    method: "get"
  }).then(response => {
    context.commit("setFallowWeek", response.data)
  }).catch(error => {
    if (error.response) {
      console.log(error.response.data)
      console.log(error.response.status)
      console.log(error.response.headers)
    } else if (error.request) {
      console.log(error.request)
    } else {
      console.log("Error", error.message)
    }
    console.log(error.config)
  })
}

export async function getInvoices(context, engagement_id) {
  const url = API.GET.consultant.getInvoices(engagement_id)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(function(response) {
      context.commit('setInvoices', response.data)
      resolve(response.data)
    }).catch(function(error) {
      if (error.response) {
        reject(error.response)
      } else {
        reject(error)
      }
    })
  })
}


export async function getTimesheet(context, { engagement_id, status }) {
  return new Promise((resolve, reject) => {
    const url = API_METHODS.queryString(
      API.GET.getTimesheet(engagement_id),
      status ? {status:status} : {}
    )

    this.$api
      .request({
        url: url,
        method: "get",
      })
      .then((response) => {
        context.commit("setInvoicesApproval", response.data);
        resolve(response.data);
      })
      .catch((error) => {
        reject(error.response || error);
      });
  });
}

export async function getInvoicesApproval(context, params = {}) {
  const url = API.GET.getInvoicesApproval();
  const query = {};

  // Include customer_id only if it's available
  if (params.customer_id) {
    query.customer_id = params.customer_id;
  }

  // Include other filters if available
  if (params["filters[status]"]) {
    query["filters[status]"] = params["filters[status]"];
  }

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get",
      params: query
    })
      .then((response) => {
        context.commit('setInvoicesApproval', response.data);
        resolve(response.data);
      })
      .catch((error) => {
        if (error.response) {
          reject(error.response);
        } else {
          reject(error);
        }
      });
  });
}

export async function copyWeek(context, params) {
  const url = API.GET.copyWeek(params.vendor_id)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get",
      // remove `params` unless you need other query params
    })
    .then(response => resolve(response.data))
    .catch(error => {
      if ('response' in error && error.response) {
        reject(error.response.data.message || "An error occurred while copying the week");
      } else if ('request' in error && error.request) {
        reject(error.request);
      } else {
        reject(error?.message);
      }
    });
  });
}


export async function createTimesheet(context, payload) {
  const url = API.POST.createTimesheet();

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: payload
    })
    .then(function(response) {
      resolve(response.data)  // You can resolve the response data if needed
    })
    .catch(function(error) {
      if (error.response) {
        reject(error.response.data.message || "An error occurred while creating the timesheet")
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
    })
  })
}
export async function updateTimesheet(context, { timesheet_id, data }) {
  const url = API.POST.updateTimesheet(timesheet_id);

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: data,
    })
    .then(response => {
      resolve(response.data)  // return the updated timesheet data
    })
    .catch(error => {
      if (error.response) {
        reject(error.response.data.message || "An error occurred while updating the timesheet");
      } else if (error.request) {
        reject(error.request);
      } else {
        reject(error.message);
      }
    });
  });
}




export async function acceptTimesheetApproval(context, timesheet_id) {
  const url = API.POST.acceptTimesheetApproval(timesheet_id);

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post"
    })
    .then(function(response) {
      resolve(response.data)  // Resolve with returned data
    })
    .catch(function(error) {
      if (error.response) {
        reject(error.response.data.message || "An error occurred while accepting timesheet approval")
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
    })
  })
}
export async function rejectTimesheet(context, payload) {
  const { timesheet_id, reason } = payload;
  const url = API.POST.rejectTimesheet(timesheet_id);

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: { reason } // 👈 Send reason in POST body
    })
    .then(function(response) {
      resolve(response.data);
    })
    .catch(function(error) {
      if (error.response) {
        reject(error.response.data.message || "An error occurred while rejecting timesheet");
      } else if (error.request) {
        reject(error.request);
      } else {
        reject(error.message);
      }
    });
  });
}


export async function generateInvoice(context, payload) {
  const url = API.POST.generateInvoice();
  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "post",
      data: payload
    })
    .then(function(response) {
      resolve(response.data)  // Return the server response data
    })
    .catch(function(error) {
      if (error.response) {
        reject(error.response.data.message || "An error occurred while generating invoice")
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
    })
  })
}
export async function getOrganisation(context, id) {
  const url = API.GET.organisation(id)

  return new Promise((resolve, reject) => {
    this.$api.request({
      url: url,
      method: "get"
    }).then(response => {
      context.commit("setOrganisation", response.data)
      
     

      resolve(response.data)
    }).catch(error => {
      if (error.response?.data?.errors !== undefined) {
        const errMessage = Object.values(error.response.data.errors)[0][0]
        reject(errMessage)
      } else if (error.request) {
        reject(error.request)
      } else {
        reject(error.message)
      }
      console.log(error.config)
      reject("Failed to get Organisation")
    })
  })
}
