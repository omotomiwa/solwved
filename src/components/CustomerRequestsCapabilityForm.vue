<template>
  <div>
    <q-table
      v-if="cachedCustomerRequestCapabilities.length > 0"
      :columns="capabilityColumns"
      :full-width="true"
      :rows="capabilityRows"
      class="q-pa-sm q-my-md no-shadow"
      hide-pagination
      row-key="name"
      table-header-class="text-weight-bolder text-primary"
      color="primary"
    >
      <template #body-cell-units="props" v-if="editable">
        <q-td :props="props">
          <q-input
            v-model="props.row.units"
            color="primary"
            dense
            label="Units"
            label-color="white"
            outlined
            stack-label
            type="number"
            @update:model-value="() => editCapabilityRow(props.row)"
          />
        </q-td>
      </template>
      <template #body-cell-charge_rate="props" v-if="editable">
        <q-td :props="props">
          <currency-input
            v-model="props.row.charge_rate"
            dense
            label="Day Rate"
            :prefix="currency_symbol"
            @update:model-value="() => editCapabilityRow(props.row)"
          />
        </q-td>
      </template>
      <template #body-cell-start_date="props" v-if="editable">
        <q-td key="a" :props="props">
          <q-input
            v-model="props.row.start_date"
            dense
            label="Start Date"
            outlined
            type="text"
            :mask="config.DATE_MASK"
            hide-bottom-space
            stack-label
            :rules="[checkDate]"
            @update:model-value="() => editCapabilityRow(props.row)"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                  ref="rowStartDatePopup"
                >
                  <q-date
                    first-day-of-week="1"
                    v-model="props.row.start_date"
                    text-color="dark"
                    :mask="config.DATE_FORMAT_DMY"
                    today-btn
                    no-unset
                    @update:model-value="() => editCapabilityRow(props.row)"
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
        </q-td>
      </template>
      <template #body-cell-end_date="props" v-if="editable">
        <q-td key="b" :props="props">
          <q-input
            v-model="props.row.end_date"
            dense
            label="End Date"
            outlined
            type="text"
            :mask="config.DATE_MASK"
            hide-bottom-space
            stack-label
            :rules="[checkDate]"
            @update:model-value="() => editCapabilityRow(props.row)"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                  ref="rowEndDatePopup"
                >
                  <q-date
                    first-day-of-week="1"
                    v-model="props.row.end_date"
                    text-color="dark"
                    :mask="config.DATE_FORMAT_DMY"
                    today-btn
                    no-unset
                    @update:model-value="() => editCapabilityRow(props.row)"
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
        </q-td>
      </template>
      <template #body-cell-notes="props" v-if="editable">
        <q-td key="c" :props="props">
          <q-input
            v-model="props.row.notes"
            dense
            label="Notes"
            label-color="white"
            color="primary"
            outlined
            stack-label
            type="text"
            @update:model-value="() => editCapabilityRow(props.row)"
          />
        </q-td>
      </template>
      <template #body-cell-files="props" v-if="editable">
        <q-td :props="props">
          <q-btn v-show="props.row.files > 0" dense round flat icon="attach_file">
            <q-badge color="positive" floating transparent>
              {{ props.row.files }}
            </q-badge>
          </q-btn>
        </q-td>
      </template>
      <template #body-cell-action="props">
        <q-td :props="props">
          <q-btn color="negative" label="Delete" size="sm" @click="deleteCapability(props.row)" />
        </q-td>
      </template>
    </q-table>
    <div v-if="showCapabilityForm" class="row items-center q-col-gutter-sm q-mt-md">
      <new-selector-form
        v-model:option_id="localRecord.capability"
        :options="selectableCapabilities"
        :classes="props.service?.has_competency ? 'col-xs-12 col-md-6 col-lg-5' : 'col-xs-12 col-md-6 col-lg-6'"
        label="Capability"
        is-filterable
        filter-key="name"
        default-class="full-width"
        autofocus
      />
      <new-selector-form
        v-if="props.service?.has_competency"
        v-model:option_id="localRecord.competency"
        :options="competencies"
        classes="col-xs-12 col-md-6 col-lg-4"
        label="Competency"
        is-filterable
        filter-key="name"
        default-class="full-width"
      />
      <q-input
        v-model="localRecord.units"
        :class="{'col-xs-4 col-md-3 col-lg-3': props.service?.has_competency, 'col-xs-6 col-md-6 col-lg-6': !props.service?.has_competency}"
        label="Units"
        label-color="white"
        color="primary"
        min="1"
        outlined
        stack-label
        type="number"
      />
      <currency-input
        v-model="localRecord.charge_rate"
        class="col-xs-4 col-md-3 col-lg-3"
        label="Day Rate"
        :prefix="currency_symbol"
      />
      <currency-input
        :model-value="parseFloat(calculateBudget ?? 0)"
        class="col-xs-4 col-md-3 col-lg-3"
        disable
        label="Budget"
        :prefix="currency_symbol"
      />
      <q-input
        v-model="localRecord.start_date"
        class="col-xs-6 col-md-3 col-lg-3"
        label="Start Date"
        outlined
        type="text"
        :mask="config.DATE_MASK"
        hide-bottom-space
        stack-label
        :rules="[checkDate]"
        @update:model-value="() => checkStartDate(localRecord.start_date)"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
              ref="formStartDatePopup"
            >
              <q-date
                first-day-of-week="1"
                v-model="localRecord.start_date"
                text-color="dark"
                :mask="config.DATE_FORMAT_DMY"
                today-btn
                no-unset
                @update:model-value="() => checkStartDate(localRecord.start_date)"
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
        v-model="localRecord.end_date"
        class="col-xs-6 col-md-3 col-lg-3"
        label="End Date"
        outlined
        type="text"
        :mask="config.DATE_MASK"
        hide-bottom-space
        stack-label
        :rules="[checkDate]"
        @update:model-value="() => checkEndDate(localRecord.end_date)"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
              ref="formEndDatePopup"
            >
              <q-date
                first-day-of-week="1"
                v-model="localRecord.end_date"
                text-color="dark"
                :mask="config.DATE_FORMAT_DMY"
                today-btn
                no-unset
                @update:model-value="() => checkEndDate(localRecord.end_date)"
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
        v-model="localRecord.notes"
        class="col-xs-12 q-pb-xs-none q-pb-md-20 q-pb-lg-none"
        borderless
        columns="80"
        color="primary"
        label="Notes"
        label-color="white"
        stack-label
        bottom-slots
        outlined
        rows="2"
        autogrow
        type="textarea"
      />
      <div class="col-xs-12 col-md-6">
        <q-file
          class="text-white swlvd-file"
          v-model="localRecord.files"
          label="Load Documents"
          stack-label
          label-color="white"
          color="primary"
          counter
          outlined
          use-chips
          multiple
          clearable
          append
          accept=".doc,.docx,.pdf, .txt, .xlsx"
          max-files="10"
          max-file-size="5120000"
          @rejected="onRejected"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
      </div>
      <div class="col-xs-12 col-lg-6">
        <q-btn
          color="primary"
          text-color="dark"
          :disable="!allowSave"
          label="Add To Order"
          size="md"
          @click="cacheRequest"
        />
        <q-btn
          color="white"
          outline
          label="Cancel"
          size="md"
          class="q-ml-sm"
          @click="emit('cancel')"
        />
      </div>
    </div>
    <div class="row">
      <q-btn
        v-if="showAnotherCapabilityButton"
        label="Add Another Capability"
        class="q-mr-md"
        color="primary"
        text-color="dark"
        size="md"
        @click="addAnotherCapability"
      />
    </div>
    <div class="row q-mt-md justify-end">
      <q-btn
        v-if="props.orderStatus !== 'New'"
        label="Submit This Revision"
        class="q-mr-md"
        color="primary"
        text-color="dark"
        @click="submitRequest"
      />
      <q-btn
        v-if="props.orderStatus !== 'New'"
        label="Cancel Revision"
        color="white"
        outline
        @click="emit('cancel')"
      />
    </div>
    <q-dialog v-model="dialog">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-primary">{{ dialogTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          {{ dialogMessage }}
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { useQuasar } from "quasar"
import { computed, onMounted, reactive, ref, watch } from "vue"
import { useStore } from "vuex"
import { Config, RulesRegex } from "src/modules/StaticData.js"
import { CurrencyMethods, DateMethods } from "src/modules/GlobalMethods.js"
import NewSelectorForm from "components/NewSelectorForm.vue"
import CurrencyInput from "components/CurrencyInput.vue"

