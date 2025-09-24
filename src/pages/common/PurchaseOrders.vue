<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Purchase Orders</div>
      <BreadCrumb align="center" :organisation="organisation" v-if="organisation" />
      <div v-if="isAuthorised">
        <div class="row items-center q-col-gutter-sm q-my-lg">
          <q-input
            class="col-12 col-md-6 col-lg-3"
            v-model="searchString"
            filled
            type="search"
            label="Search Reference"
            stack-label
            color="primary"
            borderless
            outlined
            label-color="white"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <new-selector-form
            v-model:option_id="selectedOrganisationId"
            classes="col-12 col-md-6 col-lg-3"
            :options="organisations"
            is-filterable
            filter-key="name"
            :label="props.vendor_id ? 'Customer' : 'Vendor'"
            default-class="full-width"
            multiple
            use-chips
          />
          <new-selector-form
            v-model:option_id="selectedContractId"
            classes="col-12 col-md-6 col-lg-3"
            :options="contracts"
            is-filterable
            filter-key="name"
            label="Contract"
            default-class="full-width"
            :disabled="selectedOrganisationId.length === 0"
            multiple
            use-chips
          />
          <new-selector-form
            v-model:option_id="selectedDeliveryModelId"
            classes="col-12 col-md-6 col-lg-3"
            :options="deliveryModels"
            is-filterable
            filter-key="name"
            label="Delivery Model"
            default-class="full-width"
            multiple
            use-chips
          />
          <new-selector-form
            v-model:option_id="selectedServiceId"
            classes="col-12 col-md-6 col-lg-3"
            :options="services"
            is-filterable
            filter-key="name"
            label="Service"
            default-class="full-width"
            :disabled="selectedContractId.length === 0"
            multiple
            use-chips
          />
          <new-selector-form
            v-model:option_id="selectedApprovalStatusId"
            classes="col-12 col-md-6 col-lg-3"
            :options="approvalOptions"
            is-filterable
            filter-key="name"
            label="Approved"
            default-class="full-width"
            multiple
            use-chips
          />
          <new-selector-form
            v-model:option_id="selectedActivityStatusId"
            classes="col-12 col-md-6 col-lg-3"
            :options="activityOptions"
            is-filterable
            filter-key="name"
            label="Activity Status"
            default-class="full-width"
            multiple
            use-chips
          />
        </div>
        <q-table
          flat
          wrap-cells
          :rows="rows"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 50 }"
          class="col bordered padding-dense"
          table-header-class="text-weight-bolder text-primary"
          color="primary"
        >
          <template v-slot:header-cell-util="props">
            <q-th :props="props">
              {{ props.col.label }}
              <q-tooltip
                transition-show="fade"
                transition-hide="fade"
                transition-duration="200"
                :delay="400"
                class="bg-accent"
                anchor="top middle"
              >
                Utilisation
              </q-tooltip>
            </q-th>
          </template>
          <template v-slot:body-cell-approved="props">
            <q-td :props="props">
              <span :class="props.value === 1 ? 'text-positive' : 'text-negative'">
                <q-icon :name="props.value === 1 ? 'done' : 'hourglass_top'" style="font-size: 1.5em" />
              </span>
            </q-td>
          </template>
          <template v-slot:body-cell-spend="props">
            <q-td :props="props">
              <q-btn v-if="props.value" size="sm" flat icon="receipt_long" @click="loadPoSpendModal(props.value)" />
            </q-td>
          </template>
          <template v-slot:body-cell-util="props">
            <q-td :props="props">
              <span v-if="props.value >= 90" class="text-red">{{ props.value }}%</span>
              <span v-else-if="props.value >= 75 && props.value < 90" class="text-orange">{{ props.value }}%</span>
              <span v-else class="text-green">{{ props.value }}%</span>
            </q-td>
          </template>
          <template v-slot:body-cell-link="props">
            <q-td :props="props">
              <q-btn v-if="props.value" size="sm" flat icon="edit" :to="props.value" />
            </q-td>
          </template>
        </q-table>
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
    <q-dialog v-model="showSpendDialog">
      <purchase-order-spend-widget :po="selectedPo" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar"
