<template>
  <q-td v-for="col in localValues" :key="col.name" :class="col.__thClass">
    <q-input
      v-if="isEditing && col.name === 'units'"
      v-model="assignmentValues[col.name]"
      type="number"
      outlined
      dense
      input-class=""
      label-color="white"
      color="primary"
      class="condensed-padding"
      autofocus
    />
    <template v-if="displayReadOnlyLabel(col.name)">
      <span v-if="col.name === 'budget'">{{ calculatedBudget }}</span>
      <span v-else-if="col.name === 'remaining_units'" :class="col.value < 0 ? 'text-negative text-weight-bold' : ''">
        {{ col.value }}
      </span>
      <template v-else-if="col.name === 'actions'">
        <div class="no-wrap flex justify-end q-gutter-xs">
          <q-icon
            v-if="!isEditing"
            class="cursor-pointer"
            name="edit_note"
            color="primary"
            size="sm"
            @click="isEditing = true"
          />
          <q-icon
            v-if="!isEditing"
            class="cursor-pointer"
            name="delete"
            color="negative"
            size="sm"
            @click="onRemoveClicked"
          />
          <q-btn
            v-if="isEditing"
            icon="save"
            color="primary"
            text-color="dark"
            size="xs"
            padding="xs sm"
            @click="onSaveClicked"
          >
            <q-tooltip class="bg-primary text-dark">
              Save
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="isEditing"
            class="q-ml-sm"
            icon="cancel"
            color="white"
            outline
            size="xs"
            padding="xs sm"
            @click="cancelChanges"
          >
            <q-tooltip class="bg-primary text-dark">
              Cancel
            </q-tooltip>
          </q-btn>
        </div>
      </template>
      <span v-else>{{ col.value }}</span>
    </template>
  </q-td>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"

const emit = defineEmits(["update", "remove"])
const store = useStore()

const props = defineProps({
  cols: { type: Object, default: () => ({}) },
  row: { type: Object, default: () => ({}) }
})

const isEditing = ref(false)
const editableInputTypes = ref({ units: { type: "number" } })
const assignmentValues = ref({ id: null, units: null })

const organisation = computed(() => store.getters["admin/getOrganisation"])
const localValues = computed(() => JSON.parse(JSON.stringify(props.cols)))
const calculatedBudget = computed(() => {
  let chargeRate = localValues.value.find(item => item.name === "charge_rate").value
  chargeRate = CurrencyMethods.toNumber(chargeRate ?? 0)

  let budget = assignmentValues.value.units * chargeRate
  budget = CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, budget)
  return budget
})

function displayReadOnlyLabel(name) {
  if (!isEditing.value) {
    return true
  }
  return isEditing.value && editableInputTypes.value[name] === undefined
}

function onSaveClicked() {
  saveChanges()
}

function onRemoveClicked() {
  emit("remove", props.row.id)
}

function saveChanges() {
  const obj = {
    id: props.row.id,
    units: assignmentValues.value.units
  }
  emit("update", obj)
  isEditing.value = false
}

function cancelChanges() {
  isEditing.value = false
  setInitialValues()
}

function setInitialValues() {
  for (const [key] of Object.entries(assignmentValues.value)) {
    assignmentValues.value[key] = props.row[key]
  }
}

function decouple(object) {
  return JSON.parse(JSON.stringify(object))
}

watch(isEditing, currentValue => {
  if (currentValue === true) {
    setInitialValues()
  }
})

onMounted(() => {
  setInitialValues()
})
</script>

<style lang="scss">
.number-input-3 {
  min-width: 3em;
}

.currency-input-5 {
  min-width: 3em;
}

.small-chips .q-chip {
  font-size: 0.7rem;
}

.small-chips .q-field__control {
  padding-left: 0;
  padding-right: 0;
}

.q-field--outlined.condensed-padding .q-field__control {
  padding-left: 6px;
  padding-right: 6px;
}
</style>
