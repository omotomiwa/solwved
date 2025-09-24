import EmptyRouterView from "components/EmptyRouterView.vue"

export const consultantRoutes = [
  {
    path: "consultant",
    component: EmptyRouterView,
    children: [
      {
        path: "",
        component: () => import("pages/consultant/dashboard/ConsultantDashboard.vue"),
        meta: {
          title: "__consultant__ Dashboard"
        }
      }
    ]
  }
]