const props = defineProps({
  service: { type: Object, default: () => ({}) },
  capabilities: { type: Array, default: () => [] },
  request_capabilities: { type: Array, default: () => [] },
  maxRows: { type: Number, default: 1000 },
  proposerOrgType: { type: String, default: "Customer" },
  orderStatus: { type: String, default: "New" },
  version: { type: Number, default: 1 }
})

const emit = defineEmits(["cancel", "submit", "refresh"])
const $q = useQuasar()
const store = useStore()

const rowStartDatePopup = ref(null)
const rowEndDatePopup = ref(null)
const formStartDatePopup = ref(null)
const formEndDatePopup = ref(null)

const dialog = ref(false)
const dialogMessage = ref("")
const dialogTitle = ref("")
const localRecord = reactive({
  capability: null,
  competency: null,
  charge_rate: 0,
  budget: 0,
  units: 0,
  start_date: "",
  end_date: "",
  notes: "",
  files: null
})
const capabilitiesRef = ref([])
const addAnotherRow = ref(false)

const config = computed(() => Config)
const organisation = computed(() => store.getters["admin/getOrganisation"])
const currency_symbol = computed(() => organisation.value?.currency?.symbol ?? Config.CURRENCY_SYMBOL)
const capabilityColumns = computed(() => {
  let columnList = [
    { name: "capability", label: "Capability", field: "capability", align: "left" }
  ]

  if (props.service?.has_competency) {
    columnList.push({ name: "competency", label: "Competency", field: "competency", align: "left" })
  }

  return [
    ...columnList,
    { name: "units", label: "Units", field: "units", align: "center" },
    {
      name: "charge_rate",
      label: "Day Rate",
      field: "charge_rate",
      align: "right",
      format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
    },
    { name: "budget", label: "Budget", field: "budget", align: "right" },
    { name: "start_date", label: "Start Date", field: "start_date", align: "center", format: val => val || "-" },
    { name: "end_date", label: "End Date", field: "end_date", align: "center", format: val => val || "-" },
    { name: "notes", label: "Notes", field: "notes", align: "left" },
    { name: "files", label: "Files", field: "files", align: "left" },
    { name: "action", label: "Actions", field: "action", align: "center" }
  ]
})
const remainingServiceBudget = computed(() => {
  let b = 0
  if (props.service) {
    b = Number(props.service.value)
    if (props.service.requests && props.service.requests.length) {
      props.service.requests.forEach(request => {
        b -= Number(request.budget)
      })
    }
  }
  return b
})
const selectableCapabilities = computed(() => {
  const ids = props.request_capabilities.map(item => item.capability_id)
  return props.capabilities.filter(item => !ids.includes(item.id))
})
const editable = computed(() => props.orderStatus !== "New")
const allowSave = computed(() => {
  return localRecord.capability !== null &&
    ((props.service?.has_competency && localRecord.competency !== null) || !props.service?.has_competency) &&
    localRecord.charge_rate >= 1 &&
    localRecord.units >= 1 &&
    localRecord.start_date !== "" &&
    localRecord.end_date !== ""
})
const calculateBudget = computed(() => localRecord.units * localRecord.charge_rate)
const showAnotherCapabilityButton = computed(() => {
  return !!(showCapabilityForm.value === false &&
    capabilityRows.value.length < props.maxRows &&
    selectableCapabilities.value.length)
})
const showCapabilityForm = computed(() => {
  return capabilityRows.value.length < 1 || (addAnotherRow.value && capabilityRows.value.length < props.maxRows)
})
const cachedCustomerRequestCapabilities = computed(() => store.getters["contract/getCustomerRequestCapabilities"])
const competencies = computed(() => store.getters["admin/getCompetencies"])
const capabilityRows = computed(() => {
  const r = []
  let index = 0

  cachedCustomerRequestCapabilities.value.forEach(capability => {
    const capIndex = capabilityIndex(capability.capability_id)
    const compIndex = competencyIndex(capability.competency_id)
    const item = {
      id: capability.id,
      index: index++,
      capability: capIndex.name,
      competency: compIndex?.name,
      units: capability.units,
      charge_rate: capability.charge_rate,
      budget: CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, capability.budget),
      start_date: capability.start_date,
      end_date: capability.end_date,
      notes: capability.notes,
      files: capability?.files?.length,
      action: null // this.buildEditLink(capability)
    }
    r.push(item)
  })
  return r
})

