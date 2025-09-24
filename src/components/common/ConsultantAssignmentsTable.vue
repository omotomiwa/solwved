<template>
  <div v-if="assignments.length">
    <div class="text-weight-bold q-mb-sm q-mt-sm">
      {{ title }}
    </div>
    <div class="row">
      <q-table
        v-if="assignments.length"
        flat
        wrap-cells
        :rows="rows"
        :columns="columns"
        row-key="consultant_id"
        hide-pagination
        :pagination="{ rowsPerPage: 0 }"
        class="col-all bordered q-mb-md padding-dense"
        :class="props.serviceTypeId >= 3 ? 'extra-cols' : ''"
        table-header-class="text-weight-bolder text-primary"
        color="primary"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="text-weight-bolder text-primary">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" :class="getTableCellClassName(col.name)">
              {{ col.label }}
              <q-tooltip
                v-if="['budget','cost'].includes(col.name)"
                transition-show="scale"
                transition-hide="scale"
                anchor="top middle"
                self="center middle"
                class="bg-accent"
              >
                <template v-if="col.name === 'budget'">
                  The total charge multiplied by the units
                </template>
                <template v-if="col.name === 'cost'">
                  The total pay rate multiplied by the units
                </template>
              </q-tooltip>
            </q-th>
            <q-th class="actions" />
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <inline-engagement-editor
              :index="mode === 'assign' ? props.rowIndex : props.row.id"
              :mode="mode"
              :cols="props.cols"
              :row="props.row"
              :request-capabilities="requestCapabilities"
              :competencies="competencies"
              :projects="projects"
              :vendor-id="vendorId"
              :purchase-order="mode === 'manage' ? purchaseOrder : null"
              @update="onEngagementUpdate"
              @remove="removeEngagement"
            />
          </q-tr>
        </template>
        <template v-slot:bottom-row>
          <q-tr v-if="props.mode === 'assign'">
            <q-td colspan="3"> Totals:</q-td>
            <q-td class="text-right">
              {{ totals.margin }}
            </q-td>
            <q-td :class="unitsBreached ? 'text-negative text-bold' : ''" class="text-center">
              {{ totals.units }}
            </q-td>
            <q-td :class="budgetBreached ? 'text-negative text-bold' : ''" class="text-right">
              {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, totals.budget) }}
            </q-td>
            <q-td class="text-right">
              {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, totals.cost) }}
            </q-td>
            <q-td colspan="4" class="text-negative text-bold">
              <div v-if="warningMessage !== ''" class="row items-center">
                <q-icon name="warning" size="sm" />
                <div class="q-ml-sm">
                  {{ warningMessage }}
                </div>
              </div>
            </q-td>
          </q-tr>
          <q-tr v-if="props.mode === 'manage'" class="bottom-row">
            <q-td>Totals:</q-td>
            <q-td :colspan="props.serviceTypeId >= 3 ? ( props.request?.service?.has_competency ? 4 : 3 ) : 2" />
            <q-td class="text-right">
              {{ totals.margin }}
            </q-td>
            <q-td :class="unitsBreached && props.showRemainingBudget ? 'text-negative text-bold' : ''"
                  class="text-center">
              {{ totals.units }}
            </q-td>
            <q-td :class="totals.recorded > totals.units ? 'text-negative text-bold' : ''"
                  class="text-center">
              {{ totals.recorded }}
            </q-td>
            <q-td />
            <q-td :class="budgetBreached && props.showRemainingBudget ? 'text-negative text-bold' : ''"
                  class="text-right">
              {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, totals.budget) }}
            </q-td>
            <q-td class="text-right">
              {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, totals.cost) }}
            </q-td>
            <q-td colspan="3" class="text-negative text-bold">
              <div v-if="props.showRemainingBudget && warningMessage !== ''" class="row items-center">
                <q-icon name="warning" size="sm" />
                <div class="q-ml-sm">
                  {{ warningMessage }}
                </div>
              </div>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:bottom>
          <div
            v-if="props.mode === 'manage' && props.showRemainingBudget"
            class="text-bold totals-message"
            :class="remainingBudget.amount < 0 ? 'text-negative' : 'text-positive'"
          >
            {{ remainingBudgetMessage }}
          </div>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods, NumberMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import InlineEngagementEditor from "src/components/serviceManagement/InlineEngagementEditor.vue"

const store = useStore()

