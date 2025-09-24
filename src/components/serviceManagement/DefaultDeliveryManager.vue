<template>
  <div>
    <div v-if="purchaseOrder">
      <div class="text-h6 q-mb-md q-mt-lg">
        This {{ deliveryModelLabel }} is covered by the following Purchase Order
      </div>
      <q-table
        flat
        :rows="poRows"
        :columns="poCols"
        hide-pagination
        class="max-w-full bordered q-mb-md"
        table-header-class="text-weight-bolder text-primary"
        color="primary"
        wrap-cells
      >
        <template v-slot:body-cell-action="props">
          <q-td :props="props">
            <div v-if="!restrictedView" class="col">
              <q-btn
                size="sm"
                color="primary"
                outline
                icon="edit"
                :to="serviceBuilderLink"
                label="Edit"
              />
            </div>
          </q-td>
        </template>
      </q-table>
      <div v-if="!restrictedView" class="q-mb-lg">
        <ConsultantManager
          :request="request"
          :consultants="consultants"
          :projects="projects"
          :vendor-id="vendorId"
          class="q-mb-lg"
        />
      </div>
      <div v-if="purchaseOrderMilestones.length && !restrictedView">
        <div class="text-h6 q-mb-md">Milestones:</div>
        <PurchaseOrderMilestonesList
          :milestones="purchaseOrderMilestones"
          :service="props.service"
          :vendor-id="props.vendorId"
          :consultants="consultants"
          :purchase-order="purchaseOrder"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"
import ConsultantManager from "src/components/serviceManagement/ConsultantManager.vue"
import PurchaseOrderMilestonesList from "src/components/serviceManagement/PurchaseOrderMilestonesList.vue"

const store = useStore()

const props = defineProps({
  service: { type: Object, default: () => ({}) },
  vendorId: { type: String, default: null },
  customerId: { type: String, default: null },
  restrictedView: { type: Boolean, default: false }
})

const organisation = computed(() => store.getters["admin/getOrganisation"])
const poCols = computed(() => [
  { name: "reference", label: "Reference", field: "reference", align: "left" },
  {
    name: "amount",
    label: "Value",
    field: "amount",
    align: "right",
    format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
  },
  { name: "milestones", label: "Milestones", field: "milestones", align: "center" },
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
  { name: "action", label: "Actions", field: "action", align: "left" }
])
const restrictedView = computed(() => props.restrictedView)
const request = computed(() => props.service.requests[0])
const projects = computed(() => props.service.contract.projects)
const poRows = computed(() => {
  const r = []
  if (purchaseOrder.value) {
    const obj = {
      reference: purchaseOrder.value.reference,
      amount: purchaseOrder.value.amount,
      milestones: purchaseOrder.value.milestones.length,
      start_date: purchaseOrder.value.start_date,
      end_date: purchaseOrder.value.end_date,
      action: "edit"
    }
    r.push(obj)
  }
  return r
})
const deliveryModelLabel = computed(() => {
  if (props.service.delivery_model.id === 3) {
    return "Statement of Work"
  } else if (props.service.delivery_model.id === 4) {
    return "Work Package"
  }
  return "unknown delivery model"
})
const serviceBuilderLink = computed(() => {
  let link = "/"
  if (props.vendorId) {
    link = "/vendor/" + props.vendorId + "/contracts/" + props.service.contract_id + "/services/" + props.service.id
  } else if (props.customerId) {
    link = "/customer/" + props.customerId + "/contracts/" + props.service.contract_id + "/services/" + props.service.id
  }
  return link
})
const purchaseOrder = computed(() => {
  let po = null
  if (props.service && props.service.purchase_orders && props.service.purchase_orders.length) {
    po = props.service.purchase_orders[0] //there will be only 1 PO for SOW or Work Package
  }
  return po
})
const purchaseOrderMilestones = computed(() => purchaseOrder.value?.milestones ?? [])
const consultants = computed(() => {
  let c = store.getters["vendor/getConsultantsByVendor"](props.vendorId)
  c = JSON.parse(JSON.stringify(c))
  if (Array.isArray(c) && c.length > 0) {
    c.sort((a, b) => (a.user.last_name > b.user.last_name ? 1 : b.user.last_name > a.user.last_name ? -1 : 0))
  }
  return c.map(item => {
    return {
      id: item.id,
      name: item.user.fullName
    }
  })
})
</script>

<style scoped>
.q-table tbody td:before {
  background: rgba(0, 0, 0, 0);
}
</style>
