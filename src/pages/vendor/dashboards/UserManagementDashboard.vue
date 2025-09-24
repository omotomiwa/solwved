<script setup>
import { computed, onMounted } from "vue"
import { useStore } from "vuex"
import { vendorAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations } from "src/modules/StaticData.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import DashboardCardList from "src/components/common/DashboardCardList.vue"

const props = defineProps({
  vendor_id: { type: String, default: null }
})
const store = useStore()
const { vendor, isAuthorised } = vendorAuth(props.vendor_id)

onMounted(() => {
  store.commit("auth/setBadge", "vendor")
})

const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const cards = computed(function() {
  return [
    {
      title: OrganisationTypeMethods.changeConsultant(
        isBuiltEnvironment.value,
        { isPlural: true }
      ),
      link: "/vendor/" + props.vendor_id + "/user-management/consultants",
      linkText: "Manage",
      description: "View and manage your " + OrganisationTypeMethods.changeConsultant(
        isBuiltEnvironment.value,
        { isPlural: true, isCamelCase: false }
      )
    },
    {
      title: "Users",
      link: "/vendor/" + props.vendor_id + "/user-management/access",
      linkText: "Manage",
      description: "View and manage your users"
    }
    /*{
      title: 'Customers',
      link: '/vendor/' + props.vendor_id + '/user-management/customers',
      linkText: 'Manage',
      description: 'View and manage service alerts'
    }
    */
  ]
})
</script>

<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Service Management</div>
      <template v-if="isAuthorised">
        <BreadCrumb align="center" :organisation="vendor" />
        <div class="q-mt-lg">
          <dashboard-card-list :cards="cards" />
        </div>
      </template>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>
