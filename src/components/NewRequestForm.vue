<template>
  <div>
    <div class="q-mt-lg">New Request</div>
    <div class="row items-center q-col-gutter-sm">
      <new-selector-form
        v-model:option_id="service_line_id"
        classes="col-xs-12 col-sm-6 col-md-3"
        dense
        :options="service_lines"
        is-filterable
        filter-key="name"
        label="Category"
        default-class="full-width"
      />
      <new-selector-form
        v-model:option_id="service_owner_id"
        classes="col-xs-12 col-sm-6 col-md-3"
        dense
        :options="customer_users"
        is-filterable
        filter-key="name"
        label="Service Owner"
        default-class="full-width"
      />
      <new-selector-form
        v-model:option_id="purchase_order_id"
        classes="col-xs-12 col-sm-6 col-md-3"
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
        label="Budget"
        dense
        :prefix="currency_symbol"
      />
      <q-input
        v-model="units"
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
      <q-input
        v-model="request_date"
        class="col-xs-12 col-sm-6 col-md-3"
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
          <q-icon name="event" class="cursor-pointer">
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
        v-model="start_date"
        class="col-xs-12 col-sm-6 col-md-3"
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
          <q-icon name="event" class="cursor-pointer">
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
        v-model="end_date"
        class="col-xs-12 col-sm-6 col-md-3"
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
          <q-icon name="event" class="cursor-pointer">
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
import { DateTime } from "luxon"
import { Config, RulesRegex } from "src/modules/StaticData.js"
import { DateMethods } from "src/modules/GlobalMethods.js"
import CurrencyInput from "src/components/CurrencyInput.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

export default {
  name: "NewRequestForm",
  components: { CurrencyInput, NewSelectorForm },
  props: {
    service_id: { type: Number, default: 0 },
    service_lines: { type: Array, default: () => [] },
    delivery_model_id: { type: Number, default: 0 },
    financial_model_id: { type: Number, default: 0 },
    purchase_orders: { type: Array, default: () => [] },
    customer_users: { type: Array, default: () => [] },
    vendor_users: { type: Array, default: () => [] }
  },
  emits: ["cancel", "refresh"],
  setup() {
    const input = ref(null)

    return {
      input
    }
  },
  data() {
    return {
      service_line_id: null,
      purchase_order_id: null,
      budget: 0,
      units: 0,
      request_date: DateTime.now().toISODate(),
      start_date: "",
      end_date: "",
      service_requester_id: null,
      service_owner_id: null
    }
  },
  computed: {
    allowSave: function() {
      return this.start_date !== "" &&
        this.end_date !== "" &&
        this.service_line_id !== null &&
        this.purchase_order_id !== null
    },
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    currency_symbol: function() {
      return this.organisation?.currency?.symbol ?? Config.CURRENCY_SYMBOL
    }
  },
  watch: {
    service_name_id: function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.service_line_id = null
      }
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
          method: "post"
        }
        this.$store.dispatch("admin/datacallDt", obj).then(() => {
          this.$emit("refresh")
          this.cancel()
        }).catch(e => {
          alert(e.data.message || e.statusText)
        })
      }
    },
    cancel: function() {
      this.$emit("cancel")
      this.resetForm()
    },
    resetForm: function() {
      this.service_name_id = null
      this.service_line_id = null
      this.purchase_order_id = null
      this.budget = 0
      this.units = 0
      this.request_date = DateTime.now().toISODate()
      this.start_date = ""
      this.end_date = ""
      this.service_requester_id = null
      this.service_owner_id = null
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