import { computed, onMounted, ref } from "vue"
import { useStore } from "vuex"
import { DateTime } from "luxon"
import { CurrencyMethods, DateMethods } from "src/modules/GlobalMethods.js"
import { customerAuth, vendorAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations } from "src/modules/StaticData.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import PurchaseOrderSpendWidget from "src/components/common/PurchaseOrderSpendWidget.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

const store = useStore()
const $q = useQuasar()

const approvalOptions = [
  { id: 1, name: "Approved" },
  { id: 0, name: "Not Approved" }
]
const activityOptions = [
  { id: 1, name: "Active" },
  { id: 2, name: "Expiring within 30 days" },
  { id: 3, name: "Expiring within 7 days" },
  { id: 4, name: "Expired" }
]

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null }
})

let isAuthorised = false
let organisation = undefined
let organisationType
let otherOrganisationType

if (props.vendor_id) {
  isAuthorised = vendorAuth(props.vendor_id).isAuthorised
  organisation = vendorAuth(props.vendor_id).vendor
  organisationType = "vendor"
  otherOrganisationType = "Customer"
}
if (props.customer_id) {
  isAuthorised = customerAuth(props.customer_id).isAuthorised
  organisation = customerAuth(props.customer_id).customer
  organisationType = "customer"
  otherOrganisationType = "Vendor"
}

const showSpendDialog = ref(false)
const selectedPo = ref(null)
const searchString = ref("")
const selectedOrganisationId = ref([])
const selectedContractId = ref([])
const selectedDeliveryModelId = ref([])
const selectedServiceId = ref([])
const selectedApprovalStatusId = ref([])
const selectedActivityStatusId = ref([])

