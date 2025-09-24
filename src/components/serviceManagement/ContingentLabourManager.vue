<template>
  <div class="text-h6 q-mb-md q-mt-lg">
    {{ OrganisationTypeMethods.changeConsultant(isBuiltEnvironment, { isPlural: true }) }} engaged on this service:
    ({{ engagements.length }})
  </div>
  <q-table
    flat
    wrap-cells
    :rows="rows"
    :columns="columns"
    row-key="service"
    hide-pagination
    class="max-w-full bordered q-mb-md"
    table-header-class="text-weight-bolder text-primary"
    color="primary"
  >
    <template v-slot:body-cell-projects="props">
      <q-td :props="props">
        <text-with-show-more :text="props.value" :show-more-words="10" />
      </q-td>
    </template>
    <template v-slot:body-cell-purchase_order="props">
      <q-td :props="props">
        <div class="row">
          <div class="col">
            <div>{{ props.row.purchase_order.reference }}</div>
            <div>
              {{
                [props.row.purchase_order.start_date, props.row.purchase_order.end_date].filter(val => val).join(" - ")
              }}
            </div>
            <div>
              {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, props.row.purchase_order.amount) }}
            </div>
          </div>
          <div v-if="isContractOwner" class="col">
            <q-btn size="sm" flat icon="edit" :to="serviceBuilderLink" />
          </div>
        </div>
      </q-td>
    </template>
    <template v-slot:bottom-row>
      <q-tr>
        <q-td> Totals:</q-td>
        <q-td :colspan="columns.length - 7" />
        <q-td class="text-center">
          {{ totals.units }}
        </q-td>
        <q-td class="text-right">
          {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, totals.budget) }}
        </q-td>
        <q-td>
          {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, totals.poBudget) }}
        </q-td>
      </q-tr>
    </template>
    <template v-slot:bottom>
      <div>
        <div class="text-subtitle2 text-weight-bold" :class="balances.budget < 0 ? 'text-negative' : ''">
          Remaining service budget (deployed orders only):
          {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, balances.budget) }} ({{
            parseInt(Math.floor(balances.percent))
          }}% of total)
        </div>
        <div class="text-subtitle2 text-weight-bold" :class="balances.budget < 0 ? 'text-negative' : ''">
          Remaining service budget (including all pending orders):
          {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, balances.budgetIncPending) }} ({{
            parseInt(Math.floor(balances.percentIncPending))
          }}% of total)
        </div>
      </div>
    </template>
  </q-table>
  <div v-if="!engagements.length">
    There are no {{
      OrganisationTypeMethods.changeConsultant(isBuiltEnvironment, {
        isPlural: true,
        isCamelCase: false
      })
    }} yet deployed on this service
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import TextWithShowMore from "components/common/text/TextWithShowMore.vue"

const store = useStore()

const props = defineProps({
  requests: { type: Array, default: () => [] },
  service: { type: Object, default: () => ({}) },
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null }
})

const pendingBudget = ref(0)

const organisation = computed(() => store.getters["admin/getOrganisation"])
const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const vendorId = computed(() => props.vendor_id)
const organisationId = computed(() => {
  if (props.vendor_id) {
    return props.vendor_id
  } else if (props.customer_id) {
    return props.customer_id
  }
  return null
})
const isContractOwner = computed(() => {
  const ownerId = props.service.contract.contract_owner_organisation_id
  return Number(ownerId) === Number(organisationId.value)
})
const serviceBuilderLink = computed(() => {
  let link = "/"
  if (props.vendor_id) {
    link = "/vendor/" + props.vendor_id + "/contracts/" + props.service.contract_id + "/services/" + props.service.id
  } else if (props.customer_id) {
    link = "/customer/" + props.customer_id + "/contracts/" + props.service.contract_id + "/services/" + props.service.id
  }
  return link
})
const totals = computed(() => {
  let units = 0
  let budget = 0
  let poBudget = 0
  engagements.value.forEach(engagement => {
    units += Number(engagement.units)
    budget += Number(engagement.budget)
    poBudget += Number(engagement.purchase_order.amount)
  })

  return { units: units, budget: budget, poBudget: poBudget }
})
const balances = computed(() => {
  const budget = props.service.value - totals.value.budget
  const budgetIncPending = budget - pendingBudget.value
  const percent = (budget / props.service.value) * 100
  const percentIncPending = (budgetIncPending / props.service.value) * 100

  return { budget: budget, percent: percent, budgetIncPending: budgetIncPending, percentIncPending: percentIncPending }
})
const engagements = computed(() => {
  const engagementList = []
  if (props.requests && props.requests.length) {
    props.requests.forEach(request => {
      const engagement = JSON.parse(JSON.stringify(request.consultant_engagements[0]))
      if (engagement) {
        engagement.purchase_order = request.purchase_order
        engagementList.push(engagement)
      }
    })
  }
  return engagementList
})
const columns = computed(() => {
  const c = [
    {
      name: "consultant",
      label: OrganisationTypeMethods.changeConsultant(isBuiltEnvironment.value),
      field: "consultant",
      align: "left"
    },
    { name: "capability", label: "Capability", field: "capability", align: "left" }
  ]

  if (props.service?.has_competency) {
    c.push({ name: "competency", label: "Competency", field: "competency", align: "left" })
  }

  if (vendorId.value !== null) {
    c.push({ name: "pay_rate", label: "Pay Rate", field: "pay_rate", align: "right" })
  }

  c.push(
    { name: "charge_rate", label: "Charge Rate", field: "charge_rate", align: "right" },
    { name: "units", label: "Units", field: "units", align: "center" },
    { name: "budget", label: "Budget", field: "budget", align: "right" },
    { name: "purchase_order", label: "Purchase Order", field: "purchase_order", align: "left" },
    { name: "start_date", label: "Start Date", field: "start_date", align: "center" },
    { name: "end_date", label: "End Date", field: "end_date", align: "center" },
    { name: "projects", label: "Projects", field: "projects", align: "left" }
  )
  return c
})
const rows = computed(() => {
  const rows = []
  if (engagements.value.length) {
    engagements.value.forEach(engagement => {
      const row = {
        consultant: engagement.consultant.user.fullName,
        capability: engagement.request_capability.capability.name,
        competency: engagement?.competency?.name,
        units: engagement.units,
        pay_rate: CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, engagement.pay_rate),
        charge_rate: CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, engagement.charge_rate),
        budget: CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, engagement.budget),
        purchase_order: engagement.purchase_order,
        start_date: engagement.start_date,
        end_date: engagement.end_date,
        projects: projectList(engagement.projects)
      }
      rows.push(row)
    })
  }
  return rows
})

//Budget for orders not yet deployed
const getPendingOrders = () => {
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

function projectList(a) {
  let arr = []
  if (a && a.length) {
    arr = a.map(item => {
      return item.project.name
    })
  }
  return arr.join(", ")
}

onMounted(() => {
  getPendingOrders()
})
</script>
