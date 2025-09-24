<template>
  <q-page class="flex justify-center items-start bg-grey-2">
    <div class="column w-standard">
      <h1>Coming Soon</h1>
      <p>This feature is coming soon</p>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue"

export default defineComponent({
  name: "ComingSoon",
  computed: {
    authUser: function() {
      return this.$store.getters["auth/getAuthUser"]
    }
  }
})
</script>
