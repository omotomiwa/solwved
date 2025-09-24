<script setup>
import { computed, onMounted } from "vue"
import { useStore } from "vuex"
import { customerAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations, OrganisationType } from "src/modules/StaticData.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import DashboardCardList from "src/components/common/DashboardCardList.vue"

const store = useStore()

const props = defineProps({
  customer_id: { type: String, default: null }
})

let { customer, isAuthorised, isAdminAuthorised, hasAccessToDocumentManagement } = customerAuth(props.customer_id)

onMounted(() => {
  store.commit("auth/setBadge", "customer")
})

const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const cards = computed(() => [
  {
    title: "Contract Management",
    link: "/customer/" + props.customer_id + "/contracts",
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
    link: "/customer/" + props.customer_id + "/order-management",
    linkText: "Manage",
    description: "Workflows to manage order pipeline from request through response and negotiation and into deployment.",
    admin: false,
    notAllowed: [OrganisationType.BUILT_ENVIRONMENT],
    childItems: [
      { label: "Create new order", link: "/customer/" + props.customer_id + "/order-management/new" },
      { label: "Open Orders", link: "/customer/" + props.customer_id + "/order-management/open" },
      { label: "Orders In Negotiation", link: "/customer/" + props.customer_id + "/order-management/dialogue" },
      { label: "Active Orders", link: "/customer/" + props.customer_id + "/order-management/active" },
      { label: "Archived", link: "/customer/" + props.customer_id + "/order-management/archived" }
    ]
  },
  {
    title: "Service Management",
    link: "/customer/" + props.customer_id + "/service-management",
    linkText: "Manage",
    description: "Structured workflows to proactively manage and mitigate Service Delivery risks.",
    admin: false,
    childItems: [
      { label: "Services Approvals", link: "/customer/" + props.customer_id + "/service-management/service-approvals" },
      { label: "Active Services", link: "/customer/" + props.customer_id + "/service-management/active-services" },
      { label: "Service Alerts", link: "/customer/" + props.customer_id + "/service-management/service-alerts" },
      {
        label: OrganisationTypeMethods.changeRaid(isBuiltEnvironment.value) + " Logs",
        link: "/customer/" + props.customer_id + "/service-management/raid"
      },
      { label: "Change Requests", link: "/customer/" + props.customer_id + "/service-management/change-requests" },
      {
        label: "Contract Change Requests",
        link: "/customer/" + props.customer_id + "/service-management/contract-change-requests"
      }
    ]
  },
  {
    title: "Financial Management",
    link: "/customer/" + props.customer_id + "/financial-management",
    linkText: "Manage",
    description: "Track spend report approvals, monitor PO utilisation and dashboard analytics for portfolio P&L and spend trends.",
    admin: false,
    childItems: [
      {
        label: "View Management Information",
        link: "/customer/" + props.customer_id + "/financial-management/management-information"
      },
      { label: "View Spend Reports", link: "/customer/" + props.customer_id + "/financial-management/spend-reports" },
      { label: "Purchase Orders", link: "/customer/" + props.customer_id + "/financial-management/purchase-orders" }
    ]
  },
  {
    title: "User Management",
    link: "/customer/" + props.customer_id + "/user-management/access",
    linkText: "Go",
    description: "Create, view and manage system users including access right controls.",
    admin: true
    /*
    childItems: [
      { label: "Manage your Users", link: "/customer/" + props.customer_id + "/user-management/access" },
      { label: "Manage your Vendors", link: "/customer/" + props.customer_id + "/user-management/vendors" },
    ],*/
  },
  {
    title: "Document Management",
    description: "Save, filter and search documentation for compliance and audit.",
    admin: false,
    comingSoon: true
    // isShow: hasAccessToDocumentManagement.value,
    // link: "/customer/" + props.customer_id + "/documents"
  }
])
</script>

<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Buyer Area</div>
      <div v-if="isAuthorised && customer">
        <div class="text-h6 text-center text-white">for {{ customer?.name }}</div>
        <div class="q-mt-lg">
          <DashboardCardList :cards="cards" :is-admin="isAdminAuthorised" :subscribed="customer.subscribed === 1" />
        </div>
        <q-banner inline-actions rounded class="swlvd-banner" v-if="!customer?.subscribed">
          <template v-slot:avatar>
            <q-icon name="info" color="white" />
          </template>
          With a paid subscription your organisation can create and manage contracts.
          <template v-slot:action>
            <q-btn flat href="https://www.sowlved.com/" color="white" label="Find out more" />
          </template>
        </q-banner>
      </div>
      <div v-else>You are not authorised to view this page</div>
    </div>
  </q-page>
</template>
