<template>
  <div class="text-h6 q-mb-md q-mt-lg">Active Requests on this service: ({{ rows.length }})</div>
  <div>
    <q-table
      flat
      :rows="rows"
      :columns="columns"
      row-key="id"
      hide-pagination
      :pagination="{ rowsPerPage: 0 }"
      class="max-w-full bordered q-mb-md"
      table-header-class="text-weight-bolder text-primary"
      color="primary"
      wrap-cells
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
            <div v-if="col.name === 'purchase_order'" class="row">
              <div class="col">
                <div>{{ props.row.purchase_order.reference }}</div>
                <div>{{ props.row.purchase_order.start_date }} - {{ props.row.purchase_order.end_date }}</div>
                <div>
                  {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, props.row.purchase_order.amount) }}
                </div>
              </div>
              <div v-if="isContractOwner" class="col">
                <q-btn size="sm" flat icon="edit" :to="serviceBuilderLink" />
              </div>
            </div>
            <span v-else>{{ col.value }}</span>
          </q-td>
          <q-td auto-width>
            <q-btn
              v-if="vendorId"
              :icon="props.expand ? 'expand_less' : 'expand_more'"
              style="width: 9em"
              size="sm"
              padding="xs sm"
              align="left"
              color="primary"
              outline
              dense
              unelevated
              @click="props.expand = !props.expand"
              :label="props.expand ? 'Close' : 'Manage'"
            />
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <request-manager
              :request="props.row"
              :consultants="consultants"
              :projects="projects"
              :vendor-id="vendorId"
              class="q-mb-lg"
            />
          </q-td>
        </q-tr>
      </template>
      <template v-slot:bottom-row>
        <q-tr class="text-weight-bold" :class="totalsColor">
          <q-td colspan="6">
            <div :class="subTotalRequests.budgetTotal < props.service.value ? 'text-positive' : ''">
              {{ totalsMessage }}
            </div>
            <div
              v-if="serviceBalance !== balanceIncPending"
              :class="balanceIncPending >= 0 ? 'text-positive' : 'text-negative'"
            >
              {{
                `Remaining service balance including pending orders: ${CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, balanceIncPending)}`
              }}
            </div>
          </q-td>
          <q-td>Total:</q-td>
          <q-td class="text-right">
            {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, subTotalRequests.budgetTotal) }}
          </q-td>
          <q-td>
            {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, subTotalRequests.poTotal) }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"
import RequestManager from "src/components/serviceManagement/RequestManager.vue"

const store = useStore()

const props = defineProps({
  requests: { type: Array, default: () => [] },
  service: { type: Object, default: () => ({}) },
  vendorId: { type: String, default: null },
  customerId: { type: String, default: null }
})

const pendingBudget = ref(0)

const organisation = computed(() => store.getters["admin/getOrganisation"])
const columns = computed(() => [
  { name: "request_date", label: "Agreement Date", field: "request_date", align: "center" },
  { name: "service_line", label: "Service Line", field: "service_line", align: "left" },
  { name: "requested_by", label: "Requested By", field: "requested_by", align: "left" },
  { name: "service_owner", label: "Service Owner", field: "service_owner", align: "left" },
  { name: "start_date", label: "Start Date", field: "start_date", align: "center" },
  { name: "end_date", label: "End Date", field: "end_date", align: "center" },
  { name: "units", label: "Units", field: "units", align: "center" },
  {
    name: "budget",
    label: "Budget",
    field: "budget",
    align: "right",
    format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
  },
  { name: "purchase_order", label: "Purchase Order", field: "purchase_order", align: "left" }
])
const vendorId = computed(() => props.vendorId)
const customerId = computed(() => props.customerId)
const organisationId = computed(() => {
  if (props.vendorId) {
    return props.vendorId
  } else if (props.customerId) {
    return props.customerId
  }
  return null
})
const isContractOwner = computed(() => {
  const ownerId = props.service.contract.contract_owner_organisation_id
  return Number(ownerId) === Number(organisationId.value)
})
const rows = computed(() => {
  const rows = []
  props.requests.forEach(request => {
    const obj = {
      id: request.id,
      service_line: request.service_line?.name,
      capabilities: request.capabilities,
      competency_id: request.competency_id,
      competency_name: getCompetencyName(request),
      request_date: request.request_date,
      requested_by: request.service_requester?.fullName,
      service_owner: request.service_owner?.fullName,
      start_date: request.start_date,
      end_date: request.end_date,
      units: request.units,
      budget: request.budget,
      engagements: request.consultant_engagements,
      purchase_order: request.purchase_order
    }
    rows.push(obj)
  })
  return rows
})
const subTotalRequests = computed(() => {
  let sub = 0
  let poSub = 0
  if (Array.isArray(props.requests) && props.requests.length) {
    props.requests.forEach(request => {
      sub += Number(request.budget)
      poSub += Number(request.purchase_order.amount)
    })
  }
  return { budgetTotal: sub, poTotal: poSub }
})
const serviceBalance = computed(() => props.service.value - subTotalRequests.value.budgetTotal)
const balanceIncPending = computed(() => props.service.value - subTotalRequests.value.budgetTotal - pendingBudget.value)
const totalsMessage = computed(() => {
  let m = ""
  if (subTotalRequests.value.budgetTotal > props.service.value) {
    const overBudget = subTotalRequests.value.budgetTotal - props.service.value
    m = "Warning, the requests sub total has breached the service value by " +
      CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, overBudget)
  }
  if (subTotalRequests.value.poTotal > props.service.value) {
    const overBudget = subTotalRequests.value.poTotal - props.service.value
    m += "Warning, the PO sub total has breached the service value by " +
      CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, overBudget)
  }
  if (subTotalRequests.value.budgetTotal <= props.service.value) {
    const underBudget = props.service.value - subTotalRequests.value.budgetTotal
    m = "Remaining service budget " + CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, underBudget)
  }
  return m
})
const totalsColor = computed(() => {
  return subTotalRequests.value.budgetTotal > props.service.value ? "text-negative" : ""
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
const consultants = computed(() => {
  if (props.vendorId === null) {
    return []
  }
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
const competencies = computed(() => store.getters["common/getCompetencies"])
const projects = computed(() => props.service.contract.projects)

function getPendingOrders() {
  store.dispatch("common/pendingCustomerRequestsByService", props.service.id).then(res => {
    let budget = 0
    if (res && res.length > 0) {
      res.forEach(order => {
        if (order.capabilities && order.capabilities.length) {
          order.capabilities.forEach(capability => {
            budget += capability.budget
          })
        }
      })
    }
    pendingBudget.value = budget
  })
}

function getCompetencyName(request) {
  let name = ""
  if (competencies.value.length) {
    const competency = competencies.value.find(competency => competency.id === request.competency_id)
    name = competency?.name
  }
  return name
}

function getCompetencies(force) {
  if (competencies.value.length < 1 || force) {
    store.dispatch("common/getCompetencies")
  }
}

onMounted(() => {
  //getConsultants()
  getCompetencies()
  getPendingOrders()
})
</script>

<style lang="scss" scoped>
.q-table tbody td:before {
  background: transparent;
}

.long-label {
  width: 10rem;
  min-width: 10rem;
}
</style>
