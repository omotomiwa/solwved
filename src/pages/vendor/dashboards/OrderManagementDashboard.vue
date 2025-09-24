<script setup>
import { computed, onMounted } from "vue"
import { useStore } from "vuex"
import { vendorAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations } from "src/modules/StaticData.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import DashboardCardList from "src/components/common/DashboardCardList.vue"

const props = defineProps({
  vendor_id: { type: String }
})
const store = useStore()
const { vendor, isAuthorised } = vendorAuth(props.vendor_id)

onMounted(() => {
  store.commit("auth/setBadge", "vendor")
})

const cards = computed(function() {
  return [
    {
      title: "Create New",
      link: "/vendor/" + props.vendor_id + "/order-management/new",
      linkText: "GO",
      description: "Create a new order on behalf of a customer"
    },
    {
      title: "New Orders",
      link: "/vendor/" + props.vendor_id + "/order-management/open",
      linkText: "View",
      description: "View new Customer orders"
    },
    {
      title: "In Dialogue",
      link: "/vendor/" + props.vendor_id + "/order-management/dialogue",
      linkText: "View",
      description: "View Customer orders currently in negotiation"
    },
    {
      title: "Ready to Deploy",
      link: "/vendor/" + props.vendor_id + "/order-management/accepted",
      linkText: "Manage",
      description: "View and deploy fully accepted orders"
    },
    {
      title: "Deployed / Active Orders",
      link: "/vendor/" + props.vendor_id + "/order-management/active",
      linkText: "Manage",
      description: "Read only view of deployed orders"
    },
    {
      title: "Rejected",
      link: "/vendor/" + props.vendor_id + "/order-management/rejected",
      linkText: "View",
      description: "View orders that have been rejected"
    },
    {
      title: "Archives",
      link: "/vendor/" + props.vendor_id + "/order-management/archived",
      linkText: "View",
      description: "View archive of Customer orders that were never deployed"
    }
  ]
})
</script>

<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Order Management</div>
      <template v-if="isAuthorised">
        <BreadCrumb align="center" :organisation="vendor" />
        <div class="q-mt-lg">
          <DashboardCardList :cards="cards" />
        </div>
        <div class="row q-mt-lg" />
      </template>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>
