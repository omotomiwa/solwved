export const API_METHODS = {
  queryString: (url, query = {}) => {
    return url
      + (
        Object.keys(query || {}).length
          ? "?" + new URLSearchParams(query || {}).toString()
          : ""
      )
  }
}

export const API = {
  GET: {
    vendor: {
      access: () => "/api/organisations/vendorAccess",
      consultants: vendor_id => "/api/vendor/" + vendor_id + "/consultants",
      consultantEngagements: url_data => "/api/vendor/" + url_data.vendor_id + "/consultant/" + url_data.consultant_id + "/engagements",
      users: vendor_id => "/api/vendor/" + vendor_id,
      contracts: vendor_id => "/api/vendor/" + vendor_id + "/contracts",
      customers: vendor_id => "/api/vendor/" + vendor_id + "/customers",
      serviceReport: url_data => "/api/vendor/" + url_data.vendor_id + "/report/" + url_data.service_id,
      miData: vendor_id => "/api/mi/vendor/" + vendor_id + "/consultant_engagements",
      reports: vendor_id => "/api/vendor/" + vendor_id + "/spendreports/",
      spendReport: url_data => "/api/vendor/" + url_data.vendor_id + "/spendreports/" + url_data.report_id,
      approveSpendReport: url_data => "/api/vendor/" + url_data.vendor_id + "/spendreports/" + url_data.report_id + "/approve",
      unApproveSpendReport: url_data => "/api/vendor/" + url_data.vendor_id + "/spendreports/" + url_data.report_id + "/unapprove",
      service: url_data => "/api/vendor/" + url_data.vendor_id + "/service/" + url_data.service_id,
      request: url_data => "/api/vendor/" + url_data.vendor_id + "/request/" + url_data.request_id,
      documents: vendor_id => "/api/media/" + vendor_id
    },

    customer: {
      access: () => "/api/organisations/customerAccess",
      vendors: customer_id => "/api/customer/" + customer_id + "/vendors",
      approveService: service_id => "/api/services/" + service_id + "/approve",
      reports: customer_id => "/api/customer/" + customer_id + "/spendreports/",
      spendReport: url_data => "/api/customer/" + url_data.customer_id + "/spendreports/" + url_data.report_id,
      approveSpendReport: url_data => "/api/customer/" + url_data.customer_id + "/spendreports/" + url_data.report_id + "/approve",
      unApproveSpendReport: url_data => "/api/customer/" + url_data.customer_id + "/spendreports/" + url_data.report_id + "/unapprove",
      customerVendors: customer_id => "/api/customer/" + customer_id + "/vendors",
      contracts: customer_id => "/api/customer/" + customer_id + "/contracts"
    },

    consultant: {
      deliveryRecords: consultant_engagement_id => "/api/consultant/delivery-records/" + consultant_engagement_id,
      engagements: () => "/api/consultant/engagements",
      fallowWeek: () => "/api/consultant/fallowweek",
      getInvoices: (engagement_id) => "/api/timesheets/consultants/timesheet/submit/" + engagement_id
    },

    // vendor -> action
    serviceAlert: id => "/api/servicealerts/" + id,
    serviceAlertStatuses: () => "/api/servicealerts/statuses",
    consultantTypes: () => "/api/consultant/types",

    // site -> action
    siteConfig: () => "/api/site/config",

    // common
    contracts: () => "/api/contracts",

    // contract -> action
    customerAccess: () => "/api/customer/user/list",
    linkedOrganisations: organisation_id => "/api/organisationRelationships/" + organisation_id,
    contract: contract_id => "/api/contracts/" + contract_id,
    request: request_id => "/api/requests/" + request_id,
    capabilities: () => "/api/capabilities",
    customerRequests: () => "/api/customerrequests",
    customerRequest: customer_request_id => "/api/customerrequests/" + customer_request_id,
    purchaseOrders: url_data => "/api/purchaseorders/" + url_data.organisation_type + "/" + url_data.organisation_id,
    purchaseOrderMilestones: purchase_order_id => "/api/purchaseorders/" + purchase_order_id + "/milestones",
    serviceTemplates: organisation_id => "/api/vendor/" + organisation_id + "/servicetemplates",
    serviceTemplate: url_data => "/api/vendor/" + url_data.organisation_id + "/servicetemplates/" + url_data.template_id,

    // common -> action
    currencies: () => "/api/currency",
    competencies: () => "/api/competencies",
    selectors: model => "/api/" + model + "/selectors",
    organisations: () => "/api/organisations",
    organisation: organisation_id => "/api/organisations/" + organisation_id,
    changeRequest: change_request_id => "/api/changerequests/" + change_request_id,
    serviceContractView: () => "/api/views/serviceContractView",
    consultantEngagementView: () => "/api/views/consultantEngagementView",
    serviceConsultantEngagements: service_id => "/api/services/" + service_id + "/consultantengagements",
    purchaseOrderSpend: purchase_order_id => "/api/purchaseorders/" + purchase_order_id + "/cumulativespend",
    pendingCustomerRequestsByService: service_id => "/api/customerrequests/service/" + service_id + "/pending",

    // auth -> action
    getCSRF: () => "/sanctum/csrf-cookie",
    verifyEmail: url_data => "/api/email/verify/" + url_data.user_id + "/" + url_data.email_hash,
    get2faImage: () => "/api/user/two-factor-qr-code",
    get2faRecoveryCodes: () => "/api/user/two-factor-recovery-codes",

    // admin -> action
    organisationContracts: organisation_id => "/api/contracts/organisation/" + organisation_id,
    customerUsers: customer_id => "/api/customerusers/customer/" + customer_id,
    specialUsers: () => "/api/specialUser",
    allVendors: () => "/api/organisations/allVendors",
    allCustomers: () => "/api/organisations/allCustomers",
    organisationTypes: () => "/api/organisations/types",

    // timesheet
    getInvoices: engagement_id => "/api/timesheets/consultants/timesheet/submit/" + engagement_id,
    getTimesheet: engagement_id => "/api/timesheets/consultants/timesheet/" + engagement_id,
    getInvoicesApproval: () => "/api/timesheets/customers/timesheet",
    copyWeek: vendor_id => "/api/timesheets/consultants/timesheet/copy-week/" + vendor_id
  },
  POST: {
    vendor: {
      generateSpendReport: vendor_id => "/api/vendor/" + vendor_id + "/spendreports",
      serviceAlert: () => "/api/servicealerts",
      createNote: () => "/api/notes",
      deployOrder: customer_request_id => "/api/customerrequests/" + customer_request_id + "/deploy"
    },

    consultant: {
      saveDeliveryRecord: () => "/api/consultant/save-delivery-record",
      updateDeliveryRecord: () => "/api/consultant/update-delivery-record",
      submitDeliveryRecords: () => "/api/consultant/submit-delivery-records"
    },

    // contract -> action
    purchaseOrderMilestones: purchase_order_id => "/api/purchaseorders/" + purchase_order_id + "/milestones",
    createTemplateFromService: organisation_id => "/api/vendor/" + organisation_id + "/servicetemplates/service",
    createServiceTemplate: organisation_id => "/api/vendor/" + organisation_id + "/servicetemplates",
    applyServiceTemplate: () => "/api/services/applytemplate",

    // auth -> action
    login: () => "/api/login",
    forgotPassword: () => "/api/forgot-password",
    resetPassword: () => "/api/reset-password",
    logout: () => "/api/logout",
    emailVerification: () => "/api/email/verification-notification",
    clearCache: () => "/api/cache/clear",
    enable2fa: () => "/api/user/two-factor-authentication",
    verify2fa: () => "/api/two-factor-challenge",
    confirm2fa: () => "/api/user/verify-mfa",
    changeRecoveryCode: () => "/api/user/two-factor-recovery-codes",

    // admin -> action
    createVendorUser: () => "/api/admin/vendorusers",

    // common
    media: () => "/api/media",
    multipleMedia: () => "/api/multiple-media",

    // Timesheet
    createTimesheet: () => "/api/timesheets/consultants/timesheet/create",
    updateTimesheet: timesheet_id => "/api/timesheets/consultants/timesheet/" + timesheet_id + "/update",
    acceptTimesheetApproval:timesheet_id => "/api/timesheets/customers/timesheet/"+timesheet_id + "/accept",
    rejectTimesheet:timesheet_id => "/api/timesheets/customers/timesheet/" + timesheet_id + "/reject",
    generateInvoice:() => "/api/timesheets/consultants/timesheet/submit"
  },
  PUT: {
    vendor: {
      createConsultant: vendor_id => "/api/vendor/" + vendor_id + "/consultant",
      createVendorUser: vendor_id => "/api/vendor/" + vendor_id + "/user"
    },

    // vendor -> action
    updateSpecialUser: user_id => "/api/specialUser/" + user_id,
    updatePassword: () => "/api/user/password",
    updateProfile: () => "/api/user/profile-information",

    // admin -> action
    updateOrganisation: organisation_id => "/api/organisation/" + organisation_id
  },
  PATCH: {
    vendor: {
      updateContract: url_data => "/api/vendor/" + url_data.vendor_id + "/contract/" + url_data.contract_id,
      unSubmitDeliveryRecord: url_data => "/api/vendor/" + url_data.vendor_id + "/delivery-record/" + url_data.delivery_record_id,
      updateSpendReport: url_data => "/api/vendor/" + url_data.vendor_id + "/spendreports/" + url_data.report_id
    },

    customer: {
      updateSpendReport: url_data => "/api/customer/" + url_data.customer_id + "/spendreports/" + url_data.report_id
    }
  },
  DELETE: {
    vendor: {
      user: vendor_id => "/api/vendor/" + vendor_id + "/user",
      spendReport: url_data => "/api/vendor/" + url_data.vendor_id + "/spendreports/" + url_data.report_id
    },

    // contract -> action
    serviceTemplate: url_data => "/api/vendor/" + url_data.vendor_id + "/servicetemplates/" + url_data.template_id,

    // auth -> action
    disable2fa: () => "/api/user/two-factor-authentication"
  },
  COMMON: {
    vendor: {
      consultantEngagement: vendor_id => "/api/vendor/" + vendor_id + "/consultantengagement"
    },

    // vendor -> action
    consultantEngagementMilestones: () => "/api/consultantengagementmilestones",
    raidLog: raid_log_id => "/api/raidlog/" + raid_log_id,

    // common
    raidLogs: () => "/api/raidlog",
    serviceAlerts: () => "/api/servicealerts",
    changeRequests: () => "/api/changerequests",
    user: () => "/api/user",
    services: () => "/api/services",
    service: service_id => "/api/services/" + service_id,
    organisationRelationships: () => "/api/organisationRelationships",
    mediaLink: url_data => "/api/media/" + url_data.organisation_id + "/" + url_data.media_id
  }
}
