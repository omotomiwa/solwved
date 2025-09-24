<template>
  <div>
    <div class="row items-center q-col-gutter-sm">
      <new-selector-form
        v-model:option_id="service_line_id"
        classes="col-xs-12 col-sm-6 col-md-3"
        :disabled="!isEditingRequest"
        dense
        :options="service_lines"
        is-filterable
        filter-key="name"
        label="Category"
        default-class="full-width"
      />

      <new-selector-form
        v-model:option_id="delivery_model_id"
        classes="col-xs-12 col-sm-6 col-md-3"
        :disabled="true"
        dense
        :options="delivery_models"
        is-filterable
        filter-key="name"
        label="Delivery Model"
        default-class="full-width"
      />

      <new-selector-form
        v-model:option_id="financial_model_id"
        classes="col-xs-12 col-sm-6 col-md-3"
        :disabled="true"
        dense
        :options="financial_models"
        is-filterable
        filter-key="name"
        label="Financial Model"
        default-class="full-width"
      />

      <new-selector-form
        v-model:option_id="purchase_order_id"
        classes="col-xs-12 col-sm-6 col-md-3"
        :disabled="!isEditingRequest"
        dense
        :options="purchase_orders"
        is-filterable
        filter-key="reference"
        option-label="reference"
        label="Purchase Order"
        default-class="full-width"
      />

      <currency-input
        v-model="budget"
        class="col-xs-6 col-sm-3 col-md-2"
        :disable="!isEditingRequest"
        label="Budget"
        :prefix="currency_symbol"
        dense
      />

      <!--
      <q-select class="col-xs-12 col-sm-6 col-md-3" :disable="true"   borderless outlined dense v-model="delivery_model_id" :options="delivery_models" option-value="id" emit-value map-options option-label="name" options-dense label="Delivery Model" stack-label label-color="white" />
      <q-select class="col-xs-12 col-sm-6 col-md-3" :disable="true"   borderless outlined dense v-model="financial_model_id" :options="financial_models" option-value="id" emit-value map-options option-label="name" options-dense label="Financial Model" stack-label label-color="white" />
      -->
      <new-selector-form
        classes="col-xs-12 col-sm-6 col-md-3"
        :disabled="!isEditingRequest"
        dense
        v-model:option_id="purchase_order_id"
        :options="purchase_orders"
        is-filterable
        filter-key="reference"
        option-label="reference"
        label="Purchase Order"
        default-class="full-width"
      />

      <currency-input
        class="col-xs-6 col-sm-3 col-md-2"
        v-model="budget"
        :prefix="currency_symbol"
        :disable="!isEditingRequest"
        label="Budget"
        dense
      />

      <q-input
        class="col-xs-6 col-sm-3 col-md-1"
        :disable="!isEditingRequest"
        v-model="units"
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

      <q-input
        class="col-xs-12 col-sm-6 col-md-3"
        :disable="!isEditingRequest"
        v-model="request_date"
        dense
        outlined
        type="text"
        label="Request Date"
        :mask="Config.DATE_MASK"
        hide-bottom-space
        stack-label
        :rules="[checkDate]"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer" v-if="isEditingRequest">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date
                first-day-of-week="1"
                v-model="request_date"
                text-color="dark"
                :mask="Config.DATE_FORMAT_DMY"
                today-btn
                no-unset
              >
                <div class="row items-center justify-end">
                  <q-btn
                    v-close-popup
                    label="Close"
                    color="primary"
                    text-color="dark"
                    flat
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
        class="col-xs-12 col-sm-6 col-md-3"
        :disable="!isEditingRequest"
        v-model="start_date"
        dense
        outlined
        type="text"
        label="Start Date"
        :mask="Config.DATE_MASK"
        hide-bottom-space
        stack-label
        :rules="[checkDate]"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer" v-if="isEditingRequest">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date
                first-day-of-week="1"
                v-model="start_date"
                text-color="dark"
                :mask="Config.DATE_FORMAT_DMY"
                today-btn
                no-unset
              >
                <div class="row items-center justify-end">
                  <q-btn
                    v-close-popup
                    label="Close"
                    color="primary"
                    text-color="dark"
                    flat
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
        class="col-xs-12 col-sm-6 col-md-3"
        :disable="!isEditingRequest"
        v-model="end_date"
        dense
        outlined
        type="text"
        label="End Date"
        :mask="Config.DATE_MASK"
        hide-bottom-space
        stack-label
        :rules="[checkDate]"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer" v-if="isEditingRequest">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date
                first-day-of-week="1"
                v-model="end_date"
                text-color="dark"
                :mask="Config.DATE_FORMAT_DMY"
                today-btn
                no-unset
              >
                <div class="row items-center justify-end">
                  <q-btn
                    v-close-popup
                    label="Close"
                    color="primary"
                    text-color="dark"
                    flat
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <div v-if="editable" class="col-xs-12 col-sm-6 col-md-3">
        <q-btn
          v-if="!isEditingRequest"
          label="Edit"
          color="positive"
          size="md"
          @click="isEditingRequest = true"
        >
        </q-btn>
        <q-btn
          v-if="isEditingRequest"
          label="Save"
          color="positive"
          size="md"
          @click="saveRequest"
          :disable="!allowSave"
        />
        <q-btn
          v-if="isEditingRequest"
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
import { Config, RulesRegex } from "src/modules/StaticData.js"
import { DateMethods } from "src/modules/GlobalMethods.js"
import CurrencyInput from "src/components/CurrencyInput.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

