import EmptyRouterView from "components/EmptyRouterView.vue"

export const adminRoutes = [
  {
    path: "admin",
    component: EmptyRouterView,
    children: [
      {
        path: "",
        component: () => import("pages/admin/dashboards/AdminDashboard.vue"),
        meta: {
          title: "Admin Dashboard"
        }
      },
      {
        path: "organisations",
        component: () => import("pages/admin/Organisations.vue"),
        meta: {
          title: "Admin - Organisations"
        }
      },
      {
        path: "organisation-relationships",
        component: () => import("pages/admin/OrganisationRelationships.vue"),
        meta: {
          title: "Admin - Organisation Relationships"
        }
      },
      {
        path: "organisations/:organisation_id",
        component: () => import("pages/admin/Organisation.vue"),
        props: true,
        meta: {
          title: "Admin - Organisation"
        }
      },
      {
        path: "users",
        component: () => import("pages/admin/Users.vue"),
        meta: {
          title: "Admin - User Management"
        }
      },
      {
        path: "adminusers",
        component: () => import("pages/admin/SuperAdminUsers.vue"),
        meta: {
          title: "Admin - Admin User Management"
        }
      }
    ]
  }
]
