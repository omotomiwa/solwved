<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Access Denied</div>
      <q-separator class="q-my-md bg-primary" />
      <p class="text-center q-mt-lg q-mb-lg">
        <span>{{ authUser?.fullName || "You" }}</span> does not have access to the requested page
      </p>
      <div class="full-width flex justify-center items-center">
        <q-btn
          color="primary"
          label="Go Back"
          outline
          @click="goBack"
        >
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
            Go back to previous page
          </q-tooltip>
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue"
import { ClassCombinations, localStorageKey } from "src/modules/StaticData.js"
import { useLocalStorage } from "src/composables/localStorage.js"

export default defineComponent({
  name: "AccessDenied",
  setup() {
    const { getLocalData } = useLocalStorage()
    return {
      ClassCombinations,

      getLocalData
    }
  },
  computed: {
    authUser: function() {
      return this.$store.getters["auth/getUser"]
    },
    previousPage: function() {
      return this.getLocalData(localStorageKey.PREVIOUS_PAGE)
    },
    previousPageQuery: function() {
      return this.getLocalData(localStorageKey.PREVIOUS_PAGE_QUERY)
    }
  },
  methods: {
    goBack: function() {
      this.$router.push({ path: this.previousPage, query: this.previousPageQuery })
    }
  }
})
</script>