const organisationDetail = computed(() => store.getters["admin/getOrganisation"])
const purchaseOrders = computed(() => store.getters["contract/getOrganisationPurchaseOrders"](organisation?.value?.id))
const columns = computed(() => {
  return [
    { name: "reference", label: "Reference", field: "reference", align: "left" },
    { name: "organisation", label: otherOrganisationType, field: "organisation", align: "left" },
    { name: "contract", label: "Contract", field: "contract", align: "left" },
    { name: "service", label: "Service", field: "service", align: "left" },
    { name: "delivery_model", label: "Delivery Model", field: "delivery_model", align: "left" },
    {
      name: "value",
      label: "Value",
      field: "value",
      align: "right",
      format: val => CurrencyMethods.toCurrencyFormat(organisationDetail.value?.currency?.code, val)
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
    { name: "approved", label: "Approved", field: "approved", align: "center" },
    { name: "milestones", label: "Milestones", field: "milestones", align: "center" },
    { name: "spend", label: "Spend", field: "spend", align: "center" },
    { name: "util", label: "Util.", field: "util", align: "right" },
    { name: "link", label: "Edit", field: "link", align: "center" }
  ]
})
const rows = computed(() => {
  const r = []
  if (purchaseOrders.value && purchaseOrders.value.length && otherOrganisationType) {
    purchaseOrders.value.forEach(po => {
      if (
        matchesSearch(po) &&
        matchesOrg(po) &&
        matchesContract(po) &&
        matchesDeliveryModel(po) &&
        matchesService(po) &&
        matchesApprovalStatus(po) &&
        matchesActivityStatus(po)
      ) {
        const obj = {
          id: po.id,
          reference: po.reference,
          organisation: po.service.contract[otherOrganisationType.toLowerCase()].name,
          contract: po.service.contract.reference,
          service: po.service.name,
          delivery_model: po.service.delivery_model.name,
          value: po.amount,
          start_date: po.start_date,
          end_date: po.end_date,
          approved: po.approved,
          milestones: po.milestones.length,
          spend: po,
          util: parseFloat(((po.total_spend * 100) / po.amount) || 0).toFixed(2),
          link: getServicePageLink(po)
        }
        r.push(obj)
      }
    })
  }
  return r
})
const organisations = computed(() => {
  const orgs = []
  if (purchaseOrders.value && purchaseOrders.value.length && otherOrganisationType) {
    purchaseOrders.value.forEach(po => {
      const org = po.service.contract[otherOrganisationType.toLowerCase()]
      const exists = orgs.find(item => item.id === org.id)
      if (!exists) {
        orgs.push({
          id: org.id,
          name: org.name
        })
      }
    })
  }
  return orgs
})
const contracts = computed(() => {
  const c = []
  if (purchaseOrders.value && purchaseOrders.value.length && otherOrganisationType) {
    purchaseOrders.value.forEach(po => {
      const contract = po.service.contract
      const organisationId = po.service.contract[otherOrganisationType.toLowerCase()].id
      const exists = c.find(item => item.id === contract.id)
      if (!exists && (selectedOrganisationId.value || []).includes(organisationId)) {
        c.push({
          id: contract.id,
          name: contract.reference
        })
      }
    })
  }
  return c
})
const deliveryModels = computed(() => {
  const m = []
  if (purchaseOrders.value && purchaseOrders.value.length) {
    for (let purchaseOrder of purchaseOrders.value) {
      const deliveryModel = purchaseOrder.service.delivery_model
      const exists = m.find(item => item.id === deliveryModel.id)
      if (!exists) {
        m.push({
          id: deliveryModel.id,
          name: deliveryModel.name
        })
      }
      if (m.length >= 4) {
        break
      }
    }
  }
  return m
})
const services = computed(() => {
  const s = []
  if (purchaseOrders.value && purchaseOrders.value.length) {
    purchaseOrders.value.forEach(po => {
      const service = po.service
      const contractId = po.service.contract.id
      const exists = s.find(item => item.id === service.id)
      if (!exists && (selectedContractId.value || []).includes(contractId)) {
        s.push({
          id: service.id,
          name: service.name
        })
      }
    })
  }
  return s
})

function getServicePageLink(po) {
  const ownerId = po.service.contract.contract_owner_organisation_id
  if (organisation?.value?.id === ownerId) {
    //then we allow the link
    return `/${organisationType}/${organisation?.value?.id}/contracts/${po.service.contract.id}/services/${po.service.id}`
  }
  return null
}

function loadPoSpendModal(po) {
  selectedPo.value = po
  showSpendDialog.value = true
}

function matchesSearch(po) {
  if (searchString.value && searchString.value === "") {
    return true
  }
  let reference = po.reference.toLowerCase()
  let search = searchString.value.toLowerCase()
  return reference.includes(search)
}

function matchesOrg(po) {
  return (selectedOrganisationId.value || []).length === 0 ||
    (selectedOrganisationId.value || []).includes(po.service.contract[otherOrganisationType.toLowerCase()].id)
}

function matchesContract(po) {
  return (selectedContractId.value || []).length === 0 ||
    (selectedContractId.value || []).includes(po.service.contract.id)
}

function matchesService(po) {
  return (selectedServiceId.value || []).length === 0 ||
    (selectedServiceId.value || []).includes(po.service.id)
}

function matchesDeliveryModel(po) {
  return (selectedDeliveryModelId.value || []).length === 0 ||
    (selectedDeliveryModelId.value || []).includes(po.service.delivery_model_id)
}

function matchesApprovalStatus(po) {
  return (selectedApprovalStatusId.value || []).length === 0 ||
    (selectedApprovalStatusId.value || []).includes(Number(po.approved))
}

function matchesActivityStatus(po) {
  if ((selectedActivityStatusId.value || []).length === 0) {
    return true
  }

  const now = DateTime.local().toJSDate().getTime()
  const thirtyDays = DateTime.local().plus({ days: 30 }).toJSDate().getTime()
  const sevenDays = DateTime.local().plus({ days: 7 }).toJSDate().getTime()

  let end_date = new Date(DateMethods.convertDateFormat(po.end_date)).getTime()

  return ((selectedActivityStatusId.value || []).includes(1) && end_date >= now)
    || ((selectedActivityStatusId.value || []).includes(2) && end_date >= now && end_date < thirtyDays)
    || ((selectedActivityStatusId.value || []).includes(3) && end_date >= now && end_date < sevenDays)
    || ((selectedActivityStatusId.value || []).includes(4) && end_date < now)

}

function getPurchaseOrders() {
  const obj = {}
  if (props.vendor_id) {
    obj.vendorId = props.vendor_id
  } else if (props.customer_id) {
    obj.customerId = props.customer_id
  }
  store.dispatch("contract/getOrganisationPurchaseOrders", obj).then(() => {
    $q.loading.hide()
  })
}

onMounted(() => {
  $q.loading.show()
  getPurchaseOrders()
})
</script>
