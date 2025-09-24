<template>
  <div :class="divClasses">
    <q-select
      label-color="white"
      color="primary"
      type="text"
      input-debounce="0"
      map-options
      options-dense
      :label="(label ?? '').trim().length > 0 ? label : undefined"
      :model-value="option_id"
      :options="optionList"
      :option-value="optionValKey"
      :emit-value="isEmitValue"
      :use-input="isFilterable"
      :option-label="optionLabel"
      :class="defaultClass"
      :dense="dense"
      :multiple="multiple"
      :borderless="isBorderLess"
      :outlined="!isBorderLess"
      :stack-label="(label ?? '').trim().length > 0"
      :disable="disabled"
      :clearable="isClearable"
      :options-selected-class="optionsSelectedClass"
      :filled="filled"
      :readonly="readonly"
      :bg-color="bgColor"
      :hide-bottom-space="hideBottomSpace"
      :hide-selected="hideSelected"
      :use-chips="useChips"
      :autofocus="autofocus"
      @filter="filterFn"
      @update:model-value="emitChange"
      dark
    >
   
      <!-- Default slot for no option -->
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-italic text-grey"> {{ noOptionLabel }}</q-item-section>
        </q-item>
      </template>

      <!-- Customizable slot for option -->
      <template v-slot:option="slotProps" v-if="isOptionCustomisable">
        <slot name="option" :option="slotProps.opt" :events="slotProps.itemProps" />
      </template>

      <template v-slot:selected-item="slotProps" v-if="isSelectedOptionCustomisable">
        <slot name="selected-item" :option="slotProps.opt" :events="slotProps.itemProps" />
      </template>

      <template v-slot:after-options>
        <slot name="after-options" />
      </template>

      <template v-slot:after>
        <slot name="after" />
      </template>
    </q-select>
  </div>
</template>

<script>
import { ref } from "vue"

export default {
  name: "NewSelectorForm",
  props: {
    options: { type: Array, default: () => [] },
    label: { type: String, default: "Option" },
    optionLabel: { type: String, default: "name" },
    optionValKey: { type: String, default: "id" },
    isEmitValue: { type: Boolean, default: true },
    noOptionLabel: { type: String, default: "No options available" },
    option_id: { default: null },
    dense: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    classes: { type: String },
    isFilterable: { type: Boolean, default: false },
    filterKey: { type: String, default: "" },
    isClearable: { type: Boolean, default: false },
    isBorderLess: { type: Boolean, default: false },
    defaultClass: { type: String, default: "col-auto" },
    isOptionCustomisable: { type: Boolean, default: false },
    isSelectedOptionCustomisable: { type: Boolean, default: false },
    optionsSelectedClass: { type: String, default: "" },
    filled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    bgColor: { type: String, default: undefined },
    hideBottomSpace: { type: Boolean, default: false },
    hideSelected: { type: Boolean, default: false },
    useChips: { type: Boolean, default: false },
    autofocus: { type: Boolean, default: false }
  },
  emits: ["update:option_id", "valChange"],
  setup() {
    const input = ref(null)
    const filterStr = ref("")

    return {
      input,
      filterStr
    }
  },
  computed: {
    divClasses() {
      return this.classes || "row"
    },
    optionList() {
      return this.filterStr.length === 0 ? (this.options ?? []) : (this.options ?? []).filter(val => {
        return (
          this.filterKey ?
            (val[this.filterKey] || "").toString().toLowerCase().indexOf(this.filterStr) :
            val.toString().toLowerCase().indexOf(this.filterStr)
        ) > -1
      })
    }
  },
  methods: {
    filterFn(val, update, abort) {
      update(() => {
        this.filterStr = val.toLowerCase().trim()
      })
    },
    emitChange(val) {
      this.$emit("update:option_id", val)
      this.$emit("valChange", val)
    }
  }
}
</script>

<style lang="scss">
.q-select.q-field--focused.w-content .q-field__control-container .q-field__input--padding {
  display: block !important;
}

.q-select.w-content .q-field__control-container .q-field__input--padding {
  display: none !important;
}
</style>
