<template>
  <q-layout view="hHh LpR fFf" class="swlvd-page-bg">
    <q-header>
      <q-toolbar>
        <q-btn flat round dense @click="miniState = !miniState" icon="menu" class="q-mr-sm" />
        <q-separator dark vertical inset />
        <q-btn stretch flat label="SOWLVED" :to="sowlvedBasePath" size="lg" />
        <q-space />
        <div class="row items-center">
          <q-badge :class="'q-mx-sm '+badge">
            <q-tooltip anchor="bottom middle" class="bg-swlvd-green text-dark">
              Acting as
            </q-tooltip>
            {{ badge }}
          </q-badge>
          <q-separator dark vertical inset class="q-mx-md" />
          <profile-widget
            :badges="badges"
            :full_name="user_name ?? ''"
            :first_name="user.first_name ?? ''"
            :last_name="user.last_name ?? ''" />
        </div>
      </q-toolbar>
    </q-header>
    <q-drawer
      v-model="leftDrawerOpen"
      :width="240"
      show-if-above
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      class="q-pt-md main"
    >
      <q-list>
        <essential-link
          v-for="link in essentialLinks"
          :key="link.title"
          :title="link?.title ?? ''"
          :link="link?.link ?? '#'"
          :icon="link?.icon"
          :caption="link?.caption ?? ''"
        />
      </q-list>
      <transition name="fade">
        <sowlved-owl-wings maxwidth="100%" v-if="!miniState" v-ripple class="absolute-bottom q-px-sm" />
      </transition>
    </q-drawer>

    <q-page-container>
      <router-view v-if="dataReady" />
    </q-page-container>

    <q-dialog v-model="dataCallPopUp">
      <q-card>
        <q-card-section>
          <div class="text-h6">
            {{ dataCallNotice.title }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ dataCallNotice.message }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            label="OK"
            color="primary"
            text-color="dark"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import EssentialLink from "components/EssentialLink.vue"
import ProfileWidget from "components/ProfileWidget.vue"
import SowlvedOwlWings from "src/components/SowlvedOwlWings.vue"

export default defineComponent({
  name: "MainLayout",
  components: {
    EssentialLink,
    ProfileWidget,
    SowlvedOwlWings
  },
  setup() {
    const dataReady = ref(false)
    const dataCallPopUp = ref(false)
    const leftDrawerOpen = ref(false)
    const miniState = ref(true)

    return {
      dataReady,
      dataCallPopUp,
      leftDrawerOpen,
      miniState
    }
  },
  computed: {
    isBuiltEnvironment: function() {
      // return this.$store.getters["admin/getIsBuiltEnvironment"]
      return false
    },
    essentialLinks: function() {
      const links = []
      if (this.is_super_admin) {
        links.push({ title: "Super Admin", icon: "admin_panel_settings", link: "/admin" })
      }
      if (this.is_organisation || this.is_super_admin) {
        links.push({ title: "Main Dashboard", caption: "", icon: "space_dashboard", link: "/" })
      }
      if (this.is_consultant || this.is_super_admin) {
        links.push({
          title: OrganisationTypeMethods.changeConsultant(this.isBuiltEnvironment),
          icon: "dashboard",
          link: "/consultant"
        })
      }
      return links
    },
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    loggedIn: function() {
      return this.$store.getters["auth/getLoggedIn"]
    },
    is_super_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("super_admin") > -1
    },
    is_organisation: function() {
      return this.user &&
        this.user.roles &&
        (
          this.user.roles.indexOf("vendor_admin") > -1 ||
          this.user.roles.indexOf("vendor_user") > -1 ||
          this.user.roles.indexOf("customer_admin") > -1 ||
          this.user.roles.indexOf("customer_user") > -1
        )
    },
    is_consultant: function() {
      return this.user &&
        this.user.roles &&
        this.user.roles.indexOf("consultant") > -1
    },
    sowlvedBasePath: function() {
      return this.is_consultant ? "/consultant" : "/"
    },
    cookieReady: function() {
      return this.$store.getters["auth/getCookie"]
    },
    user_name: function() {
      return this.user.fullName
    },
    badge: function() {
      return this.$store.getters["auth/getBadge"]
    },
    badges: function() {
      return this.$store.getters["auth/getBadges"] ?? []
    },
    dataCallNotice: function() {
      return this.$store.getters["auth/getDataCallObject"]
    }
  },
  watch: {
    cookieReady: function(newVal) {
      if (newVal === true) {
        this.getUser()
      }
    },
    user: function(newVal) {
      if (newVal === false) {
        this.$router.push({ path: "/login", replace: true })
      }
    },
    loggedIn: function(newVal) {
      if (newVal !== true) {
        this.$router.push({ path: "/login", replace: true })
      }
    },
    dataCallPopUp: function(newVal) {
      if (newVal === false) {
        this.$store.dispatch(
          "auth/setDataCallNotice",
          { show: false }
        )
      }
    },
    dataCallNotice: function(newVal) {
      if (newVal.show) {
        this.dataCallPopUp = true
      }
    }
  },
  mounted: function() {
    if (this.cookieReady) {
      this.getUser()
    }
  },
  methods: {
    logout: function() {
      this.$store.dispatch("auth/logout").then(() => {
        this.$router.push({ path: "/login", replace: true })
      }).catch(() => {
        this.$store.dispatch(
          "auth/setDataCallNotice",
          { show: true, title: "Fail to logout", message: "Could not log out" }
        )
      })
    },
    getUser: async function() {
      if (this.user !== false) {
        this.dataReady = true
        return
      }
      this.$store.dispatch("auth/getUser").then(() => {
        this.dataReady = true
      }).catch(() => {
        this.$router.push({ path: "/login", replace: true })
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.super {
  color: white;
  background-color: $negative;
}

.admin {
  color: $dark;
  background-color: $swlvd-green;
}

.consultant {
  color: $dark;
  background-color: $warning;
}

.vendor {
  color: $dark;
  background-color: $swlvd-yellow;
}

.customer {
  color: white;
  background-color: $accent;
}
</style>
