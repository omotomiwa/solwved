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
  store.commit("auth/setBadge", "vendor")
})

const cards = computed(function() {
  return [
    {
      title: "Management Information",
      link: "/customer/" + props.customer_id + "/financial-management/management-information",
      linkText: "GO",
      description: "View and filter your management information"
    },
    {
      title: "Spend Reports",
      link: "/customer/" + props.customer_id + "/financial-management/spend-reports",
      linkText: "View",
      description: "View your Spend Reports"
    },
    {
      title: "Purchase Orders",
      link: "/customer/" + props.customer_id + "/financial-management/purchase-orders",
      linkText: "View",
      description: "View your Purchase Orders"
    },
  
  ]
})
</script>

<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Financial Management</div>
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
