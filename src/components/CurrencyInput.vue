<template>
  <q-input
    ref="inputRef"
    v-model="formattedValue"
    :prefix="currency_symbol"
    type="text"
    :dense="dense"
    outlined
    stack-label
    label-color="white"
    color="primary"
    :label="inputLabel !== '' ? inputLabel : void 0"
    :disable="disable"
    :input-class="inputClass"
    :autofocus="autofocus"
  />
</template>

<script>
import { ref, watch } from "vue"
import { useCurrencyInput } from "vue-currency-input"
import { Config } from "src/modules/StaticData.js"

export default {
  name: "CurrencyInput",
  props: {
    label: { type: String, default: "Value" },
    dense: { type: Boolean, default: false },
    inputClass: { type: String, default: "" },
    disable: { type: Boolean, default: false },
    autofocus: { type: Boolean, default: false },
    prefix: { type: String, default: null },
    locale: { type: String, default: null },
    modelValue: Number,
    options: {
      type: Object,
      default() {
        return {
          currency: Config.CURRENCY_CODE,
          locale: Config.LOCALE,
          currencyDisplay: "hidden",
          hideCurrencySymbolOnFocus: false,
          hideGroupingSeparatorOnFocus: false,
          hideNegligibleDecimalDigitsOnFocus: true,
          useGrouping: true,
          precision: 2,
          valueRange: { min: 0 }
        }
      }
    }
  },
  computed: {
    currency_symbol: function() {
      return this.prefix ?? Config.CURRENCY_SYMBOL
    }
  },
  setup(props) {
    const { inputRef, formattedValue, setOptions, setValue } = useCurrencyInput({
      ...props.options,
      locale: props.locale ?? Config.LOCALE
    })
    const inputLabel = ref(props.label)
    const denseVal = ref(props.dense)

    watch(() => props.modelValue, value => {
      setValue(value)
    })
    watch(() => props.options, options => {
      setOptions(options)
    })

    return {
      inputRef,
      formattedValue,
      inputLabel,
      denseVal
    }
  }
}
</script>
