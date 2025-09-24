<template>
  <q-td v-for="col in localValues" :key="col.name" :class="col.__thClass">
    <template v-if="isEditing">
      <new-selector-form
        v-if="getInputType(col.name) === 'select'"
        v-model:option_id="engagementValues[getSelectModel(col.name)]"
        classes="condensed-padding"
        is-filterable
        filter-key="name"
        label=""
        dense
        :options="props[editableInputTypes[col.name].options]"
        default-class="full-width"
      />
      <currency-input
        v-if="getInputType(col.name) === 'currency'"
        dense
        label=""
        v-model="engagementValues[col.name]"
        input-class="currency-input-5"
        class="condensed-padding"
        :prefix="currency_symbol"
      />
      <q-input
        v-if="(engagementValues[col.name] !== undefined) && !['select', 'currency','date'].includes(getInputType(col.name))"
        v-model="engagementValues[col.name]"
        style="color-scheme: dark;"
        :type="getInputType(col.name)"
        outlined
        dense
        label-color="white"
        color="primary"
        :input-class="getInputClass(col.name)"
        class="condensed-padding warning-absolute"
        :rules="inputRules(col.name)"
      />
      <q-input
        v-if="getInputType(col.name) === 'date'"
        outlined
        class="condensed-padding"
        v-model="engagementValues[col.name]"
        type="text"
        :mask="Config.DATE_MASK"
        hide-bottom-space
        dense
        stack-label
        :rules="inputRules(col.name)"
      >
        <template v-slot:append>
          <q-icon
            name="event"
            class="cursor-pointer"
            @click="openDatePopup(col.name)"
          >
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
              ref="datePopups"
            >
              <q-date
                first-day-of-week="1"
                v-model="engagementValues[col.name]"
                text-color="dark"
                :mask="Config.DATE_FORMAT_DMY"
                today-btn
                no-unset
                @update:model-value="closeDatePopup()"
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
      <new-selector-form
        v-if="getInputType(col.name) === 'projects'"
        v-model:option_id="engagementValues.projects"
        classes="small-chips"
        is-filterable
        filter-key="name"
        label=""
        dense
        multiple
        use-chips
        :options="props.projects"
        default-class="full-width"
      />
    </template>
    <template v-if="displayReadOnlyLabel(col.name)">
      <span v-if="col.name === 'budget'">{{ calculatedBudget }}</span>
      <span v-else-if="col.name === 'recorded_units'" :class="getUnitsColor(col.value)">{{ col.value }}</span>
      <span v-else-if="col.name === 'reported_to'">{{ col.value === 0 ? "--" : col.value }}</span>
      <text-with-show-more
        v-else-if="col.name === 'project_names'"
        :show-more-words="10"
        :text="col.value ?? ''"
      />
      <span v-else>{{ col.value }}</span>
    </template>
  </q-td>
  <q-td>
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
  </q-td>
</template>

<script setup>
import { useQuasar } from "quasar"
import { computed, onMounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods, DateMethods } from "src/modules/GlobalMethods.js"
import { Config, RulesRegex } from "src/modules/StaticData.js"
import CurrencyInput from "src/components/CurrencyInput.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"
import TextWithShowMore from "components/common/text/TextWithShowMore.vue"

const emit = defineEmits(["update", "remove"])
const store = useStore()
const $q = useQuasar()

const props = defineProps({
  cols: { type: Object, default: () => ({}) },
  row: { type: Object, default: () => ({}) },
  purchaseOrder: { type: Object, default: () => ({}) },
  requestCapabilities: { type: Array, default: () => [] },
  competencies: { type: Array, default: () => [] },
  projects: { type: Array, default: () => [] },
  mode: { type: String, default: "assign" },
  vendorId: { type: String },
  index: { type: Number, default: null }
})

const datePopups = ref({})
const isEditing = ref(false)
const editableInputTypes = ref({
  capability_name: { type: "select", options: "requestCapabilities" },
  competency_name: { type: "select", options: "competencies" },
  pay_rate: { type: "currency" },
  charge_rate: { type: "currency" },
  units: { type: "number" },
  start_date: { type: "date" },
  end_date: { type: "date" },
  project_names: { type: "projects" }
})
const engagementValues = ref({
  id: null,
  capability: null,
  competency: null,
  pay_rate: 0,
  charge_rate: 0,
  units: 0,
  start_date: null,
  end_date: null,
  projects: []
})

const organisation = computed(() => store.getters["admin/getOrganisation"])
const currency_symbol = computed(() => organisation.value?.currency?.symbol ?? Config.CURRENCY_SYMBOL)
const localValues = computed(() => JSON.parse(JSON.stringify(props.cols)))
const calculatedBudget = computed(() => CurrencyMethods.toCurrencyFormat(
  organisation.value?.currency?.code,
  engagementValues.value.units * engagementValues.value.charge_rate
))

function openDatePopup(colName) {
  if (datePopups.value[colName]) {
    datePopups.value[colName].show()
  }
}

function closeDatePopup() {
  for (const popup in datePopups.value) {
    datePopups.value[popup].hide()
  }
  datePopups.value = {}
}

function inputRules(name) {
  let a = []
  if (name === "start_date") {
    a = [checkDate, startDateRule]
  } else if (name === "end_date") {
    a = [checkDate, endDateRule]
  }
  return a
}

function checkDate(val) {
  if ((val ?? "").trim().length > 0 && !RulesRegex.date.test(DateMethods.convertDateFormat(val))) {
    return "Please enter the valid date"
  }
  return true
}

