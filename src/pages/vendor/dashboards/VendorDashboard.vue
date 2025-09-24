<script setup>
import { computed, onMounted } from "vue"
import { useStore } from "vuex"
import { vendorAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations, OrganisationType, UserAccessTypes } from "src/modules/StaticData.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import DashboardCardList from "src/components/common/DashboardCardList.vue"

const store = useStore()

const props = defineProps({
  vendor_id: { type: String, default: null }
})

const { vendor, isAuthorised, isAdminAuthorised, hasAccessToDocumentManagement } = vendorAuth(props.vendor_id)

const users = computed(() => store.getters["auth/getUser"])
const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const cards = computed(() => [
  {
    title: "Contract Management",
    link: "/vendor/" + props.vendor_id + "/contracts",
    linkText: "Manage",
    description: "Control and Manage contracts. Document services including Delivery and Commercial models. Define and agree deliverables. ",
    admin: true,
    requiresSubscription: true,
    childItems: [
      { label: "Create and manage contracts", link: false },
      { label: "Service Builder", link: false }
    ]
  },
  {
    title: "Order Management",
    link: "/vendor/" + props.vendor_id + "/order-management",
    linkText: "Manage",
    description: "Workflows to manage order pipeline from request through response and negotiation and into deployment.",
    admin: false,
    notAllowed: [OrganisationType.BUILT_ENVIRONMENT],
    childItems: [
      { label: "Manage Customer Orders", link: "/vendor/" + props.vendor_id + "/order-management/open" },
      { label: "New Customer Orders", link: "/vendor/" + props.vendor_id + "/order-management/new" },
      { label: "Orders In Negotiation", link: "/vendor/" + props.vendor_id + "/order-management/dialogue" },
      { label: "Ready to Deploy", link: "/vendor/" + props.vendor_id + "/order-management/accepted" }
    ]
  },
  {
    title: "Service Catalogue",
    link: "/vendor/" + props.vendor_id + "/service-catalogue",
    linkText: "Manage",
    description: "Browse templates and create new services",
    admin: false,
    requiresSubscription: true,
    has_access: vendor.value.has_service_catalogue ?? false,
    requiredPermission: [UserAccessTypes.SERVICE_CATALOGUE_VIEW.value],
    notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
  },
  {
    title: "Service Management",
    link: "/vendor/" + props.vendor_id + "/service-management",
    linkText: "Manage",
    description: "Structured workflows to proactively manage and mitigate Service Delivery risks.",
    admin: false,
    childItems: [
      { label: "Services Approvals", link: "/vendor/" + props.vendor_id + "/service-management/service-approvals" },
      { label: "Active Services", link: "/vendor/" + props.vendor_id + "/service-management/active-services" },
      { label: "Service Alerts", link: "/vendor/" + props.vendor_id + "/service-management/service-alerts" },
      {
        label: OrganisationTypeMethods.changeRaid(isBuiltEnvironment.value) + " Logs",
        link: "/vendor/" + props.vendor_id + "/service-management/raid"
      },
      { label: "Change Requests", link: "/vendor/" + props.vendor_id + "/service-management/change-requests" },
      {
        label: "Contract Change Requests",
        link: "/vendor/" + props.vendor_id + "/service-management/contract-change-requests"
      }
    ]

  },
  {
    title: "Timesheet Management",
    link: "/vendor/" + props.vendor_id + "/timesheet-management",
    linkText: "Manage",
    description: "Manage self-bill timesheets.",
    admin: false,
    childItems: [
      { label: "Timesheet Approvals", link: "/vendor/" + props.vendor_id + "/timesheet-management/invoice" },
     
    ]
    
  },
  {
    title: "Delivery Management",
    link: "/vendor/" + props.vendor_id + "/delivery-management",
    linkText: "Manage",
    description: "Review and monitor delivery progress on live services in real time. Generate one-click client reports.",
    admin: false,
    childItems: [
      { label: "View Delivery Data", link: false },
      { label: "Generate Delivery Reports", link: false }
    ]
  },
  {
    title: "Financial Management",
    link: "/vendor/" + props.vendor_id + "/financial-management",
    linkText: "Manage",
    description: "Track spend report approvals, monitor PO utilisation and dashboard analytics for portfolio P&L and spend trends.",
    admin: false,
    childItems: [
      {
        label: "View Management Information",
        link: "/vendor/" + props.vendor_id + "/financial-management/management-information"
      },
      { label: "View Delivery Reports", link: "/vendor/" + props.vendor_id + "/financial-management/spend-reports" },
      {
        label: "Purchase Orders",
        link: "/vendor/" + props.vendor_id + "/financial-management/purchase-orders"
      }
    ]
  },
 
 
  {
    title: "User Management",
    link: "/vendor/" + props.vendor_id + "/user-management",
    linkText: "Manage",
    description: "Create, view and manage system users including access right controls.",
    admin: true,
    childItems: [
      {
        label: "Manage your " + OrganisationTypeMethods.changeConsultant(isBuiltEnvironment.value, { isPlural: true }),
        link: "/vendor/" + props.vendor_id + "/user-management/consultants"
      },
      { label: "Manage your Users", link: "/vendor/" + props.vendor_id + "/user-management/access" }
      /* { label: "Manage your Customer", link: "/vendor/" + props.vendor_id + "/user-management/customers" }, */
    ]
  },
  {
    title: "Document Management",
    description: "Save, filter and search documentation for compliance and audit.",
    admin: false,
    // comingSoon: true,
    isShow: hasAccessToDocumentManagement.value,
    link: "/vendor/" + props.vendor_id + "/documents"
  }
])

onMounted(() => {
  store.dispatch("auth/getUser")
  store.commit("auth/setBadge", "vendor")
})
</script>

<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Vendor Area</div>
      <div v-if="isAuthorised && vendor">
        <div class="text-h6 text-center text-white">for {{ vendor.name }}</div>
        <div class="q-mt-lg">
          <DashboardCardList :cards="cards" :is-admin="isAdminAuthorised" :subscribed="vendor.subscribed === 1" :users="users" />
        </div>
        <q-banner
          v-if="!vendor.subscribed"
          class="swlvd-banner"
          inline-actions rounded
        >
          <template v-slot:avatar>
            <q-icon name="info" color="white" />
          </template>
          With a paid subscription your organisation can create and manage contracts.
          <template v-slot:action>
            <q-btn flat href="https://www.sowlved.com/" color="white" label="Find out more" />
          </template>
        </q-banner>
      </div>
      <div v-if="!isAuthorised">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>
