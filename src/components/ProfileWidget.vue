<template>
  <q-btn flat round dense>
    <q-avatar color="primary" text-color="dark">{{ initials }}</q-avatar>
    <q-menu class="q-pa-md"
            style="min-width: 200px"
            transition-show="jump-down"
            transition-hide="jump-up"
            :offset="[2, 8]">
      <q-list style="min-width: 100px">
        <q-item>
          <q-item-section>{{ full_name }}</q-item-section>
        </q-item>
        <q-separator class="q-mb-xs" />
        <div class="text-center">
          <q-badge v-for="badge in badges" :key="badge" size="sm" :class="'q-ml-xs '+badge">
            {{ badge }}
          </q-badge>
          <q-tooltip anchor="bottom middle" class="bg-swlvd-green text-dark">
            Your role{{ badges.length > 0 ? "s" : "" }}
          </q-tooltip>
        </div>
        <q-separator class="q-mt-xs" />
        <q-item clickable to="/profile" class="text-white">
          <q-item-section avatar>
            <q-icon color="primary" name="contact_mail" />
          </q-item-section>
          <q-item-section>Edit Profile</q-item-section>
        </q-item>
        <q-item clickable @click="logout">
          <q-item-section avatar>
            <q-icon color="primary" name="logout" />
          </q-item-section>
          <q-item-section>Logout</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script>
export default {
  name: "ProfileWidget",
  props: {
    full_name: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    badges: { type: Array, required: true, default: () => [] }
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
  },
  computed: {
    initials: function() {
      if (this.first_name && this.last_name) {
        return this.first_name.charAt(0) + this.last_name.charAt(0)
      } else {
        return ""
      }
    }
  }
}
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
