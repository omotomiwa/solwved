<script setup>
import { computed, onMounted } from "vue"
import { useStore } from "vuex"
import { vendorAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations, OrganisationType } from "src/modules/StaticData.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import DashboardCardList from "src/components/common/DashboardCardList.vue"

const store = useStore()

const props = defineProps({
  vendor_id: { type: String, default: null }
})

const { vendor, isAuthorised } = vendorAuth(props.vendor_id)

const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const managementCards = computed(function() {
  return [
    {
      title: "Service Approvals",
      link: "/vendor/" + props.vendor_id + "/service-management/service-approvals",
      linkText: "Manage",
      description: "View and manage service approvals"
      // notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
    },
    {
      title: "Active Services",
      link: "/vendor/" + props.vendor_id + "/service-management/active-services",
      linkText: "Manage",
      description: "View and manage your Active Services"
      // notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
    },
    {
      title: "Service Alerts",
      link: "/vendor/" + props.vendor_id + "/service-management/service-alerts",
      linkText: "Manage",
      description: "View and manage service alerts",
      notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
    },
    {
      title: OrganisationTypeMethods.changeRaid(isBuiltEnvironment.value) + " Logs",
      link: "/vendor/" + props.vendor_id + "/service-management/raid",
      linkText: "Manage",
      description: "Create and manage " + OrganisationTypeMethods.changeRaid(isBuiltEnvironment.value) + " Logs"
    },
    {
      title: "Change Requests",
      link: "/vendor/" + props.vendor_id + "/service-management/change-requests",
      linkText: "Manage",
      description: "View and manage requests for changes to Services",
      notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
    },
    {
      title: "Contract Change Request",
      link: "/vendor/" + props.vendor_id + "/service-management/contract-change-requests",
      linkText: "Manage",
      description: "View and manage requests for changes to Contracts",
      notAllowed: [OrganisationType.BUILT_ENVIRONMENT]
    }
  ]
})

onMounted(() => {
  store.commit("auth/setBadge", "vendor")
})
</script>

<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Service Management</div>
      <template v-if="isAuthorised">
        <BreadCrumb align="center" :organisation="vendor" />
        <div class="q-mt-lg">
          <DashboardCardList :cards="managementCards" />
        </div>
      </template>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>
