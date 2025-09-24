<script setup>
import { computed, onMounted } from "vue"
import { useStore } from "vuex"
import { ClassCombinations } from "src/modules/StaticData.js"
import DashboardCardList from "src/components/common/DashboardCardList.vue"

// const props = defineProps({})
const store = useStore()

const user = computed(() => store.getters["auth/getUser"])
const isSuperAdmin = computed(() => {
  return !!(user.value && user.value.roles && user.value.roles.indexOf("super_admin") > -1)
})

onMounted(() => {
  store.commit("auth/setBadge", "admin")
})

const cards = computed(function() {
  return [
    {
      title: "Organisations",
      link: "/admin/organisations",
      linkText: "Manage",
      description: "Create and manage Organisation within the system"
    },
    {
      title: "Organisation Relationships",
      link: "/admin/organisation-relationships",
      linkText: "Manage",
      description: "Create links between organisations so that they can create contracts with one another"
    },
    {
      title: "Users",
      link: "/admin/users",
      linkText: "Manage",
      description: "Create and manage Users within the system"
    },
    {
      title: "Super Admin Users",
      link: "/admin/adminusers",
      linkText: "Manage",
      description: "Create and manage users with super admin access"
    }
  ]
})
</script>

<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Super Admin Area</div>
      <template v-if="isSuperAdmin">
        <q-banner rounded class="bg-negative q-mt-md" dense>
          <template v-slot:avatar>
            <q-icon name="info" color="white" />
          </template>
          This area is restricted to users with Super Admin access
        </q-banner>
        <div class="q-mt-lg">
          <DashboardCardList :cards="cards" :is-admin="true" />
        </div>
      </template>
      <div v-else>
        <q-banner rounded class="bg-negative q-mt-md" dense>
          <template v-slot:avatar>
            <q-icon name="warning" color="white" />
          </template>
          You are not authorised to view this page
        </q-banner>
      </div>
    </div>
  </q-page>
</template>
