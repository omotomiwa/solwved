<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column row w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xl swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Welcome to SOWLVED</div>
      <div class="text-h6 text-center">
        Logged in as {{ user_name }}
      </div>
      <q-separator class="q-my-md bg-primary" />
      <user-act-as v-if="user?.id" />
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue"
import { ClassCombinations } from "src/modules/StaticData.js"
import UserActAs from "components/common/UserActAs.vue"

export default defineComponent({
  name: "PageIndex",
  components: { UserActAs },
  setup() {
    return {
      ClassCombinations
    }
  },
  computed: {
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    user_name: function() {
      return this.user.first_name + " " + this.user.last_name
    },
    is_consultant: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("consultant") > -1
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
    }
  }
})
</script>

<style scoped>
.q-item.archived {
  opacity: 0.5;
}
</style>
