<script setup>
import { computed, onMounted } from "vue"
import { useStore } from "vuex"
import { customerAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations } from "src/modules/StaticData.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import DashboardCardList from "src/components/common/DashboardCardList.vue"

const props = defineProps({
  customer_id: { type: String }
})
const store = useStore()
const { customer, isAuthorised } = customerAuth(props.customer_id)

onMounted(() => {
  store.commit("auth/setBadge", "customer")
})

const cards = computed(function() {
  return [
    {
      title: "Create New",
      link: "/customer/" + props.customer_id + "/order-management/new",
      linkText: "GO",
      description: "Create a new order"
    },
    {
      title: "New Orders",
      link: "/customer/" + props.customer_id + "/order-management/open",
      linkText: "View",
      description: "View new orders that have not yet had a Vendor response"
    },
    {
      title: "In Dialogue",
      link: "/customer/" + props.customer_id + "/order-management/dialogue",
      linkText: "View",
      description: "View orders currently in negotiation with the Vendor"
    },
    {
      title: "Active Orders",
      link: "/customer/" + props.customer_id + "/order-management/active",
      linkText: "Manage",
      description: "View orders that have been agreed with the Vendor, but are not as yet deployed"
    },
    {
      title: "Rejected",
      link: "/customer/" + props.customer_id + "/order-management/rejected",
      linkText: "View",
      description: "View orders that have been rejected"
    },
    {
      title: "Archives",
      link: "/customer/" + props.customer_id + "/order-management/archived",
      linkText: "View",
      description: "View an archive of orders that were never deployed"
    }
  ]
})
</script>

<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Order Management</div>
      <template v-if="isAuthorised">
        <BreadCrumb align="center" :organisation="customer" />
        <div class="q-mt-lg">
          <DashboardCardList :cards="cards" />
        </div>
      </template>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>
