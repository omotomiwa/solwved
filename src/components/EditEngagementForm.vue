<template>
  <div class="q-pa-lg bg-white">
    <div class="q-mb-sm">
      Edit Engagement
    </div>
    <div class="row items-center q-col-gutter-sm">
      <new-selector-form
        v-model:option_id="localData.consultant_id"
        classes="col-xs-12 col-sm-6"
        dense
        :options="consultants_with_existing"
        is-filterable
        filter-key="name"
        :label="OrganisationTypeMethods.changeConsultant(isBuiltEnvironment)"
        default-class="full-width"
      />
      <new-selector-form
        v-model:option_id="localData.request_capability_id"
        classes="col-xs-12 col-sm-6"
        dense
        :options="request_capabilities"
        is-filterable
        filter-key="name"
        label="Capability"
        default-class="full-width"
      />
      <new-selector-form
        v-model:option_id="localData.competency_id"
        classes="col-xs-12 col-sm-6"
        dense
        :options="competencies"
        is-filterable
        filter-key="name"
        label="Competency"
        default-class="full-width"
      />
      <new-selector-form
        v-model:option_id="localData.project_ids"
        classes="col-xs-12 col-sm-6"
        dense
        :options="projects"
        multiple
        is-filterable
        filter-key="name"
        label="Projects"
        default-class="full-width"
      />
      <currency-input
        label="Charge Rate"
        v-model="localData.charge_rate"
        class="col-xs-6 col-sm-6"
        :prefix="currency_symbol"
        dense
      />
      <currency-input
        label="Pay Rate"
        v-model="localData.pay_rate"
        class="col-xs-6 col-sm-6"
        :prefix="currency_symbol"
        dense
      />
      <currency-input
        label="Budget"
        v-model="localData.budget"
        class="col-xs-6 col-sm-6"
        :prefix="currency_symbol"
        dense
      />
      <q-input
        v-model="localData.units"
        class="col-xs-6 col-sm-6"
        unmasked-value
        dense
        reverse-fill-mask
        outlined
        stack-label
        label-color="white"
        bg-color="grey-3"
        type="text"
        label="Units"
      />
      <new-selector-form
        v-model:option_id="localData.status_id"
        classes="col-xs-12 col-sm-6"
        dense
        :options="status_options"
        is-filterable
        filter-key="label"
        option-label="label"
        label="Status"
        default-class="full-width"
      />
      <div class="col-xs-12 col-sm-6">
        <q-btn
          label="Save"
          color="positive"
          size="md"
          :disable="!allowSave"
          @click="saveEngagement"
        />
        <q-btn
          class="q-ml-sm"
          label="Delete"
          color="negative"
          size="md"
          @click="deleteEngagement"
        />
        <q-btn
          class="q-ml-sm"
          label="Cancel"
          color="primary"
          text-color="dark"
          size="md"
          @click="cancel"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue"
import { Config } from "src/modules/StaticData.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import NewSelectorForm from "components/NewSelectorForm.vue"
import CurrencyInput from "components/CurrencyInput.vue"

export default {
  name: "EditEngagementForm",
  components: { NewSelectorForm, CurrencyInput },
  props: {
    engagement: { type: Object, default: () => ({}) },
    vendor_id: { type: Number, default: 0 },
    request_id: { type: Number, default: 0 },
    consultants: { type: Array, default: () => [] },
    request_capabilities: { type: Array, default: () => [] },
    competencies: { type: Array, default: () => [] },
    projects: { type: Array, default: () => [] }
  },
  emits: ["cancel", "refresh"],
  setup() {
    const input = ref(null)

    return {
      input,

      OrganisationTypeMethods
    }
  },
  data() {
    return {
      localData: {
        id: this.engagement.id,
        request_id: this.engagement.request_id,
        consultant_id: this.engagement.consultant_id,
        request_capability_id: this.engagement.request_capability_id,
        competency_id: this.engagement.competency_id,
        project_ids: [],
        charge_rate: parseInt(this.engagement.charge_rate),
        pay_rate: parseInt(this.engagement.pay_rate),
        budget: parseInt(this.engagement.budget),
        units: this.engagement.units,
        status_id: parseInt(this.engagement.status_id)
      },
      status_options: [
        { id: 1, label: "Active" },
        { id: 2, label: "Paused" },
        { id: 3, label: "Archived" }
      ]
    }
  },
  computed: {
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    isBuiltEnvironment: function() {
      return this.$store.getters["admin/getIsBuiltEnvironment"]
    },
    currency_symbol: function() {
      return this.organisation?.currency?.symbol ?? Config.CURRENCY_SYMBOL
    },
    allowSave: function() {
      return this.localData.consultant_id !== null && this.localData.request_capability_id !== null && this.localData.competency_id !== null
    },
    consultants_with_existing: function() {
      const c = JSON.parse(JSON.stringify(this.consultants)) // decouple from bound model
      // now add the existing consultant
      const name = this.engagement.consultant.user.first_name + " " + this.engagement.consultant.user.last_name
      const obj = { id: this.engagement.consultant.id, name: name }
      c.push(obj)
      return c
    }
  },
  watch: {
    engagement: function(newVal) {
      this.localData.project_ids = []
      if (newVal.projects && newVal.projects.length) {
        for (let index = 0; index < newVal.projects.length; index++) {
          const p = newVal.projects[index]
          this.localData.project_ids.push(p.project_id)
        }
      }
    }
  },
  mounted() {
    this.localData.project_ids = []
    if (this.engagement.projects && this.engagement.projects.length) {
      for (let index = 0; index < this.engagement.projects.length; index++) {
        const p = this.engagement.projects[index]
        this.localData.project_ids.push(p.project_id)
      }
    }
  },
  methods: {
    saveEngagement: function() {
      if (this.allowSave) {
        const obj = {
          data: this.localData,
          vendorID: this.vendor_id,
          method: "patch",
          id: this.engagement.id
        }
        this.$store.dispatch("vendor/consultantEngagement", obj).then(() => {
          // call service update
          this.$emit("refresh")
          this.cancel()
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
    },
    deleteEngagement: function() {
      if (this.allowSave) {
        const obj = {
          id: this.engagement.id,
          vendorID: this.vendor_id,
          method: "delete"
        }
        this.$store.dispatch("vendor/consultantEngagement", obj).then(() => {
          // call service update
          this.$emit("refresh")
          this.cancel()
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
    },
    cancel: function() {
      this.$emit("cancel")
      this.resetForm()
    },
    resetForm: function() {
      this.localData = {
        id: this.engagement.id,
        request_id: this.engagement.request_id,
        consultant_id: this.engagement.consultant_id,
        request_capability_id: this.engagement.request_capability_id,
        competency_id: this.engagement.competency_id,
        project_ids: [],
        charge_rate: parseInt(this.engagement.charge_rate),
        pay_rate: parseInt(this.engagement.pay_rate),
        budget: parseInt(this.engagement.budget),
        units: this.engagement.units,
        status_id: this.engagement.status_id
      }
    }
  }
}
</script>
