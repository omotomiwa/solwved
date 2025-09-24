<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <page-header title="Super Admin Management" :breadcrumbs="breadcrumbs" />
      <div v-if="is_super_admin" class="q-mt-lg">
        <div class="text-h5 q-mb-md">
          List of users with Super Admin access
        </div>
        <user-access-widget
          :users="users"
          :current_user="user"
          delete-label="Revoke Access"
          @deleteUser="deleteUser"
          @createUser="createUser"
        />
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue"
import { ClassCombinations } from "src/modules/StaticData.js"
import UserAccessWidget from "components/UserAccessWidget.vue"
import PageHeader from "components/common/PageHeader.vue"

export default defineComponent({
  name: "SuperAdminUsers",
  components: { UserAccessWidget, PageHeader },
  props: ["vendor_id"],
  setup() {
    return {
      ClassCombinations
    }
  },
  computed: {
    breadcrumbs: function() {
      let breadcrumbList = []

      if (this.is_super_admin) {
        breadcrumbList.push({ route: "/admin", name: "Super Admin Dashboard" })
        breadcrumbList.push({ route: "", name: "Super Admin Access" })
      }

      return breadcrumbList
    },
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    is_super_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("super_admin") > -1
    },
    users: function() {
      let c = this.$store.getters["admin/getAdminUsers"]
      c = JSON.parse(JSON.stringify(c))
      if (Array.isArray(c) && c.length > 0) {
        c.sort((a, b) => (a.last_name > b.last_name) ? 1 : ((b.last_name > a.last_name) ? -1 : 0))
      }
      return c
    }
  },
  mounted() {
    this.$store.commit("auth/setBadge", "super")
    if (this.is_super_admin) {
      this.getAdminUsers()
    }
  },
  methods: {
    getAdminUsers: function(force) {
      if (this.users.length < 1 || force) {
        const obj = { call: "adminusers", method: "get" }
        this.$store.dispatch("admin/datacallDt", obj)
      }
    },
    createUser: function(newUserData) {
      const userData = {}
      for (const key in newUserData) {
        if (Object.hasOwnProperty.call(newUserData, key)) {
          userData[key] = newUserData[key].trim()
        }
      }
      const obj = { data: userData, call: "adminusers", method: "post" }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        this.getAdminUsers(true) // get updated list
      }).catch(e => {
        if (e.response && e.response.data && e.response.data.error) {
          this.$store.dispatch(
            "auth/setDataCallNotice",
            { show: true, title: "Data call error", message: e.response.data.error }
          )
        } else {
          this.$store.dispatch(
            "auth/setDataCallNotice",
            { show: true, title: "Data call error", message: e }
          )
        }
      })
    },
    deleteUser: function(customerUserId) {
      const obj = { id: customerUserId, call: "adminusers", method: "delete" }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        // call service update
        this.getAdminUsers(true)
      }).catch(e => {
        if (e.response && e.response.data && e.response.data.error) {
          this.$store.dispatch(
            "auth/setDataCallNotice",
            { show: true, title: "Data call error", message: e.response.data.error }
          )
        } else {
          this.$store.dispatch(
            "auth/setDataCallNotice",
            { show: true, title: "Data call error", message: e }
          )
        }
      })
    }
  }
})
</script>