watch(calculateBudget, currentValue => {
  if (currentValue > remainingServiceBudget.value) {
    dialogTitle.value = "Exceeding service budget"
    dialogMessage.value = "Warning, the budget for this order will exceed the service budget. The remaining service budget is " +
      CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, remainingServiceBudget.value)
    dialog.value = true
  }
})

function addAnotherCapability() {
  addAnotherRow.value = true
}

function checkDate(val) {
  if ((val ?? "").trim().length > 0 && !RulesRegex.date.test(DateMethods.convertDateFormat(val))) {
    return "Please enter the valid date"
  }
  return true
}

function checkStartDate(date) {
  formStartDatePopup.value.hide()
  const selectedDate = new Date(DateMethods.convertDateFormat(date)).getTime()
  const serviceStartDate = new Date(DateMethods.convertDateFormat(props.service.start_date)).getTime()
  const serviceEndDate = new Date(DateMethods.convertDateFormat(props.service.end_date)).getTime()

  if (selectedDate < serviceStartDate) {
    dialogTitle.value = "Date outside range"
    dialogMessage.value = "You cannot request a start date earlier than the service start date (" +
      props.service.start_date +
      ")"
    dialog.value = true
    localRecord.start_date = props.service.start_date
  } else if (selectedDate > serviceEndDate) {
    dialogTitle.value = "Date outside range"
    dialogMessage.value = "You cannot request a start date later than the service end date (" +
      props.service.end_date +
      ")"
    dialog.value = true
    localRecord.start_date = props.service.start_date
  }

  if (localRecord.end_date) {
    const localServiceEndDate = new Date(DateMethods.convertDateFormat(localRecord.end_date)).getTime()
    if (selectedDate >= localServiceEndDate) {
      dialogTitle.value = "Start date later than end date"
      dialogMessage.value = "The start date must come before the end date"
      dialog.value = true
      localRecord.start_date = props.service.start_date
    }
  }
}