const props = defineProps({
  assignments: { type: Array, default: () => [] },
  projects: { type: Array, default: () => [] },
  requestCapabilities: { type: Array, default: () => [] },
  competencies: { type: Array, default: () => [] },
  capability: { type: Object, default: () => ({}) },
  request: { type: Object, default: () => ({}) },
  serviceTypeId: { type: Number, default: 1 },
  vendorId: { type: String },
  mode: { type: String, default: "assign" },
  showRemainingBudget: { type: Boolean, default: true }
})

const emit = defineEmits(["remove", "update"])

const organisation = computed(() => store.getters["admin/getOrganisation"])
const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const vendorId = computed(() => props.vendorId)
const mode = computed(() => props.mode)
const purchaseOrder = computed(() => props?.request?.purchase_order ?? null)
const title = computed(() => "Assigned " + OrganisationTypeMethods.changeConsultant(isBuiltEnvironment.value, { isPlural: props.serviceTypeId !== 1 }))
const projects = computed(() => props.projects)
const requestCapabilities = computed(() => props.requestCapabilities)
const competencies = computed(() => props.competencies)
const columns = computed(() => {
  if (props.mode === "manage") {
    let cols = [
      {
        name: "consultant",
        label: OrganisationTypeMethods.changeConsultant(isBuiltEnvironment.value),
        field: "consultant",
        align: "left"
      },
      {
        name: "pay_rate",
        label: "Pay Rate",
        field: "pay_rate",
        align: "right",
        format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
      },
      {
        name: "charge_rate",
        label: "Charge Rate",
        field: "charge_rate",
        align: "right",
        format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
      },
      {
        name: "margin",
        label: "Margin",
        field: "margin",
        align: "right",
        format: (val, row) => (((parseFloat(row.charge_rate) - parseFloat(row.pay_rate)) / parseFloat(row.charge_rate)) * 100).toFixed(2) + "%"
      },
      { name: "units", label: "Units", field: "units", align: "center" },
      { name: "recorded_units", label: "Recorded Units", field: "recorded_units", align: "center" },
      { name: "reported_to", label: "Recorded to Week", field: "reported_to", align: "center" },
      {
        name: "budget",
        label: "Charge Forecast",
        field: "budget",
        align: "right",
        format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
      },
      {
        name: "cost",
        label: "Cost Forecast",
        field: "cost",
        align: "right",
        format: (val, row) => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, parseFloat(row.pay_rate) * row.units)
      },
      {
        name: "start_date",
        label: "Start Date",
        field: "start_date",
        align: "center",
        format: val => val || "-"
      },
      {
        name: "end_date",
        label: "End Date",
        field: "end_date",
        align: "center",
        format: val => val || "-"
      },
      { name: "project_names", label: "Projects", field: "project_names", align: "left" }
    ]

    if (props.serviceTypeId >= 3) {
      const extra = [{ name: "capability_name", label: "Capability", field: "capability_name", align: "left" }]

      if (props.request?.service?.has_competency) {
        extra.push({ name: "competency_name", label: "Competency", field: "competency_name", align: "left" })
      }
      cols.splice(1, 0, ...extra)
    }

    return cols
  } else {
    return [
      {
        name: "consultant",
        label: OrganisationTypeMethods.changeConsultant(isBuiltEnvironment.value),
        field: "consultant",
        align: "left"
      },
      {
        name: "pay_rate",
        label: "Pay Rate",
        field: "pay_rate",
        align: "right",
        format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
      },
      {
        name: "charge_rate",
        label: "Charge Rate",
        field: "charge_rate",
        align: "right",
        format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
      },
      {
        name: "margin",
        label: "Margin",
        field: "margin",
        align: "right",
        format: (val, row) => (((parseFloat(row.charge_rate) - parseFloat(row.pay_rate)) / parseFloat(row.charge_rate)) * 100).toFixed(2) + "%"
      },
      { name: "units", label: "Units", field: "units", align: "center" },
      {
        name: "budget",
        label: "Charge Forecast",
        field: "budget",
        align: "right",
        format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
      },
      {
        name: "cost",
        label: "Cost Forecast",
        field: "cost",
        align: "right",
        format: (val, row) => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, parseFloat(row.pay_rate) * row.units)
      },
      {
        name: "start_date",
        label: "Start Date",
        field: "start_date",
        align: "center",
        format: val => val || "-"
      },
      {
        name: "end_date",
        label: "End Date",
        field: "end_date",
        align: "center",
        format: val => val || "-"
      },
      { name: "project_names", label: "Projects", field: "project_names", align: "left" }
    ]
  }
})
const rows = computed(() => {
  const rows = []
  if (props.mode === "assign") {
    props.assignments.forEach(assignment => {
      const row = {
        consultant_id: assignment.consultant_id,
        consultant: assignment.consultant_name,
        capability: assignment.capability_name,
        competency: assignment.competency_name,
        units: assignment.units,
        pay_rate: assignment.pay_rate,
        charge_rate: assignment.charge_rate,
        budget: assignment.budget,
        start_date: assignment.start_date,
        end_date: assignment.end_date,
        projects: listProjects(assignment.projects),
        project_names: listProjectNames(assignment.projects)
      }
      rows.push(row)
    })
  } else if (props.mode === "manage") {
    props.assignments.forEach(assignment => {
      const row = {
        id: assignment.id,
        consultant_id: assignment.consultant_id,
        consultant: assignment.consultant.user.fullName,
        capability: { id: assignment.request_capability.id, name: assignment.request_capability.capability.name },
        capability_name: assignment.request_capability.capability.name,
        competency: assignment.competency,
        competency_name: assignment.competency.name,
        units: assignment.units,
        recorded_units: Number(assignment.cumulative_units),
        reported_to: Number(assignment.reported_to),
        cumulative_units: assignment.cumulative_units,
        pay_rate: assignment.pay_rate,
        charge_rate: assignment.charge_rate,
        budget: assignment.budget,
        start_date: assignment.start_date,
        end_date: assignment.end_date,
        projects: listProjects(assignment.projects),
        project_names: listProjectNames(assignment.projects)
      }
      rows.push(row)
    })
  }
  return rows
})
const totals = computed(() => {
  let units = 0
  let budget = 0
  let recorded = 0
  let cost = 0
  let charge_rate = 0
  let pay_rate = 0
  props.assignments.forEach(assignment => {
    units += Number(assignment.units)
    budget += Number(assignment.budget)
    recorded += Number(assignment.cumulative_units)
    cost += Number(parseFloat(assignment.pay_rate) * assignment.units)
    charge_rate += Number(assignment.charge_rate)
    pay_rate += Number(assignment.pay_rate)
  })
  return {
    units: units,
    budget: budget,
    recorded: recorded,
    cost: cost,
    margin: (((charge_rate - pay_rate) / charge_rate) * 100).toFixed(2) + "%"
  }
})
//TODO really the PO needs to be the same as the Request budget
const remainingBudget = computed(() => {
  let poTotal
  if (props.serviceTypeId < 3) {
    poTotal = Number(props.request.budget)
  } else {
    poTotal = Number(props.request.purchase_order?.amount)
  }
  const v = poTotal - totals.value.budget
  const pc = parseInt((v / poTotal) * 100)
  return { amount: v, percent: pc }
})
const remainingBudgetMessage = computed(() => {
  let m
  if (remainingBudget.value.amount < 0) {
    m = "Over budget by " +
      CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, -remainingBudget.value.amount) +
      ", (" +
      NumberMethods.toFixedPlaces(-remainingBudget.value.percent, 2) +
      "% over budget)"
  } else {
    m = "Budget remaining: " +
      CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, remainingBudget.value.amount) +
      ", (" +
      NumberMethods.toFixedPlaces(remainingBudget.value.percent, 2) +
      "%)"
  }
  return m
})
const warningMessage = computed(() => {
  const messages = []
  if (unitsBreached.value && props.serviceTypeId === 2) {
    messages.push("Too many units")
  }
  if (budgetBreached.value) {
    messages.push("Budget breached")
  }
  return messages.join(", ")
})
const budgetBreached = computed(() => {
  if (props.mode === "assign" && totals.value.budget > props.capability.budget) {
    return true
  }
  return props.mode === "manage" && totals.value.budget > props.request.budget
})
const unitsBreached = computed(() => {
  if (props.mode === "assign" && totals.value.units > props.capability.units) {
    return true
  }
  return props.mode === "manage" && totals.value.units > props.request.units && props.serviceTypeId <= 2
})

function listProjects(projects) {
  return projects.map(item => item.project)
}

function listProjectNames(projects) {
  return projects.map(item => item.project.name).join(", ")
}

function onEngagementUpdate(obj) {
  emit("update", obj)
}

function removeEngagement(obj) {
  emit("remove", obj)
}

function getTableCellClassName(name) {
  let c = ""
  const obj = {
    margin: "text-no-wrap"
  }
  if (obj[name] !== undefined) {
    c = obj[name]
  }
  return c
}
</script>

<style lang="scss" scoped>
.bottom-row {
  box-shadow: 0 -1px 0 #000;
}

.q-table {
  padding: 8px;
}

.q-table tbody td:before {
  background: transparent;
}

.totals-message {
  font-size: 1.2em;
}
</style>
