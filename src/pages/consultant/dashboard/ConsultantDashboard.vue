<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xl swlvd-container-bg-light">
      <div class="text-h2 text-weight-bold text-center text-white">
        {{ OrganisationTypeMethods.changeConsultant(isBuiltEnvironment) }} Area
      </div>
      <div v-if="isAuthorised">
        <div v-if="engagements && engagements.length">
          <q-separator class="q-my-md bg-primary" />
          <EngagementsDashboard :engagements="engagements" />
          <q-separator class="q-my-md bg-primary" />
        </div>
        <div class="row col q-col-gutter-md q-mb-xl q-mt-lg" v-if="cards.length > 0">
          <template v-for="(card, index) in cards" :key="index">
            <dashboard-card
              :title="card.title"
              :description="card.description ? card.description : ''"
              :link="card.link"
              :linkText="card.linkText"
              :admin="card.admin"
              :requires-subscription="card.requiresSubscription"
              :comingSoon="!!card.comingSoon"
            >
            </dashboard-card>
          </template>
        </div>
      </div>
      <div v-if="!isAuthorised">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from "vue"
import { useStore } from "vuex"
import { ClassCombinations } from "src/modules/StaticData.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import EngagementsDashboard from "src/components/consultant/EngagementsDashboard.vue"
import DashboardCard from "src/components/common/DashboardCard.vue"

const store = useStore()

const isBuiltEnvironment = computed(() => {
  // return store.getters["admin/getIsBuiltEnvironment"]
  return false
})
const consultant = computed(() => store.getters["auth/getUser"])
const isAuthorised = computed(() => consultant.value && consultant.value.roles && (consultant.value.roles.indexOf("consultant") > -1 || consultant.value.roles.indexOf("super_admin") > -1))
const engagements = computed(() => store.getters["consultant/getEngagements"])

onMounted(() => {
  store.commit(
    "auth/setBadge",
    OrganisationTypeMethods.changeConsultant(
      isBuiltEnvironment.value,
      {
        isCamelCase: false
      }
    )
  )
  if (isAuthorised.value) {
    store.dispatch("consultant/engagements")
  }
})

const cards = computed(function() {
  return [
    {
      title: "Active Engagement",
      link: "/consultant/active-engagement",
      linkText: "Manage",
      description: "Manage active engagement within the system",
      comingSoon: true
    },
    {
      title: "Historic Engagements",
      link: "/consultant/historic-engagements",
      linkText: "Manage",
      description: "Manage historic engagements within the system",
      comingSoon: true
    }
  ]
})
</script>

<style scoped>

</style>
