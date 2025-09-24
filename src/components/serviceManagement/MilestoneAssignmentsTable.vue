<template>
  <div v-if="assignments.length">
    <div class="text-weight-bold q-mb-sm q-mt-sm">Assigned Engagements</div>
    <div class="row">
      <div class="col-all">
        <q-table
          v-if="assignments.length"
          flat
          wrap-cells
          :rows="rows"
          :columns="columns"
          row-key="id"
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
          class="bordered q-mb-md padding-dense"
          table-header-class="text-weight-bolder text-primary"
          color="primary"
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="text-weight-bolder text-primary">
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <inline-milestone-assignment-editor
                :cols="props.cols"
                :row="props.row"
                @update="updateAssignment"
                @remove="removeAssignment"
              />
            </q-tr>
          </template>
          <template v-slot:bottom-row>
            <q-tr class="bottom-row">
              <q-td> Totals:</q-td>
              <q-td colspan="3" />
              <q-td class="text-center" :class="unitsBreached ? 'text-negative text-bold' : ''">
                {{ totals.units }}
              </q-td>
              <q-td class="text-right" :class="budgetBreached ? 'text-negative text-bold' : ''">
                {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, totals.budget) }}
              </q-td>
              <q-td class="text-negative text-bold">
                <template v-for="(message,index) in warningMessage">
                  <div v-if="message !== ''" class="row items-center" :key="index">
                    <q-icon name="warning" size="sm" />
                    <div class="q-ml-sm">
                      {{ message }}
                    </div>
                  </div>
                </template>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:bottom>
            <div
              class="text-bold totals-message"
              :class="remainingBudget.amount < 0 ? 'text-negative' : 'text-positive'"
            >
              {{ remainingBudgetMessage }}
            </div>
          </template>
        </q-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods, NumberMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import InlineMilestoneAssignmentEditor from "src/components/serviceManagement/InlineMilestoneAssignmentEditor.vue"

const emit = defineEmits(["remove", "update"])
const store = useStore()

const props = defineProps({
  service: { type: Object, default: () => ({}) },
  assignments: { type: Array, default: () => [] },
  milestone: { type: Object, default: () => ({}) }
})

const organisation = computed(() => store.getters["admin/getOrganisation"])
const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const columns = computed(() => {
  let columnList = [
    {
      name: "consultant",
      label: OrganisationTypeMethods.changeConsultant(isBuiltEnvironment.value),
      field: "consultant",
      align: "left"
    },
    { name: "capability", label: "Capability", field: "capability", align: "left" }
  ]

  if (props.service?.has_competency) {
    columnList.push({ name: "competency", label: "Competency", field: "competency", align: "left" })
  }

  return [
    ...columnList,
    {
      name: "charge_rate",
      label: "Charge Rate",
      field: "charge_rate",
      align: "right",
      format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
    },
    { name: "remaining_units", label: "Remaining Allocation", field: "remaining_units", align: "center" },
    { name: "units", label: "Milestone Units", field: "units", align: "center" },
    {
      name: "budget",
      label: "Budget",
      field: "budget",
      align: "right",
      format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
    },
    { name: "actions", label: "Actions", field: "action", align: "right" }
  ]
})
const rows = computed(() => {
  const rows = []
  props.assignments.forEach(assignment => {
    const row = {
      id: assignment.consultant_engagement_milestone_id,
      consultant: assignment.consultant.user.fullName,
      capability: assignment.request_capability.capability.name,
      competency: assignment.competency.name,
      units: assignment.units,
      remaining_units: assignment.remainingAllocation,
      charge_rate: assignment.charge_rate,
      budget: assignment.units * assignment.charge_rate
    }
    rows.push(row)
  })
  return rows
})
const totals = computed(() => {
  let units = 0
  let budget = 0
  props.assignments.forEach(assignment => {
    units += Number(assignment.units)
    budget += Number(assignment.units * assignment.charge_rate)
  })
  return { units: units, budget: budget }
})
const remainingBudget = computed(() => {
  const poTotal = Number(props.milestone.amount)
  const v = poTotal - totals.value.budget
  const pc = (v / poTotal) * 100
  return { amount: v, percent: pc }
})
const remainingBudgetMessage = computed(() => {
  let m
  if (remainingBudget.value.amount < 0) {
    m = "Milestone over budget by " +
      CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, -remainingBudget.value.amount) +
      ", (" +
      NumberMethods.toFixedPlaces(-remainingBudget.value.percent, 2) +
      "% over budget)"
  } else {
    m = "Milestone budget remaining: " +
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
  return messages
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

function getTableCellClassName(name) {
  let c = ""
  const obj = {
    consultant: "name-cell",
    capability: "capability-cell",
    competency: "competency-cell",
    charge_rate: "rates-cell",
    remaining_units: "remaining-cell",
    units: "units-cell",
    budget: "budget-cell"
  }
  if (obj[name] !== undefined) {
    c = obj[name]
  }
  return c + " text-weight-bolder text-primary"
}

function removeAssignment(id) {
  emit("remove", id)
}

function updateAssignment(obj) {
  emit("update", obj)
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
