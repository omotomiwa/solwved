<template>
  <q-form @submit="saveService" class="row q-mt-sm items-center q-col-gutter-sm">
    <q-input
      v-model="name"
      class="col-xs-12 col-sm-4 col-md-3"
      outlined
      stack-label
      label-color="white"
      color="primary"
      type="text"
      label="Name"
      autofocus
    />
    <q-input
      v-model="lot"
      class="col-xs-12 col-sm-2 col-md-3"
      outlined
      stack-label
      label-color="white"
      color="primary"
      type="text"
      label="Lot"
      placeholder="n/a"
    />
    <new-selector-form
      v-model:option_id="delivery_model_id"
      :options="available_delivery_models"
      label="Delivery Model"
      classes="col-xs-12 col-sm-6 col-md-3"
      is-filterable
      filter-key="name"
    />
    <new-selector-form
      v-model:option_id="financial_model_id"
      :options="available_financial_models"
      label="Financial Model"
      classes="col-xs-12 col-sm-6 col-md-3"
      is-filterable
      filter-key="name"
    />
    <new-selector-form
      v-model:option_id="service_template_id"
      :options="serviceTemplates"
      no-option-label="No templates available"
      label="Service Template"
      classes="col-xs-12 col-sm-6 col-md-3"
      is-filterable
      filter-key="name"
    >
      <template #after-options>
        <q-item>
          <MailToButton />
        </q-item>
      </template>
    </new-selector-form>
    <currency-input
      v-model="value"
      class="col-xs-12 col-sm-2 col-md-2"
      label="Value"
      :prefix="currency_symbol"
      @update:model-value="checkValue"
    />
    <q-input
      v-model="start_date"
      class="col-xs-12 col-sm-2 col-md-2"
      outlined
      type="text"
      label="Start Date"
      :mask="Config.DATE_MASK"
      hide-bottom-space
      stack-label
      :rules="[checkDate]"
      @update:model-value="checkStartDate"
    >
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy
            cover
            transition-show="scale"
            transition-hide="scale"
            ref="startDatePopup"
          >
            <q-date
              first-day-of-week="1"
              v-model="start_date"
              text-color="dark"
              :mask="Config.DATE_FORMAT_DMY"
              today-btn
              no-unset
              @update:model-value="checkStartDate"
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
      class="col-xs-12 col-sm-2 col-md-2"
      outlined
      type="text"
      label="End Date"
      :mask="Config.DATE_MASK"
      hide-bottom-space
      stack-label
      :rules="[checkDate]"
      @update:model-value="checkEndDate"
    >
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy
            cover
            transition-show="scale"
            transition-hide="scale"
            ref="endDatePopup"
          >
            <q-date
              first-day-of-week="1"
              v-model="end_date"
              text-color="dark"
              :mask="Config.DATE_FORMAT_DMY"
              today-btn
              no-unset
              @update:model-value="checkEndDate"
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

    <div class="q-px-lg">
      <q-btn
        label="Save"
        :disable="!allowSave"
        color="primary"
        text-color="dark"
        size="md"
        type="submit"
      />
      <q-btn
        label="Cancel"
        color="white"
        outline
        size="md"
        class="q-ml-sm" @click="cancel"
      />
    </div>
  </q-form>
  <q-dialog v-model="dialog">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ dialogTitle }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        {{ dialogMessage }}
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from "vue"
import { CurrencyMethods, DateMethods } from "src/modules/GlobalMethods.js"
import { Config, RulesRegex } from "src/modules/StaticData.js"
import CurrencyInput from "src/components/CurrencyInput.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"
import MailToButton from "src/components/common/MailToButton.vue"

