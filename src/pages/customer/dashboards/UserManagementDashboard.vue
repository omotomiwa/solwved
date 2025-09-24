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
      title: "Manage Users",
      link: "/customer/" + props.customer_id + "/user-management/access",
      linkText: "GO",
      description: "Manage your organisation's users and user access levels"
    }
    /*,
    {
      title: "Manage Vendors",
      link: "/customer/" + props.customer_id + "/user-management/vendors",
      linkText: "View",
      description: "View and manage your vendors",
    },*/
  ]
})
</script>

<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">User Management</div>
      <template v-if="isAuthorised">
        <BreadCrumb align="center" :organisation="customer" />
        <div class="q-mt-lg">
          <dashboard-card-list :cards="cards" />
        </div>
      </template>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>