function startDateRule(val) {
  const d1 = new Date(DateMethods.convertDateFormat(val)).getTime()
  if (props.purchaseOrder && props.purchaseOrder.start_date) {
    const d2 = new Date(DateMethods.convertDateFormat(props.purchaseOrder.start_date)).getTime()
    if (d1 && d1 < d2) {
      const d = props.purchaseOrder.start_date
      return `Must not be before ${d}`
    }
  }
  return true
}

function endDateRule(val) {
  const d1 = new Date(DateMethods.convertDateFormat(val)).getTime()
  if (props.purchaseOrder && props.purchaseOrder.end_date) {
    const d2 = new Date(DateMethods.convertDateFormat(props.purchaseOrder.end_date)).getTime()
    if (d1 && d1 > d2) {
      const d = props.purchaseOrder.end_date
      return `Must not be after ${d}`
    }
  }
  return true
}

function getInputType(name) {
  if (editableInputTypes.value[name] !== undefined) {
    return editableInputTypes.value[name].type
  }
  return undefined
}

function getSelectModel(name) {
  const obj = {
    capability_name: "capability",
    competency_name: "competency"
  }
  return obj[name]
}

function getUnitsColor(recordedUnits) {
  let c = ""
  if (props.row.units - recordedUnits <= 10) {
    c = "text-warning text-weight-bold"
  }
  if (props.row.units - recordedUnits <= 0) {
    c = "text-negative text-weight-bold"
  }
  return c
}

function displayReadOnlyLabel(name) {
  return !isEditing.value || editableInputTypes.value[name] === undefined
}

function onSaveClicked() {
  if (props.mode === "manage") {
    //check that the dates are ok
    if (checkDates() && checkProjects()) {
      saveChanges()
    }
  } else {
    if (checkProjects()) {
      updateAssignment()
    }
  }
}

function checkProjects() {
  if (engagementValues.value.projects.length) {
    return true
  }
  $q.notify({
    type: "negative",
    position: "top",
    message: "You must assign at least one project"
  })
  return false
}

function checkDates() {
  const startDate = new Date(DateMethods.convertDateFormat(engagementValues.value.start_date)).getTime()
  const endDate = new Date(DateMethods.convertDateFormat(engagementValues.value.end_date)).getTime()

  if (props.purchaseOrder) {
    if (props.purchaseOrder.start_date) {
      const purchaseOrderStartDate = new Date(DateMethods.convertDateFormat(props.purchaseOrder.start_date)).getTime()
      if (startDate < purchaseOrderStartDate) {
        $q.notify({
          type: "negative",
          position: "top",
          message: "Please correct the date error"
        })
        return false
      }
    }
    if (props.purchaseOrder.end_date) {
      const purchaseOrderEndDate = new Date(DateMethods.convertDateFormat(props.purchaseOrder.end_date)).getTime()
      if (endDate > purchaseOrderEndDate) {
        $q.notify({
          type: "negative",
          position: "top",
          message: "Please correct the date error"
        })
        return false
      }
    }
  }

  return true
}

function onRemoveClicked() {
  const obj = decouple(engagementValues.value)

  if (props.mode === "assign") {
    obj._id = props.index
  } else if (props.mode === "manage") {
    obj.id = props.row.id
  }
  emit("remove", obj)
}

// ONLY CALLED WHEN DEPLOYING A REQUEST
function updateAssignment() {
  const obj = decouple(engagementValues.value)
  obj.budget = obj.units * obj.charge_rate // make sure the budget is correct
  obj.project_ids = obj.projects.map(item => item.id)
  delete obj.projects
  obj._id = props.index

  emit("update", obj)
  isEditing.value = false
}

// ONLY CALLED WHEN MANAGING A SERVICE, NOT DEPLOYMENT
function saveChanges() {
  const obj = decouple(engagementValues.value)
  obj.budget = obj.units * obj.charge_rate // make sure the budget is correct
  obj.project_ids = obj.projects.map(item => item.id)
  delete obj.projects
  obj.request_capability_id = obj.capability.id
  delete obj.capability
  obj.competency_id = obj.competency.id
  delete obj.competency

  const patch = {
    vendorID: props.vendorId,
    id: props.row.id,
    method: "patch",
    data: obj
  }

  $q.loading.show()

  store.dispatch("vendor/consultantEngagement", patch).then(response => {
    emit("update", response)
    isEditing.value = false
    $q.loading.hide()
  }).catch(e => {
    console.log("patch error: " + e)
    $q.loading.hide()
  })
}

function cancelChanges() {
  isEditing.value = false
  setInitialValues()
}

function setInitialValues() {
  for (const [key] of Object.entries(engagementValues.value)) {
    engagementValues.value[key] = getInputType(key) === "currency" ? parseFloat(props.row[key] ?? 0) : props.row[key]
  }
}

function getInputClass(name) {
  return name === "units" ? "number-input-3" : ""
}

function decouple(object) {
  return JSON.parse(JSON.stringify(object))
}

watch(isEditing, currentValue => {
  if (currentValue === true) {
    setInitialValues()
  }
})
//The row data will be different if a row is deleted, so the initial values must be reset
watch(() => props.row, () => {
  isEditing.value = false
  setInitialValues()
})

onMounted(() => {
  setInitialValues()
})
</script>

<style lang="scss" scoped>
.warning-absolute.q-field--with-bottom {
  padding-bottom: 0;
}
</style>

<style lang="scss">
.warning-absolute .q-field__bottom {
  padding: 2px 0 4px 0;
}

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