export default {
  name: "NewServiceForm",
  components: { CurrencyInput, NewSelectorForm, MailToButton },
  props: {
    organisationId: { type: Number },
    contract_id: { type: Number, default: 0 },
    contract: { type: Object }
  },
  emits: ["cancel", "refresh"],
  setup() {
    const input = ref(null)
    const dialog = ref(false)

    const startDatePopup = ref(null)
    const endDatePopup = ref(null)

    const closeStartDatePopup = () => {
      startDatePopup.value.hide()
    }
    const closeEndDatePopup = () => {
      endDatePopup.value.hide()
    }

    return {
      input,
      dialog,
      startDatePopup,
      endDatePopup,

      closeStartDatePopup,
      closeEndDatePopup,

      Config
    }
  },
  data() {
    return {
      name: "",
      lot: "",
      value: 0,
      start_date: this.contract.start_date,
      end_date: this.contract.end_date,
      delivery_model_id: 1,
      financial_model_id: 1,
      service_template_id: null,
      dialogMessage: "",
      dialogTitle: "",
      serviceTemplates: []
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
      return this.name.trim() !== "" && this.value > 0 && this.start_date !== "" && this.end_date !== ""
    },
    available_delivery_models: function() {
      return this.$store.getters["admin/getDeliveryModels"]
    },
    available_financial_models: function() {
      return this.$store.getters["admin/getFinancialModels"]
    },
    remainingContractBudget: function() {
      let subTotal = 0
      if (Array.isArray(this.contract.services) && this.contract.services.length) {
        for (let index = 0; index < this.contract.services.length; index++) {
          const service = this.contract.services[index]
          subTotal += parseInt(service.value)
        }
      }
      let remainingBudget = this.contract.value - subTotal
      if (remainingBudget < 0) {
        remainingBudget = 0
      }
      return remainingBudget
    }
  },
  watch: {
    contract: function(newVal) {
      this.start_date = newVal.start_date
      this.end_date = newVal.end_date
    }
  },
  mounted() {
    this.getDeliveryModels()
    this.getFinancialModels()
    this.getServiceTemplates()
  },
  methods: {
    saveService: function() {
      if (this.allowSave) {
        const obj = {
          data: {
            contract_id: this.contract_id,
            name: this.name,
            lot: this.lot,
            value: this.value,
            start_date: this.start_date,
            end_date: this.end_date,
            delivery_model_id: this.delivery_model_id,
            financial_model_id: this.financial_model_id,
            service_template_id: this.service_template_id
          },
          call: "services",
          method: "post"
        }
        this.$store.dispatch("admin/datacallDt", obj).then(() => {
          // call service update
          this.$emit("refresh")
          this.cancel()
        }).catch(e => {
          alert(e.data.message || e.statusText)
        })
      }
    },
    getDeliveryModels: function(force) {
      if (this.available_delivery_models.length < 1 || force) {
        const obj = {
          data: this.newItem,
          call: "deliverymodels",
          method: "get"
        }
        this.$store.dispatch("admin/datacallDt", obj)
      }
    },
    getFinancialModels: function(force) {
      if (this.available_financial_models.length < 1 || force) {
        const obj = {
          data: this.newItem,
          call: "financialmodels",
          method: "get"
        }
        this.$store.dispatch("admin/datacallDt", obj)
      }
    },
    getServiceTemplates: function() {
      this.$store.dispatch("contract/getServiceTemplates", this.organisationId).then(response => {
        if (response.data && response.data.length) {
          this.serviceTemplates = [{ id: null, name: "None" }]
          this.serviceTemplates.push(...response.data)
        } else {
          this.serviceTemplates = []
        }
      })
    },
    checkDate: function(val) {
      if ((val ?? "").trim().length > 0 && !RulesRegex.date.test(DateMethods.convertDateFormat(val))) {
        return "Please enter the valid date"
      }
      return true
    },
    checkStartDate: function(date) {
      this.closeStartDatePopup()
      const selectedDate = new Date(DateMethods.convertDateFormat(date)).getTime()
      const contractStartDate = new Date(DateMethods.convertDateFormat(this.contract.start_date)).getTime()
      const contractEndDate = new Date(DateMethods.convertDateFormat(this.contract.end_date)).getTime()

      if (selectedDate < contractStartDate) {
        this.dialogTitle = "Date outside range"
        this.dialogMessage = "You cannot set a service start date earlier than the contract start date"
        this.dialog = true
        this.start_date = this.contract.start_date
      } else if (selectedDate > contractEndDate) {
        this.dialogTitle = "Date outside range"
        this.dialogMessage = "You cannot set a service start date later than the contract end date"
        this.dialog = true
        this.start_date = this.contract.start_date
      }
    },
    checkEndDate: function(date) {
      this.closeEndDatePopup()
      const selectedDate = new Date(DateMethods.convertDateFormat(date)).getTime()
      const contractStartDate = new Date(DateMethods.convertDateFormat(this.contract.start_date)).getTime()
      const contractEndDate = new Date(DateMethods.convertDateFormat(this.contract.end_date)).getTime()

      if (selectedDate > contractEndDate) {
        this.dialogTitle = "Date outside range"
        this.dialogMessage = "You cannot set a service end date later than the contract end date"
        this.dialog = true
        this.end_date = this.contract.end_date
      } else if (selectedDate < contractStartDate) {
        this.dialogTitle = "Date outside range"
        this.dialogMessage = "You cannot set a service end date earlier than the contract start date"
        this.dialog = true
        this.end_date = this.contract.end_date
      }
    },
    checkValue: async function(v) {
      if (v > this.remainingContractBudget) {
        const self = this
        setTimeout(() => {
          self.value = self.remainingContractBudget
        }, 50)
        this.dialogTitle = "Contract Budget Warning"
        this.dialogMessage =
          "Setting a service budget of " +
          CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.value) +
          " will result in a breach of the total contract budget. The maximum you can assign is " +
          CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.remainingContractBudget)
        this.dialog = true
      }
    },
    cancel: function() {
      this.$emit("cancel")
      this.resetForm()
    },
    resetForm: function() {
      this.name = ""
      this.lot = ""
      this.value = 0
      this.start_date = this.contract.start_date
      this.end_date = this.contract.end_date
    }
  }
}
</script>
