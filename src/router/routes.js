import MainLayout from "layouts/MainLayout.vue"
import LoginLayout from "layouts/LoginLayout.vue"
import Login from "pages/Login.vue"
import EmptyRouterView from "src/components/EmptyRouterView.vue"
import { adminRoutes } from "./admin"
import { vendorRoutes } from "./vendor"
import { customerRoutes } from "./customer"
import { consultantRoutes } from "./consultant"

const routes = [
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "",
        meta: {
          skipPathSave: true
        },
        component: () => import("pages/Index.vue")
      },
      {
        path: "profile",
        component: EmptyRouterView,
        children: [{ path: "", component: () => import("pages/Profile.vue") }],
        meta: {
          title: "Profile"
        }
      },
      ...adminRoutes,
      ...vendorRoutes,
      ...customerRoutes,
      ...consultantRoutes,
      {
        path: "contracts",
        component: EmptyRouterView,
        children: [
          {
            path: "",
            component: () => import("pages/contract/Contracts.vue"),
            meta: {
              title: "Contracts"
            }
          },
          {
            path: ":contract_id",
            component: () => import("pages/contract/Contract.vue"),
            props: true,
            meta: {
              title: "Contract"
            }
          },
          {
            path: ":contract_id/services/:service_id",
            component: () => import("pages/contract/Service.vue"),
            props: true,
            meta: {
              title: "Contract Service"
            }
          },
          {
            path: ":contract_id/services/:service_id/requests/:request_id",
            component: () => import("pages/contract/Request.vue"),
            props: true,
            meta: {
              title: "Contract Services"
            }
          }
        ]
      },
      {
        path: "delivery-records/:engagement_id",
        component: () => import("src/pages/consultant/DeliveryRecords.vue"),
        props: true,
        meta: {
          title: "Delivery Record"
        }
      },
      {
        path: "timesheet-records/:engagement_id",
        component: () => import("src/pages/consultant/TimesheetRecords.vue"),
        props: true,
        meta: {
          title: "Timesheet Record",
        },
      },
      

      {
        path: "submit-timesheets/:engagement_id",
        component: () => import("src/pages/consultant/SubmitTimesheets.vue"),
        props: true,
        meta: {
          title: "Submit Timesheets",
        },
      },
      {
        path: "delivery-record/:engagement_id/:action/:delivery_record_id?",
        component: () => import("src/pages/consultant/DeliveryRecord.vue"),
        props: true,
        meta: {
          title: "Delivery Record",
        },
      },
      {
        path: "add-record/:engagement_id/:action/:delivery_record_id?",
        component: () => import("pages/consultant/AddRecord.vue"),
        props: true,
        meta: {
          title: "Add Record"
        }
      },
     
    ],
    meta: {
      requiresAuth: true,
      consultant: true
    }
  },
  {
    path: "/access-denied",
    component: MainLayout,
    children: [
      {
        name: "access-denied",
        path: "",
        meta: {
          skipPathSave: true
        },
        component: () => import("pages/AccessDenied.vue")
      }
    ]
  },
  {
    path: "/login",
    component: LoginLayout,
    children: [
      {
        name: "login",
        path: "",
        component: Login,
        meta: {
          title: "Login",
          skipPathSave: true
        }
      },
      {
        path: "forgotten-password",
        component: () => import("pages/ForgottenPassword.vue"),
        meta: {
          title: "Forgotten Password",
          skipPathSave: true
        }
      },
      {
        path: "reset-password/:token",
        component: () => import("pages/ResetPassword.vue"),
        props: true,
        meta: {
          title: "Reset Password",
          skipPathSave: true
        }
      }
    ]
  },
  {
    path: "/:catchAll(.*)*",
    name: "not-found",
    meta: {
      skipPathSave: true
    },
    component: () => import("pages/Error404.vue")
  }
]

export default routes
