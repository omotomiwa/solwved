<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-narrow q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xl swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Organisations</div>
      <div v-if="is_super_admin" class="text-h6 text-center">
        <router-link class="breadcrum" to="/admin">Super Admin Dashboard</router-link>
        <span> / Organisations</span>
      </div>
      <div v-if="is_super_admin" class="q-mt-lg">
        <list-editor
          :data="organisations"
          data-call="organisations"
          edit-action="event"
          @list-update="refreshList"
          @edit-item="onEditItem"
        />
      </div>
      <div v-else class="q-my-lg">
        You are not authorised to view this page
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue"
import { ClassCombinations } from "src/modules/StaticData.js"
import ListEditor from "src/components/ListEditor.vue"

export default defineComponent({
  name: "Organisations",
  components: { ListEditor },
  setup() {
    const saveDataResponse = ref()
    const saveDataHeader = ref("")
    const saveDataMessage = ref("")
    const saveError = ref(false)

    return {
      saveDataResponse,
      saveDataHeader,
      saveDataMessage,
      saveError,

      ClassCombinations
    }
  },
  computed: {
    currencies: function() {
      return this.$store.getters["common/getCurrencies"]
    },
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    is_super_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("super_admin") > -1
    },
    organisations: function() {
      return this.$store.getters["admin/getOrganisations"]
    }
  },
  mounted() {
    this.getCurrencies()
    if (this.is_super_admin) {
      this.getOrganisations(true)
    }
  },
  methods: {
    getCurrencies: function() {
      this.$store.dispatch("common/getCurrencies")
    },
    refreshList: function() {
      this.getOrganisations(true)
    },
    getOrganisations: function(force) {
      if (this.organisations.length < 1 || force) {
        const obj = { call: "organisations", method: "get" }
        this.$store.dispatch("admin/datacallDt", obj)
      }
    },
    onEditItem: function(item) {
      this.$router.push({ path: "/admin/organisations/" + item.id })
    }
  }
})
</script>