function checkEndDate(date) {
  formEndDatePopup.value.hide()
  const selectedDate = new Date(DateMethods.convertDateFormat(date)).getTime()
  const serviceStartDate = new Date(DateMethods.convertDateFormat(props.service.start_date)).getTime()
  const serviceEndDate = new Date(DateMethods.convertDateFormat(props.service.end_date)).getTime()

  if (selectedDate > serviceEndDate) {
    dialogTitle.value = "Date outside range"
    dialogMessage.value = "You cannot request an end date later than the service end date (" +
      props.service.end_date +
      ")"
    dialog.value = true
    localRecord.end_date = props.service.end_date
  } else if (selectedDate < serviceStartDate) {
    dialogTitle.value = "Date outside range"
    dialogMessage.value = "You cannot request an end date earlier than the service start date (" +
      props.service.start_date +
      ")"
    dialog.value = true
    localRecord.end_date = props.service.end_date
  }

  if (localRecord.start_date) {
    const localServiceStartDate = new Date(DateMethods.convertDateFormat(localRecord.start_date)).getTime()
    if (selectedDate <= localServiceStartDate) {
      dialogTitle.value = "End date earlier than start date"
      dialogMessage.value = "The end date must be later than the start date"
      dialog.value = true
      localRecord.end_date = props.service.end_date
    }
  }
}

function capabilityIndex(capabilityId) {
  return props.capabilities.find(function(capa) {
    return capa.id === capabilityId
  })
}

//TODO This returns null when managing an order
function competencyIndex(competencyId) {
  return competencies.value.find(function(comp) {
    return comp.id === competencyId
  })
}

