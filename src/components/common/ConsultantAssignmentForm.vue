<template>
  <div>
    <div v-if="showForm" class="row items-center q-col-gutter-sm">
      <new-selector-form
        classes="col-12 col-md-4 col-lg-3"
        v-model:option_id="selectedConsultant"
        :label="'Assign a ' + OrganisationTypeMethods.changeConsultant(isBuiltEnvironment)"
        :options="props.consultants"
        :is-emit-value="false"
        filter-key="name"
        default-class="full-width"
        is-clearable dense is-filterable autofocus
      />
      <new-selector-form
        v-if="props.serviceTypeId >= 3"
        classes="col-12 col-md-4 col-lg-3"
        v-model:option_id="selectedRequestCapability"
        :options="props.requestCapabilities"
        label="Capability"
        filter-key="name"
        default-class="full-width"
        is-filterable dense
      />
      <new-selector-form
        v-if="props.serviceTypeId >= 3 && props.request?.service?.has_competency"
        classes="col-12 col-md-4 col-lg-2"
        v-model:option_id="selectedCompetency"
        :options="props.competencies"
        label="Competency"
        filter-key="name"
        default-class="full-width"
        dense is-filterable
      />
      <q-input
        v-model="units"
        class="col-1"
        label-color="white"
        color="primary"
        type="text"
        label="Units"
        dense outlined stack-label
      />
      <CurrencyInput
        class="col-1"
        label="Pay rate"
        v-model="payRate"
        :prefix="currency_symbol"
        dense
      />
      <CurrencyInput
        class="col-1"
        label="Charge rate"
        v-model="chargeRate"
        :prefix="currency_symbol"
        dense
      />
      <CurrencyInput
        class="col-2"
        label="Budget"
        :model-value="chargeRate * units"
        :prefix="currency_symbol"
        dense disable
      />
      <q-input
        label="Start Date"
        class="col-2 warning-absolute"
        v-model="startDate"
        type="text"
        :mask="config.DATE_MASK"
        :rules="[ checkDate, startDateRule, endDateRule]"
        outlined hide-bottom-space dense stack-label
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              transition-show="scale"
              transition-hide="scale"
              ref="startDatePopup"
              cover
            >
              <q-date
                first-day-of-week="1"
                v-model="startDate"
                text-color="dark"
                :mask="config.DATE_FORMAT_DMY"
                today-btn no-unset
                @update:model-value="closeStartDatePopup"
              >
                <div class="row items-center justify-end">
                  <q-btn
                    label="Close"
                    color="primary"
                    text-color="dark"
                    flat v-close-popup
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-input
        label="End Date"
        class="col-2 warning-absolute"
        v-model="endDate"
        type="text"
        :mask="config.DATE_MASK"
        :rules="[ checkDate, endDateRule]"
        outlined hide-bottom-space dense stack-label
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              transition-show="scale"
              transition-hide="scale"
              ref="endDatePopup"
              cover
            >
              <q-date
                first-day-of-week="1"
                v-model="endDate"
                text-color="dark"
                :mask="config.DATE_FORMAT_DMY"
                today-btn no-unset
                @update:model-value="closeEndDatePopup"
              >
                <div class="row items-center justify-end">
                  <q-btn
                    label="Close"
                    color="primary"
                    text-color="dark"
                    flat v-close-popup
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <new-selector-form
        v-model:option_id="selectedProjects"
        classes="col-12 col-md-4 col-lg-3"
        :options="projects"
        filter-key="name"
        label="Projects"
        default-class="full-width"
        :is-emit-value="false"
        dense multiple is-filterable
      />
      <div class="col">
        <q-btn
          label="Assign"
          icon="person_add"
          class="q-ml-sm"
          color="primary"
          text-color="dark"
          size="sm"
          :disable="!allowAssignConsultant"
          @click="assignConsultant"
        />
        <q-btn
          class="q-ml-sm"
          label="Cancel"
          color="white"
          size="sm"
          outline
          @click="showForm = false"
        />
      </div>
    </div>
    <div v-if="!showForm">
      <q-btn
        :label="'Assign '+ OrganisationTypeMethods.changeConsultant(isBuiltEnvironment)"
        icon="person_add"
        color="primary"
        text-color="dark"
        @click="showForm = true"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { Config, RulesRegex } from "src/modules/StaticData.js"
import { DateMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import CurrencyInput from "src/components/CurrencyInput.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

const store = useStore()

const props = defineProps({
  request: { type: Object, default: () => ({}) },
  requestCapability: { type: Object, default: () => ({}) },
  consultants: { type: Array, default: () => [] },
  projects: { type: Array, default: () => [] },
  requestCapabilities: { type: Array, default: () => [] },
  competencies: { type: Array, default: () => [] },
  milestone: { type: Object, default: () => ({}) },
  serviceTypeId: { type: Number, default: 1 },
  mode: { type: String, default: "manage" }
})

const emit = defineEmits(["submit"])

const showForm = ref(false)
const selectedConsultant = ref(null)
const selectedRequestCapability = ref(null)
const selectedCompetency = ref(null)
const payRate = ref(0)
const chargeRate = ref(0)
const units = ref(0)
const selectedProjects = ref([])
const startDate = ref(null)
const endDate = ref(null)

const startDatePopup = ref(null)
const endDatePopup = ref(null)

const config = computed(() => Config)
const organisation = computed(() => store.getters["admin/getOrganisation"])
const currency_symbol = computed(() => organisation.value?.currency?.symbol ?? Config.CURRENCY_SYMBOL)
const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const projects = computed(() => {
  let projects = []
  if (props.projects) {
    projects = props.projects
  } else if (props.request && props.request.contract && props.request.contract.projects) {
    projects = props.request.contract.projects
  }
  return projects
})
const allowAssignConsultant = computed(() => {
  if (selectedConsultant.value === null ||
    payRate.value === 0 ||
    chargeRate.value === 0 ||
    selectedProjects.value.length === 0) {
    return false
  }
  if (props.request.purchase_order) {
    let po = {
      start_date: new Date(props.request.purchase_order.start_date),
      end_date: new Date(props.request.purchase_order.end_date)
    }
    let newVal = {
      start_date: new Date(startDate.value),
      end_date: new Date(endDate.value)
    }
    if (newVal.start_date < po.start_date || newVal.end_date > po.end_date) {
      return false
    }
  }
  return true
})

watch(
  () => ({
    service: props.request?.service,
    competencies: props.competencies
  }),
  newVal => {
    if (!newVal.service?.has_competency) {
      selectedCompetency.value = newVal.competencies.find(val => val.auto_applied && val.is_default)?.id
    }
  },
  { deep: true }
)

function closeStartDatePopup() {
  startDatePopup.value.hide()
}

function closeEndDatePopup() {
  endDatePopup.value.hide()
}

function checkDate(val) {
  if ((val ?? "").trim().length > 0 && !RulesRegex.date.test(DateMethods.convertDateFormat(val))) {
    return "Please enter the valid date"
  }
  return true
}

function startDateRule(val) {
  const d1 = new Date(DateMethods.convertDateFormat(val)).getTime()
  if (val && props.request?.purchase_order && props.request?.purchase_order?.start_date) {
    const d2 = new Date(DateMethods.convertDateFormat(props.request.purchase_order.start_date)).getTime()
    if (d1 < d2) {
      const d = props.request.purchase_order.start_date
      return `Must not be before ${d}`
    }
  }
  return true
}

function endDateRule(val) {
  const d1 = new Date(DateMethods.convertDateFormat(val)).getTime()
  if (val && props.request?.purchase_order && props.request?.purchase_order?.end_date) {
    const d2 = new Date(DateMethods.convertDateFormat(props.request.purchase_order.end_date)).getTime()
    if (d1 > d2) {
      const d = props.request.purchase_order.end_date
      return `Must not be after ${d}`
    }
  }
  return true
}

function assignConsultant() {
  let [requestCapabilityId, requestCapabilityData] = requestCapabilityFn()
  let [competencyId, competencyData] = competency()

  const obj = {
    consultant_id: selectedConsultant.value.id,
    consultant_name: selectedConsultant.value.name,
    request_capability_id: getRequestCapabilityId(),
    capability_id: requestCapabilityId,
    capability_name: requestCapabilityData?.name,
    competency_id: competencyId,
    competency_name: competencyData?.name,
    pay_rate: payRate.value,
    charge_rate: chargeRate.value,
    budget: chargeRate.value * units.value,
    units: parseFloat(units.value),
    project_ids: selectedProjects.value.map(project => project.id),
    projects: selectedProjects.value.map(project => project.name).join(", "),
    start_date: startDate.value,
    end_date: endDate.value
  }

  emit("submit", JSON.parse(JSON.stringify(obj)))
  resetFormFields()
  showForm.value = false
}

function requestCapabilityFn() {
  let id = selectedRequestCapability.value ?? props.requestCapability?.capability_id
  return [id, props.requestCapabilities.find(val => val.id === id)?.capability]
}

function competency() {
  let id = selectedCompetency.value ?? (props.requestCapability?.competency_id || props.request?.competency_id)
  return [id, props.competencies.find(val => val.id === id)]
}

function getRequestCapabilityId() {
  return selectedRequestCapability.value ? selectedRequestCapability.value : props.requestCapability?.id
}

function resetFormFields() {
  selectedConsultant.value = null
  payRate.value = 0
  chargeRate.value = 0
  units.value = 0
  selectedProjects.value = []
}

onMounted(() => {
  if (props.serviceTypeId === 1) {
    startDate.value = props.requestCapability.start_date
    endDate.value = props.requestCapability.end_date
    units.value = props.requestCapability.units
    chargeRate.value = props.requestCapability.budget / props.requestCapability.units
  }
  if (props.serviceTypeId === 2) {
    startDate.value = props.requestCapability.start_date
    endDate.value = props.requestCapability.end_date
  }
  if (props.serviceTypeId >= 3) {
    startDate.value = props.request?.start_date
    endDate.value = props.request?.end_date
  }
})
</script>

<style scoped>
.warning-absolute.q-field--with-bottom {
  padding-bottom: 0;
}
</style>
