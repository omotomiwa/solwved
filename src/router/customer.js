import { OrganisationType, UserAccessTypes } from "src/modules/StaticData.js"
import EmptyRouterView from "components/EmptyRouterView.vue"

export const customerRoutes = [
  {
    path: "customer/:customer_id",
    component: EmptyRouterView,
    props: true,
    children: [
      {
        path: "",
        component: () => import("src/pages/customer/dashboards/CustomerDashboard.vue"),
        props: true,
        meta: {
          title: "Customer Dashboard"
        }
      },
      {
        path: "user-management",
        component: () => import("pages/customer/dashboards/UserManagementDashboard.vue"),
        props: true
      },
      {
        path: "user-management/access",
        component: () => import("pages/common/Access.vue"),
        props: true
      },
      {
        path: "user-management/vendors",
        component: () => import("pages/customer/Vendors.vue"),
        props: true
      },
      {
        path: "user-management/vendor/:vendor_id",
        component: () => import("pages/customer/CustomerVendorContracts.vue"),
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
              }
            ]
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
            component: () => import("src/pages/customer/dashboards/ServiceManagementDashboard.vue"),
            props: true,
            meta: {
              title: "Service Management"
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
            // name: "raid-logs-details",
            component: () => import("pages/common/raidLogs/RaidLog.vue"),
            props: true,
            meta: {
              title: "__raid__ Log"
            }
          },
          {
            path: "active-services",
            // name: "active-services",
            component: () => import("src/pages/common/serviceManagement/ActiveServices.vue"),
            props: true,
            meta: {
              title: "Active Services",
              // notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "active-services/:service_id",
            // name: "active-services-details",
            component: () => import("src/pages/common/serviceManagement/ServiceManager.vue"),
            props: true,
            meta: {
              title: "Active Service",
              // notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "service-approvals",
            // name: "service-approvals",
            component: () => import("src/pages/common/serviceManagement/ServiceApprovals.vue"),
            props: true,
            meta: {
              title: "Service Approval",
              // notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
           {
        path: "timesheets-list",
        component: () => import("src/pages/common/InvoicesList.vue"),
        props: true,
        meta: {
          title: "Invoices"
        }
      },
          {
            path: "service-approvals/:service_id",
            // name: "service-approvals-details",
            component: () => import("src/pages/common/serviceManagement/ServiceManager.vue"),
            props: true,
            meta: {
              title: "Service Approval",
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
            // name: "change-requests-details",
            component: () => import("pages/common/changeRequests/ChangeRequest.vue"),
            props: true,
            meta: {
              title: "Change Request",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "contract-change-requests",
            // name: "contract-change-requests-details",
            component: () => import("pages/common/changeRequests/ContractChangeRequests.vue"),
            props: true,
            meta: {
              title: "Contract Change Requests",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "contract-change-requests/:change_request_id",
            // name: "contract-change-requests-details",
            component: () => import("pages/common/changeRequests/ContractChangeRequest.vue"),
            props: true,
            meta: {
              title: "Contract Change Request",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "service-alerts",
            // name: "service-alerts",
            component: () => import("pages/common/serviceAlerts/ServiceAlerts.vue"),
            props: true,
            meta: {
              title: "Service Alerts",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "service-alerts/new",
            // name: "new-service-alert",
            component: () => import("pages/common/serviceAlerts/NewAlert.vue"),
            props: true,
            meta: {
              title: "Service Alert",
              notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
            }
          },
          {
            path: "service-alerts/:service_alert_id",
            // name: "service-alerts-details",
            component: () => import("pages/common/serviceAlerts/ServiceAlert.vue"),
            props: true,
            notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
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
            component: () => import("src/pages/customer/dashboards/OrderManagementDashboard.vue"),
            props: true,
            meta: {
              title: "Order Management"
            }
          },
          {
            path: ":customer_request_id",
            // name: "order-request",
            component: () => import("pages/common/serviceRequests/Request.vue"),
            props: true,
            meta: {
              title: "Service Request"
            }
          },
          {
            path: "service-requests/open",
            // name: "open-service-request",
            component: () => import("pages/common/serviceRequests/Requests.vue"),
            props: true,
            meta: {
              title: "Open Service Requests"
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
            // name: "dialogue-order-request",
            component: () => import("pages/common/serviceRequests/Requests.vue"),
            props: true,
            meta: {
              title: "Orders In Dialogue"
            }
          },
          {
            path: "active",
            // name: "active-order-request",
            component: () => import("pages/common/serviceRequests/Requests.vue"),
            props: true,
            meta: {
              title: "Active Orders"
            }
          },
          {
            path: "rejected",
            // name: "rejected-order-request",
            component: () => import("pages/common/serviceRequests/Requests.vue"),
            props: true,
            meta: {
              title: "Rejected Orders"
            }
          },
          {
            path: "archived",
            // name: "archived-order-request",
            component: () => import("pages/common/serviceRequests/Requests.vue"),
            props: true,
            meta: {
              title: "Archived Orders"
            }
          }
        ]
      },
      {
        path: "financial-management/purchase-orders",
        component: () => import("pages/common/PurchaseOrders.vue"),
        props: true,
        meta: {
          title: "Purchase Orders"
        }
      },
     
      {
        path: "financial-management",
        component: () => import("src/pages/customer/dashboards/FinancialManagementDashboard.vue"),
        props: true,
        meta: {
          title: "Financial Management"
        }
      },
      {
        path: "financial-management/spend-reports",
        component: () => import("pages/customer/SpendReports.vue"),
        props: true,
        meta: {
          title: "Spend Reports"
        }
      },
    
      {
        path: "financial-management/spend-reports/:report_id",
        component: () => import("pages/customer/SpendReport.vue"),
        props: true,
        meta: {
          title: "Spend Reports"
        }
      },
      {
        path: "financial-management/management-information",
        component: () => import("pages/customer/MiDashboard.vue"),
        props: true,
        meta: {
          title: "Management Information"
        }
      },
      // {
      //   path: "documents",
      //   component: () => import("pages/common/documents/DocumentManagement.vue"),
      //   meta:{
      //     accessRequired: [UserAccessTypes.DOCUMENT_MANAGER.value]
      //   },
      //   props: true
      // }
    ]
  }
]
