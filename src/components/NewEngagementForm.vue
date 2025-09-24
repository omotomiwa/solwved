<template>
  <div>
    <div class="q-mt-lg">
      New Engagement
    </div>
    <div class="row items-center q-col-gutter-sm">
      <new-selector-form
        v-model:option_id="localData.consultant_id"
        classes="col-xs-12 col-sm-6 col-md-4"
        dense
        :options="consultants"
        is-filterable
        filter-key="name"
        :label="OrganisationTypeMethods.changeConsultant(isBuiltEnvironment)"
        default-class="full-width"
      />
      <new-selector-form
        v-model:option_id="localData.request_capability_id"
        classes="col-xs-12 col-sm-6 col-md-4"
        dense
        :options="request_capabilities"
        is-filterable
        filter-key="name"
        option-val-key="value"
        label="Capability"
        default-class="full-width"
      />
      <new-selector-form
        v-model:option_id="localData.competency_id"
        classes="col-xs-12 col-sm-6 col-md-4"
        dense
        :options="competencies"
        is-filterable
        filter-key="name"
        label="Competency"
        default-class="full-width"
      />
      <!--      <q-select class="col-xs-12 col-sm-6 col-md-3"   borderless outlined dense v-model="localData.project_ids" :options="projects" option-value="id" multiple emit-value map-options option-label="name" options-dense label="Projects" stack-label label-color="white" />-->
      <currency-input
        v-model="localData.charge_rate"
        class="col-xs-6 col-sm-3 col-md-2"
        label="Charge Rate"
        :prefix="currency_symbol"
        dense
      />
      <currency-input
        v-model="localData.pay_rate"
        class="col-xs-6 col-sm-3 col-md-2"
        label="Pay Rate"
        :prefix="currency_symbol"
        dense
      />
      <currency-input
        v-model="localData.budget"
        class="col-xs-6 col-sm-3 col-md-2"
        label="Budget"
        :prefix="currency_symbol"
        dense
      />
      <q-input
        v-model="localData.units"
        class="col-xs-6 col-sm-3 col-md-1"
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
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-btn
          label="Save"
          color="positive"
          size="md"
          :disable="!allowSave"
          @click="saveRequest"
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
  name: "NewEngagementForm",
  components: { NewSelectorForm, CurrencyInput },
  props: {
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
        request_id: this.request_id,
        consultant_id: null,
        request_capability_id: null,
        competency_id: null,
        project_ids: [],
        charge_rate: 0,
        pay_rate: 0,
        budget: 0,
        units: 0
      }
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
      return this.consultant_id !== null && this.request_capability_id !== null && this.competency_id !== null
    }
  },
  methods: {
    saveRequest: function() {
      if (this.allowSave) {
        const obj = {
          data: this.localData,
          vendorID: this.vendor_id,
          method: "post"
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
        request_id: this.request_id,
        consultant_id: null,
        request_capability_id: null,
        competency_id: null,
        project_ids: [],
        charge_rate: 0,
        pay_rate: 0,
        budget: 0,
        units: 0
      }
    }
  }
}
</script>