export default {
  name: "EditRequestForm",
  components: { CurrencyInput, NewSelectorForm },
  props: {
    request: { type: Object, default: () => ({}) },
    service_id: { type: Number, default: 0 },
    service_lines: { type: Array, default: () => [] },
    delivery_models: { type: Array, default: () => [] },
    financial_models: { type: Array, default: () => [] },
    purchase_orders: { type: Array, default: () => [] },
    customer_users: { type: Array, default: () => [] },
    vendor_users: { type: Array, default: () => [] },
    editable: { type: Boolean, default: false }
  },
  emits: ["refresh"],
  setup() {
    const input = ref(null)

    return {
      input,

      Config
    }
  },
  data() {
    return {
      id: this.request.id,
      service_line_id: this.request.service_line_id,
      delivery_model_id: this.request.delivery_model_id,
      financial_model_id: this.request.financial_model_id,
      purchase_order_id: this.request.purchase_order_id,
      budget: parseFloat(this.request.budget),
      units: this.request.units,
      request_date: this.request.request_date,
      start_date: this.request.start_date,
      end_date: this.request.end_date,
      service_requester_id: this.request.service_requester_id,
      service_owner_id: this.request.service_owner_id,
      isEditingRequest: false
    }
  },
  computed: {
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    currency_symbol: function() {
      return this.organisation?.currency?.symbol ?? Config.CURRENCY_SYMBOL
    },
    allowSave: function() {
      return this.start_date !== "" &&
        this.end_date !== "" &&
        this.service_name_id !== null &&
        this.service_line_id !== null &&
        this.delivery_model_id !== null &&
        this.financial_model_id !== null &&
        this.purchase_order_id !== null
    }
  },
  watch: {
    service_name_id: function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.service_line_id = null
      }
    },
    request: function() {
      this.resetForm()
    }
  },
  methods: {
    saveRequest: function() {
      if (this.allowSave) {
        const obj = {
          data: {
            service_id: this.service_id,
            service_name_id: this.service_name_id,
            service_line_id: this.service_line_id,
            delivery_model_id: this.delivery_model_id,
            financial_model_id: this.financial_model_id,
            purchase_order_id: this.purchase_order_id,
            budget: this.budget,
            units: this.units,
            request_date: this.request_date,
            start_date: this.start_date,
            end_date: this.end_date,
            service_requester_id: this.service_requester_id,
            service_owner_id: this.service_owner_id
          },
          call: "requests",
          method: "patch",
          id: this.request.id
        }
        this.$store.dispatch("admin/datacallDt", obj).then(() => {
          // call service update
          this.$emit("refresh")
          this.isEditingRequest = false
        }).catch(e => {
          alert(e.data.message || e.statusText)
        })
      }
    },
    cancel: function() {
      this.isEditingRequest = false
      this.resetForm()
    },
    resetForm: function() {
      this.service_name_id = this.request.service_name_id
      this.service_line_id = this.request.service_line_id
      this.delivery_model_id = this.request.delivery_model_id
      this.financial_model_id = this.request.financial_model_id
      this.purchase_order_id = this.request.purchase_order_id
      this.budget = parseFloat(this.request.budget)
      this.units = this.request.units
      this.request_date = this.request.request_date
      this.start_date = this.request.start_date
      this.end_date = this.request.end_date
      this.service_requester_id = this.request.service_requester_id
      this.service_owner_id = this.request.service_owner_id
    },
    checkDate: function(val) {
      if ((val ?? "").trim().length > 0 && !RulesRegex.date.test(DateMethods.convertDateFormat(val))) {
        return "Please enter the valid date"
      }
      return true
    }
  }
}
</script>
