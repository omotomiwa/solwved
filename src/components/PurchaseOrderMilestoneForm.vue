<template>
  <div class="row items-center q-gutter-xs">
    <q-input
      v-model="modelObj.reference"
      label="Reference"
      class="col"
      dense
      outlined
      stack-label
      label-color="white"
      color="primary"
      type="text"
      autofocus
    />
    <q-input
      v-model="modelObj.start_date"
      class="col"
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
          <q-popup-proxy
            cover
            transition-show="scale"
            transition-hide="scale"
            ref="startDatePopup"
          >
            <q-date
              first-day-of-week="1"
              v-model="modelObj.start_date"
              text-color="dark"
              :mask="Config.DATE_FORMAT_DMY"
              today-btn
              no-unset
              @update:model-value="closeStartDatePopup"
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
      v-model="modelObj.end_date"
      class="col"
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
          <q-popup-proxy
            cover
            transition-show="scale"
            transition-hide="scale"
            ref="endDatePopup"
          >
            <q-date
              first-day-of-week="1"
              v-model="modelObj.end_date"
              text-color="dark"
              :mask="Config.DATE_FORMAT_DMY"
              today-btn
              no-unset
              @update:model-value="closeEndDatePopup"
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
    <currency-input
      :model-value="parseFloat(modelObj.amount ?? 0)"
      label="Amount"
      dense
      :prefix="currency_symbol"
      @update:model-value="value => onAmountUpdate(value)"
    />
    <q-btn class="col-auto q-px-md q-ml-md" label="Delete" dense color="negative" size="sm" @click="$emit('delete')" />
  </div>
</template>

<script>
import { computed, defineComponent, ref } from "vue"
import { Config, RulesRegex } from "src/modules/StaticData.js"
import { DateMethods } from "src/modules/GlobalMethods.js"
import CurrencyInput from "src/components/CurrencyInput.vue"

export default defineComponent({
  name: "PurchaseOrderMilestoneForm",
  components: { CurrencyInput },
  props: {
    modelValue: {
      type: Object,
      default: () => {
        return {
          start_date: null,
          end_date: null
        }
      }
    }
  },
  emits: ["update:modelValue", "delete"],
  setup(props, { emit }) {
    const startDatePopup = ref(null)
    const endDatePopup = ref(null)

    const modelObj = computed({
      // Use computed to wrap the object
      get: () => props.modelValue,
      set: value => emit("update:modelValue", value)
    })

    const onAmountUpdate = value => {
      modelObj.value.amount = value
    }
    const closeStartDatePopup = () => {
      startDatePopup.value.hide()
    }
    const closeEndDatePopup = () => {
      endDatePopup.value.hide()
    }

    return {
      startDatePopup,
      endDatePopup,

      modelObj,

      onAmountUpdate,
      closeStartDatePopup,
      closeEndDatePopup,

      Config
    }
  },
  data() {
    return {
      optionId: 0
    }
  },
  computed: {
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    currency_symbol: function() {
      return this.organisation?.currency?.symbol ?? Config.CURRENCY_SYMBOL
    }
  },
  methods: {
    checkDate: function(val) {
      if ((val ?? "").trim().length > 0 && !RulesRegex.date.test(DateMethods.convertDateFormat(val))) {
        return "Please enter the valid date"
      }
      return true
    }
  }
})
</script>
