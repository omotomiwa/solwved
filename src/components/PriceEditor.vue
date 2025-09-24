<template>
  <div class="row items-center">
    <div
      v-show="!isEditing"
      :class="'col-auto ' + textColour ? 'text-' + textColour :''"
    >
      {{ price_label }}
    </div>
    <div
      v-if="editable"
      class="row items-center"
    >
      <currency-input
        v-show="isEditing"
        :model-value="numeric_price"
        class="col-auto"
        label="Override value"
        :prefix="currency_symbol"
        dense
        @update:model-value="value => $emit('update:price', value)"
      />
      <q-btn
        class="col-auto q-ml-sm"
        color="primary"
        outline
        icon="edit"
        size="sm"
        padding="xs md"
        :label="isEditing? 'update':'override'"
        @click="isEditing=!isEditing"
      />
      <div
        v-show="modified && !isEditing"
        class="row items-center"
      >
        <q-btn
          icon="warning"
          size="sm"
          class="q-ml-sm"
          color="negative"
          label="Reset"
          @click="$emit('update:price', originalPrice)"
        >
          <q-tooltip
            transition-show="scale"
            transition-hide="scale"
            anchor="bottom middle"
            :offset="[10, 10]"
            class="bg-negative"
            dense
          >
            <div class="row items-center">
              <q-icon
                name="warning"
                style="font-size: 3rem;"
                class="col-auto q-mr-xs"
              />
              <div
                class="col-auto"
                style="font-size:0.9rem;"
              >
                This charge has been manually overridden.<br>Click to reset it to the original value<br>calculated from
                the delivery records
              </div>
            </div>
          </q-tooltip>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { CurrencyMethods } from "src/modules/GlobalMethods.js"
import { Config } from "src/modules/StaticData.js"
import CurrencyInput from "src/components/CurrencyInput.vue"

export default {
  name: "PriceEditor",
  components: { CurrencyInput },
  props: {
    price: { type: String },
    originalPrice: { type: String },
    label: { type: String, default: "Period Charge" },
    editable: { type: Boolean, default: false },
    textColour: { type: String }
  },
  emits: ["update:price"],
  data() {
    return {
      isEditing: false
    }
  },
  computed: {
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    currency_symbol: function() {
      return this.organisation?.currency?.symbol ?? Config.CURRENCY_SYMBOL
    },
    price_label: function() {
      if (this.price !== undefined) {
        return CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.price)
      }
      return "Calculating..."
    },
    numeric_price: function() {
      return parseInt(this.price)
    },
    numeric_original_price: function() {
      return parseInt(this.originalPrice)
    },
    modified: function() {
      return this.numeric_price !== this.numeric_original_price
    }
  }
}
</script>
