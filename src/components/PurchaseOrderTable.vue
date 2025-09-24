<template>
  <div>
    <q-table
      flat
      wrap-cells
      :rows="rows"
      :columns="cols"
      hide-pagination
      :pagination="{ rowsPerPage: 0 }"
      class="max-w-full bordered q-mb-md"
      color="primary"
      table-header-class="text-weight-bolder text-primary"
      row-key="id"
    >
      <template v-slot:body="props">
        <q-tr v-if="!props.expand" :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <span v-if="col.name === 'approved'" :class="col.value === 1 ? 'text-positive' : 'text-negative'">
              <q-icon :name="col.value === 1 ? 'done' : 'hourglass_top'" style="font-size: 1.5em" />
            </span>
            <span v-else-if="col.name === 'milestones'">
              <span v-if="col.value.length">{{ col.value.length }}</span>
              <span v-else>None</span>
            </span>
            <q-btn
              v-else-if="col.name === 'action'"
              size="sm"
              padding="xs sm"
              color="primary"
              outline
              dense
              @click="props.expand = !props.expand"
              :label="props.expand ? 'Close' : 'Edit'"
            />
            <span v-else>{{ col.value }}</span>
          </q-td>
        </q-tr>
        <q-tr v-if="props.expand" :props="props">
          <q-td colspan="100%">
            <purchase-order-editor
              :data="props.row"
              :service="service"
              :can-breakdown-purchase-orders="canBreakdownPurchaseOrders"
              @update="arg => emit('update', arg)"
              @delete="arg => emit('delete', arg)"
              @cancel="() => (props.expand = false)"
            />
          </q-td>
        </q-tr>
      </template>
      <template v-slot:bottom-row>
        <q-tr v-if="showTotals" class="text-weight-bold" :class="totalsColor">
          <q-td>Sub Total:</q-td>
          <q-td class="text-right">
            {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, subTotalPurchaseOrders) }}
          </q-td>
          <q-td colspan="4">{{ warningMessage }}</q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"
import PurchaseOrderEditor from "src/components/PurchaseOrderEditor.vue"

const store = useStore()
const emit = defineEmits(["update", "delete"])

const props = defineProps({
  service: { type: Object, default: () => ({}) },
  purchaseOrders: { type: Array, default: () => [] },
  capabilities: { type: Array, default: () => [] },
  canBreakdownPurchaseOrders: { type: Boolean, default: false },
  showTotals: { type: Boolean, default: true }
})

const showTotals = computed(() => props.showTotals)
const subTotalPurchaseOrders = computed(() => {
  let sub = 0
  if (Array.isArray(props.purchaseOrders) && props.purchaseOrders.length) {
    for (let index = 0; index < props.purchaseOrders.length; index++) {
      const purchaseOrder = props.purchaseOrders[index]
      sub += parseInt(purchaseOrder.amount)
    }
  }
  return sub
})
const warningMessage = computed(() => {
  let m = ""
  if (subTotalPurchaseOrders.value > props.service.value) {
    const overBudget = subTotalPurchaseOrders.value - props.service.value
    m = "Warning, the Purchase Orders sub total has breached the service budget by " +
      CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, overBudget)
    if (props.purchaseOrders.length === 1) {
      m = "Warning, the Purchase Order amount breaches the service budget by " +
        CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, overBudget)
    }
  } else {
    const remainingServiceBudget = props.service.value - subTotalPurchaseOrders.value
    m = "Remaining Service budget: " +
      CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, remainingServiceBudget)
  }
  return m
})
const totalsColor = computed(() => subTotalPurchaseOrders.value > props.service.value ? "text-negative" : "")
const canBreakdownPurchaseOrders = computed(() => props.canBreakdownPurchaseOrders)
const capabilities = computed(() => props.capabilities)
const organisation = computed(() => store.getters["admin/getOrganisation"])
const cols = computed(() => {
  const a = [
    { name: "reference", label: "Reference", field: "reference", align: "left" },
    {
      name: "amount",
      label: "Value",
      field: "amount",
      align: "right",
      format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
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
    { name: "approved", label: "Approved", field: "approved", align: "center" }
  ]
  if (canBreakdownPurchaseOrders.value) {
    a.push({ name: "milestones", label: "Milestones", field: "milestones", align: "left" })
  }
  a.push({ name: "action", label: "Actions", align: "center" })
  return a
})
const rows = computed(() => {
  const r = []
  if (props.purchaseOrders && props.purchaseOrders.length) {
    props.purchaseOrders.forEach(po => {
      const obj = {
        id: po.id,
        reference: po.reference,
        start_date: po.start_date,
        end_date: po.end_date,
        amount: po.amount,
        approved: po.approved,
        partitioned: po.partitioned,
        milestones: po.milestones
      }
      r.push(obj)
    })
  }
  return r
})
</script>

<style scoped>
.q-table tbody td:before {
  background: rgba(0, 0, 0, 0);
}
</style>
