<template>
  <div>
    <q-table
      flat
      wrap-cells
      :rows="rows"
      :columns="cols"
      hide-pagination
      class="max-w-full bordered q-mb-md"
      table-header-class="text-weight-bolder text-primary"
      color="primary"
    >
      <template v-slot:header="props">
        <q-tr :props="props" class="text-weight-bolder text-primary">
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
          <q-th auto-width />
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.value }}
          </q-td>
          <q-td>
            <q-btn
              style="width: 16em"
              class="no-wrap"
              :icon="props.expand ? 'expand_less' : 'expand_more'"
              size="sm"
              padding="xs sm"
              align="left"
              color="primary"
              outline
              dense
              unelevated
              @click="props.expand = !props.expand"
              :label="props.expand ? 'Hide Engagements' : 'Manage Assignments'"
            />
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <milestone-consultant-manager
              :milestone="props.row"
              :milestones="allMilestones"
              :request="request"
              :purchase-order="purchaseOrder"
              :vendor-id="vendorId"
              class="q-mb-lg"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"
import MilestoneConsultantManager from "src/components/serviceManagement/MilestoneConsultantManager.vue"

const store = useStore()

const props = defineProps({
  milestones: { type: Array, default: () => [] },
  consultants: { type: Array, default: () => [] },
  service: { type: Object, default: () => ({}) },
  vendorId: { type: String, default: null },
  purchaseOrder: { type: Object, default: () => ({}) }
})

const organisation = computed(() => store.getters["admin/getOrganisation"])
const cols = computed(() => [
  { name: "reference", label: "Reference", field: "reference", align: "left" },
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
  {
    name: "amount",
    label: "Budget",
    field: "amount",
    align: "right",
    format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
  },
  {
    name: "assigned_budget",
    label: "Assigned Budget",
    field: "assigned_budget",
    align: "right",
    format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
  },
  { name: "consultant_count", label: "Assigned Engagements", field: "consultant_count", align: "center" }
])
const purchaseOrder = computed(() => props.purchaseOrder)
const allMilestones = computed(() => props.milestones)
const rows = computed(() => {
  const r = []
  if (props.milestones && props.milestones.length) {
    props.milestones.forEach(milestone => {
      const obj = {
        id: milestone.id,
        reference: milestone.reference,
        amount: milestone.amount,
        start_date: milestone.start_date,
        end_date: milestone.end_date,
        consultant_count: milestone.engagements.length,
        assigned_budget: getAssignedBudget(milestone),
        engagements: milestone.engagements
      }
      r.push(obj)
    })
  }
  return r
})
const request = computed(() => props.service.requests[0])
const vendorId = computed(() => props.vendorId)

function getAssignedBudget(milestone) {
  let assignedBudget = 0
  const allEngagements = request.value.consultant_engagements
  if (milestone.engagements && milestone.engagements.length) {
    milestone.engagements.forEach(me => {
      const units = parseFloat(me.units)
      const engagement = allEngagements.find(e => e.id === me.consultant_engagement_id)
      if (engagement) {
        assignedBudget += units * parseFloat(engagement.charge_rate)
      }
    })
  }
  return assignedBudget
}
</script>

<style scoped>
.q-table tbody td:before {
  background: rgba(0, 0, 0, 0);
}
</style>
