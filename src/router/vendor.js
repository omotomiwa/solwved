import { OrganisationType, UserAccessTypes } from "src/modules/StaticData.js"
import EmptyRouterView from "components/EmptyRouterView.vue"
import ServiceAlerts from "pages/common/serviceAlerts/ServiceAlerts.vue"
import ServiceAlert from "pages/common/serviceAlerts/ServiceAlert.vue"
import NewAlert from "pages/common/serviceAlerts/NewAlert.vue"

export const vendorRoutes = [
  {
    path: "vendor/:vendor_id",
    component: EmptyRouterView,
    props: true,
    children: [
      {
        path: "",
        component: () => import("src/pages/vendor/dashboards/VendorDashboard.vue"),
        props: true,
        meta: {
          title: "Vendor Dashboard"
        }
      },
      {
        path: "user-management",
        component: () => import("src/pages/vendor/dashboards/UserManagementDashboard.vue"),
        props: true
      },
      {
        path: "user-management/consultants",
        component: () => import("pages/vendor/Consultants.vue"),
        props: true
      },
      {
        path: "user-management/consultants/:consultant_id",
        component: () => import("pages/vendor/Consultant.vue"),
        props: true
      },
      {
        path: "user-management/access",
        component: () => import("pages/common/Access.vue"),
        props: true
      },
      {
        path: "user-management/customers",
        component: () => import("pages/vendor/Customers.vue"),
        props: true
      },
      {
        path: "user-management/customers/:customer_id",
        component: () => import("pages/vendor/Customer.vue"),
        props: true
      },
      {
        path: "contracts",
        component: () => import("pages/contract/Contracts.vue"),
        props: true,
        meta: {
          title: "Contracts"
        }
      },
      {
        path: "contracts/:contract_id",
        component: EmptyRouterView,
        props: true,
        children: [
          {
            path: "",
            component: () => import("pages/contract/Contract.vue"),
            props: true,
            alias: "services",
            meta: {
              title: "Contract"
            }
          },
          {
            path: "services/:service_id",
            component: EmptyRouterView,
            props: true,
            children: [
              {
                path: "",
                component: () => import("pages/contract/Service.vue"),
                props: true,
                meta: {
                  title: "Contract Service"
                }
              },
              {
                path: "requests/:request_id",
                component: () => import("pages/contract/Request.vue"),
                props: true,
                meta: {
                  title: "Contract Request"
                }
              }
            ]
          }
        ]
      },
      {
        path: "delivery-management",
        component: () => import("pages/vendor/DeliveryData.vue"),
        props: true,
        meta: {
          title: "Delivery Management"
        }
      },
      
      {
        path: "service-catalogue",
        component: EmptyRouterView,
        meta: {
          title: "Service Catalogue",
          notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
        },
        children: [
          {
            path: "",
            name: "service-catalogue.list",
            component: () => import("pages/common/serviceCatalogue/ServiceCatalogues.vue"),
            props: true,
            meta: {
              title: "Service Catalogue"
            }
          },
          {
            path: "create/:template_id",
            name: "service-catalogue.create",
            component: () => import("pages/common/serviceCatalogue/ServiceCatalogue.vue"),
            props: true,
            meta: {
              title: "Service Catalogue"
            }
          },
          {
            path: "edit/:template_id",
            name: "service-catalogue.edit",
            component: () => import("pages/common/serviceCatalogue/ServiceCatalogue.vue"),
            props: true,
            meta: {
              title: "Service Catalogue"
            }
          },
          {
            path: "view/:template_id",
            name: "service-catalogue.view",
            component: () => import("pages/common/serviceCatalogue/ServiceCatalogue.vue"),
            props: true,
            meta: {
              title: "Service Catalogue"
            }
          }
        ]
      },
      {
        path: "service-management",
        component: EmptyRouterView,
        meta: {
          title: "Service Management"
        },
        children: [
          {
            path: "",
            // name: "service-management",
            component: () => import("src/pages/vendor/dashboards/ServiceManagementDashboard.vue"),
            props: true,
            meta: {
              title: "Service Management"
            }
          },
          {
            path: "active-services",
            // name: "active-services",
            component: () => import("src/pages/common/serviceManagement/ActiveServices.vue"),
            props: true,
            meta: {
              title: "Active Services"
              // notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "active-services/:service_id",
            // name: "active-service-details",
            component: () => import("src/pages/common/serviceManagement/ServiceManager.vue"),
            props: true,
            meta: {
              title: "Active Service"
              // notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "service-approvals",
            // name: "service-approvals",
            component: () => import("src/pages/common/serviceManagement/ServiceApprovals.vue"),
            props: true,
            meta: {
              title: "Service Approval"
              // notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "service-approvals/:service_id",
            // name: "service-approval-details",
            component: () => import("src/pages/common/serviceManagement/ServiceManager.vue"),
            props: true,
            meta: {
              title: "Service Approval"
              // notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "change-requests",
            // name: "change-requests",
            component: () => import("pages/common/changeRequests/ChangeRequests.vue"),
            props: true,
            meta: {
              title: "Change Requests",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "change-requests/:change_request_id",
            // name: "change-request-details",
            component: () => import("pages/common/changeRequests/ChangeRequest.vue"),
            props: true,
            meta: {
              title: "Change Request",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "contract-change-requests",
            // name: "contract-change-requests",
            component: () => import("pages/common/changeRequests/ContractChangeRequests.vue"),
            props: true,
            meta: {
              title: "Contract Change Requests",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "contract-change-requests/:change_request_id",
            // name: "contract-change-request-details",
            component: () => import("pages/common/changeRequests/ContractChangeRequest.vue"),
            props: true,
            meta: {
              title: "Contract Change Request",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "raid",
            // name: "raid-logs",
            component: () => import("pages/common/raidLogs/RaidLogs.vue"),
            props: true,
            meta: {
              title: "__raid__ Logs"
            }
          },
          {
            path: "raid/:raid_log_id",
            // name: "raid-log-details",
            component: () => import("pages/common/raidLogs/RaidLog.vue"),
            props: true,
            meta: {
              title: "__raid__ Log"
            }
          },
          {
            path: "service-requests",
            // name: "service-requests",
            component: () => import("pages/common/serviceRequests/Requests.vue"),
            props: true,
            meta: {
              title: "Service Requests",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "service-alerts",
            // name: "service-alerts",
            component: ServiceAlerts, // issue with lazy load
            props: true,
            meta: {
              title: "Service Alerts",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "service-alerts/:service_alert_id",
            // name: "service-alert-details",
            component: ServiceAlert,
            props: true,
            meta: {
              title: "Service Alert",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "service-alerts/new",
            // name: "new-service-alert",
            component: NewAlert,
            props: true,
            meta: {
              title: "New Service Alert",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          }
        ]
      },
      {
        path: "timesheet-management",
        component: EmptyRouterView,
        meta: {
          title: "Timesheet Management"
        },
        children: [
          {
            path: "",
            // name: "service-management",
            component: () => import("src/pages/vendor/dashboards/TimesheetManagementDashboard.vue"),
            props: true,
            meta: {
              title: "Timesheet Management"
            }
          },
          {
            path: "invoice",
            
            component: () => import("src/pages/common/Invoice.vue"),
            props: true,
            meta: {
              title: "Invoice"
              // notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "active-services",
            // name: "active-services",
            component: () => import("src/pages/common/serviceManagement/ActiveServices.vue"),
            props: true,
            meta: {
              title: "Active Services"
              // notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "active-services/:service_id",
            // name: "active-service-details",
            component: () => import("src/pages/common/serviceManagement/ServiceManager.vue"),
            props: true,
            meta: {
              title: "Active Service"
              // notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "service-approvals",
            // name: "service-approvals",
            component: () => import("src/pages/common/serviceManagement/ServiceApprovals.vue"),
            props: true,
            meta: {
              title: "Service Approval"
              // notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "service-approvals/:service_id",
            // name: "service-approval-details",
            component: () => import("src/pages/common/serviceManagement/ServiceManager.vue"),
            props: true,
            meta: {
              title: "Service Approval"
              // notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "change-requests",
            // name: "change-requests",
            component: () => import("pages/common/changeRequests/ChangeRequests.vue"),
            props: true,
            meta: {
              title: "Change Requests",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "change-requests/:change_request_id",
            // name: "change-request-details",
            component: () => import("pages/common/changeRequests/ChangeRequest.vue"),
            props: true,
            meta: {
              title: "Change Request",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "contract-change-requests",
            // name: "contract-change-requests",
            component: () => import("pages/common/changeRequests/ContractChangeRequests.vue"),
            props: true,
            meta: {
              title: "Contract Change Requests",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "contract-change-requests/:change_request_id",
            // name: "contract-change-request-details",
            component: () => import("pages/common/changeRequests/ContractChangeRequest.vue"),
            props: true,
            meta: {
              title: "Contract Change Request",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "raid",
            // name: "raid-logs",
            component: () => import("pages/common/raidLogs/RaidLogs.vue"),
            props: true,
            meta: {
              title: "__raid__ Logs"
            }
          },
          {
            path: "raid/:raid_log_id",
            // name: "raid-log-details",
            component: () => import("pages/common/raidLogs/RaidLog.vue"),
            props: true,
            meta: {
              title: "__raid__ Log"
            }
          },
          {
            path: "service-requests",
            // name: "service-requests",
            component: () => import("pages/common/serviceRequests/Requests.vue"),
            props: true,
            meta: {
              title: "Service Requests",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "service-alerts",
            // name: "service-alerts",
            component: ServiceAlerts, // issue with lazy load
            props: true,
            meta: {
              title: "Service Alerts",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "service-alerts/:service_alert_id",
            // name: "service-alert-details",
            component: ServiceAlert,
            props: true,
            meta: {
              title: "Service Alert",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "service-alerts/new",
            // name: "new-service-alert",
            component: NewAlert,
            props: true,
            meta: {
              title: "New Service Alert",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          }
        ]
      },
      {
        path: "order-management",
        component: EmptyRouterView,
        meta: {
          title: "Order Management",
          notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
        },
        children: [
          {
            path: "",
            // name: "order-management",
            component: () => import("src/pages/vendor/dashboards/OrderManagementDashboard.vue"),
            props: true,
            meta: {
              title: "Order Management"
            }
          },
          {
            path: "new",
            // name: "new-order-request",
            component: () => import("pages/common/serviceRequests/NewRequest.vue"),
            props: true,
            meta: {
              title: "New Order"
            }
          },
          {
            path: ":customer_request_id",
            // name: "order-request-details",
            component: () => import("pages/common/serviceRequests/Request.vue"),
            props: true,
            meta: {
              title: "Order"
            }
          },
          {
            path: "open",
            // name: "open-order-request",
            component: () => import("pages/common/serviceRequests/Requests.vue"),
            props: true,
            meta: {
              title: "Open Orders"
            }
          },
          {
            path: "dialogue",
            // name: "dialogue-order-requests",
            component: () => import("pages/common/serviceRequests/Requests.vue"),
            props: true,
            meta: {
              title: "Orders In Dialogue"
            }
          },
          {
            path: "accepted",
            // name: "accepted-order-requests",
            component: () => import("pages/common/serviceRequests/Requests.vue"),
            props: true,
            meta: {
              title: "Accepted Orders"
            }
          },
          {
            path: "active",
            // name: "active-order-requests",
            component: () => import("pages/common/serviceRequests/Requests.vue"),
            props: true,
            meta: {
              title: "Active Orders"
            }
          },
          {
            path: "rejected",
            // name: "rejected-order-requests",
            component: () => import("pages/common/serviceRequests/Requests.vue"),
            props: true,
            meta: {
              title: "Rejected Orders"
            }
          },
          {
            path: "archived",
            // name: "archived-order-requests",
            component: () => import("pages/common/serviceRequests/Requests.vue"),
            props: true,
            meta: {
              title: "Archived Orders"
            }
          }
        ]
      },
      {
        path: "financial-management",
        component: EmptyRouterView,
        meta: {
          title: "Financial Management"
        },
        children: [
         
          {
            path: "",
            component: () => import("src/pages/vendor/dashboards/FinancialManagementDashboard.vue"),
            props: true,
            meta: {
              title: "Financial Management"
            }
          },
          {
            path: "management-information",
            component: () => import("pages/vendor/MiDashboard.vue"),
            props: true,
            meta: {
              title: "Management Information"
            }
          },
          
          {
            path: "spend-reports",
            component: () => import("pages/vendor/SpendReports.vue"),
            props: true,
            meta: {
              title: "Spend Reports"
            }
          },
          {
            path: "invoices-list",
            component: () => import("src/pages/common/InvoicesList.vue"),
            props: true,
            meta: {
              title: "Invoices"
            }
          },
          {
            path: "spend-reports/:report_id",
            component: () => import("pages/vendor/SpendReport.vue"),
            props: true,
            meta: {
              title: "Spend Reports"
            }
          },
          {
            path: "purchase-orders",
            component: () => import("pages/common/PurchaseOrders.vue"),
            props: true,
            meta: {
              title: "Purchase Orders"
            }
          },
         
        ]
      },
      {
        path: "documents",
        component: () => import("pages/common/documents/DocumentManagement.vue"),
        meta: {
          accessRequired: [UserAccessTypes.DOCUMENT_MANAGER.value]
        },
        props: true
      }
    ]
  }
]
