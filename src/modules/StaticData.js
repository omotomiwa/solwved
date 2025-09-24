export const RulesRegex = {
  date: /^([0-9]{4})\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/
}

export const ClassCombinations = {
  pageContainer: "row justify-center items-start q-pa-xs-sm q-pa-md-md q-pb-xl"
}

export const localStorageKey = {
  USER_ID: "user_id",
  PAGE: "page",
  PAGE_QUERY: "page_query",
  PREVIOUS_PAGE: "previous_page",
  PREVIOUS_PAGE_QUERY: "previous_page_query"
}

export const Config = {
  LOCALE: "en-GB",
  CURRENCY_CODE: "GBP",
  CURRENCY_SYMBOL: "£",
  DATE_MASK: "##/##/####",
  DATE_FORMAT_DMY: "DD/MM/YYYY",
  DATE_FORMAT_DLY: "dd/LL/yyyy",
  PERIOD_DATE_FORMAT_DLY: "dd LLL yyyy",
  DATETIME_FORMAT_DMY_HM: "DD/MM/YYYY HH:mm:ss",
  DATETIME_FORMAT_DMMMY_HM: "D MMM YYYY, HH:mm:ss",
  MONTH_FORMAT: "LLL",
  YEAR_FORMAT: "yyyy",
  DATE_FORMAT_YMD: "yyyy-MM-dd"
}

export const OrganisationType = {
  DEFAULT: 1,
  BUILT_ENVIRONMENT: 2
}

export const UserAccessTypes = {
  REPORTS: {
    value: "reports",
    label: "Reports",
    info: "View Reports",
    module: "Report"
  },
  DELIVERY: {
    value: "delivery",
    label: "Delivery",
    info: "Delivery Data",
    module: "Delivery"
  },
  DOCUMENT_MANAGER: {
    value: "document_manager",
    label: "Document Manager",
    info: "Document Manager",
    module: "Document"
  },
  SERVICE_CATALOGUE: {
    value: "service_catalogue",
    label: "Service Catalogue",
    info: "Service Catalogue",
    module: "Service Catalogue"
  },
  SERVICE_CATALOGUE_VIEW: {
    value: "service_catalogue_view",
    label: "Service Catalogue View",
    info: "Service Catalogue View",
    module: "Service Catalogue"
  },
  SERVICE_CATALOGUE_MANAGER: {
    value: "service_catalogue_manager",
    label: "Service Catalogue Manager",
    info: "Service Catalogue Manager",
    module: "Service Catalogue"
  }
}