function cachePropsCapabilites() {
  props.request_capabilities.forEach(rc => {
    const newC = {
      capabilityIndex: 0, // this.capabilityIndex(rc.capability_id),
      service_request_id: null,
      capability_id: rc.capability_id,
      competency_id: rc.competency_id ?? null,
      units: rc.units,
      charge_rate: rc.charge_rate,
      budget: rc.units * rc.charge_rate,
      start_date: rc.start_date,
      end_date: rc.end_date,
      notes: rc.notes,
      files: null,
      proposed_by: rc.proposed_by
    }
    capabilitiesRef.value.push(newC)
  })
  store.commit("contract/setCustomerRequestCapabilities", capabilitiesRef.value)
}

function cacheRequest() {
  const cRC = [...store.getters["contract/getCustomerRequestCapabilities"]]
  const newC = {
    capabilityIndex: 0, // capabilityIndex(selectedCapability),
    service_request_id: null,
    capability_id: localRecord.capability,
    competency_id: localRecord.competency ?? null,
    units: localRecord.units,
    charge_rate: localRecord.charge_rate,
    budget: localRecord.units * localRecord.charge_rate,
    start_date: localRecord.start_date,
    end_date: localRecord.end_date,
    notes: localRecord.notes,
    files: localRecord.files,
    proposed_by: props.proposerOrgType
  }
  cRC.push(newC)
  store.commit("contract/setCustomerRequestCapabilities", cRC)
  resetForm()
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function populateFields() {
  localRecord.capability = props.capabilities[randomNumber(0, props.capabilities.length - 1)].id
  localRecord.competency = props.service?.has_competency ? randomNumber(1, 4) : null
  localRecord.units = randomNumber(1, 44)
  localRecord.charge_rate = randomNumber(300, 500)
  localRecord.budget = localRecord.units * localRecord.charge_rate
  localRecord.start_date = "2022-10-31"
  localRecord.end_date = "2022-11-01"
  localRecord.notes = "dummy notes"
}

function onRejected(entries) {
  if (entries.length > 0) {
    switch (entries[0].failedPropValidation) {
      case "max-file-size":
        $q.notify({
          position: "top",
          type: "negative",
          message: "File exceeds 5MB."
        })
        break

      case "max-files":
        $q.notify({
          position: "top",
          type: "negative",
          message: "You can upload up to 10 files."
        })
        break
    }
  }
}

function editCapabilityRow(row) {
  rowStartDatePopup.value.hide()
  rowEndDatePopup.value.hide()
  const cRC = [...store.getters["contract/getCustomerRequestCapabilities"]]
  const myCRC = JSON.parse(JSON.stringify(cRC))
  myCRC[row.index].units = row.units
  myCRC[row.index].charge_rate = row.charge_rate
  myCRC[row.index].budget = row.charge_rate * row.units
  myCRC[row.index].start_date = row.start_date
  myCRC[row.index].end_date = row.end_date
  myCRC[row.index].notes = row.notes
  store.commit("contract/setCustomerRequestCapabilities", myCRC)
}

function resetForm() {
  localRecord.capability = null
  localRecord.competency = null
  localRecord.budget = 0
  localRecord.charge_rate = 0
  localRecord.units = 1
  localRecord.notes = ""
  localRecord.files = null
  localRecord.start_date = null
  localRecord.end_date = null

  addAnotherRow.value = false
}

function deleteCapability(row) {
  const cachedRequestCapabilities = [...store.getters["contract/getCustomerRequestCapabilities"]]
  cachedRequestCapabilities.splice(row.index, 1)
  store.commit("contract/setCustomerRequestCapabilities", cachedRequestCapabilities)
}

function getCompetencies(force = false) {
  if (competencies.value.length < 1 || force) {
    const obj = {
      call: "competencies",
      method: "get"
    }
    store.dispatch("admin/datacallDt", obj)
  }
}

function submitRequest() {
  emit("submit")
}

onMounted(() => {
  getCompetencies()
  if (props.request_capabilities) {
    cachePropsCapabilites()
  }
  resetForm()
})
</script>
