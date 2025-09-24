<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Order Management</div>
      <BreadCrumb align="center" :organisation="organisation" v-if="isAuthorised" />

      <div v-if="isAuthorised" class="q-mt-lg max-w-full">
        <q-btn
          v-if="customer_id"
          class="q-mb-lg"
          icon="add"
          label="Create New Order"
          color="primary"
          text-color="dark"
          model-value="newRaidLogForm"
          options="newRaidLogFormOptions"
          @click="btnClick(0)"
        />
        <div class="q-mb-md">Please choose a customer service request</div>
        <q-table
          flat
          :grid="$q.screen.xs"
          selection="none"
          :rows="rows"
          :columns="columns"
          row-key="id"
          :pagination="pagination"
          wrap-cells
          class="bordered max-w-full"
          table-header-class="text-weight-bolder text-primary"
          color="primary"
        >
          <template #body-cell-notes="props">
            <q-td :props="props">
              <text-with-show-more :text="props.value" :show-more-words="10" />
            </q-td>
          </template>
          <template #body-cell-link="props">
            <q-td :props="props">
              <div>
                <q-badge color="purple" :label="props.value" />
                <q-btn icon="info" dense flat @click.stop="btnclick" />
              </div>
            </q-td>
          </template>
          <template #body-cell-action="props">
            <q-td :props="props">
              <q-btn
                color="primary"
                outline
                label="View"
                padding="xs md"
                size="sm"
                @click="onRowClick(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "ServiceRequests",
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup>
import { date, useQuasar } from "quasar"
import { computed, onMounted, ref } from "vue"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import { ClassCombinations, Config } from "src/modules/StaticData.js"
import { vendorAuth, customerAuth } from "src/modules/AuthLogic.js"
import { DateMethods } from "src/modules/GlobalMethods.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import TextWithShowMore from "components/common/text/TextWithShowMore.vue"

const $q = useQuasar()
const store = useStore()
const router = useRouter()

const statuses = ["Submitted", "Dialogue", "Accepted", "Active", "Rejected", "Archived"]

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null },
  request_status: { type: String, default: null },
  archived: { type: String, default: null }
})

let organisation
let isAuthorised
let firstCol = {}
if (props.vendor_id) {
  let vendor;
  ({ vendor, isAuthorised } = vendorAuth(props.vendor_id))
  organisation = vendor

  firstCol = { name: "customer", label: "Customer", field: "customer" }
}
if (props.customer_id) {
  let customer;
  ({ customer, isAuthorised } = customerAuth(props.customer_id))
  organisation = customer

  firstCol = { name: "vendor", label: "Vendor", field: "vendor" }
}

const columns = ref([
  {
    name: "requestDate",
    label: "Date",
    field: "request_date",
    align: "center",
    format: val => val ? date.formatDate(DateMethods.convertDateTimeFormat(val), Config.DATE_FORMAT_DMY) : "-"
  },
  { name: firstCol.name, label: firstCol.label, field: firstCol.field, align: "left" },
  { name: "contract", label: "Contract", field: "contract", align: "left" },
  { name: "service", label: "Service", field: "service", align: "left" },
  { name: "service_line", label: "Category / Service Line", field: "service_line", align: "center" },
  { name: "delivery_model", label: "Delivery Model", field: "delivery_model", align: "center" },
  { name: "status", label: "Status", field: "status", align: "center" },
  { name: "notes", label: "Notes", field: "notes", align: "left" },
  {
    name: "updated",
    label: "Last Updated",
    field: "updated_at",
    align: "center",
    format: val => val ? date.formatDate(DateMethods.convertDateTimeFormat(val), Config.DATE_FORMAT_DMY) : "-"
  },
  { name: "action", label: "Actions", field: "action", align: "center" }
])
const statusFilter = ref("Active")
const pagination = ref({
  rowsPerPage: 20 // current rows per page being displayed
})

const requests = computed(() => store.getters["contract/getCustomerrequests"])
const rows = computed(() => {
  const rz = []

  requests.value.forEach(r => {
    const row = {
      id: r.id,
      customer: r.contract.customer.name,
      vendor: r.contract.vendor.name,
      contract: r.contract.reference,
      service: r.service.name,
      service_line: r?.service_line?.name,
      delivery_model: r?.service.delivery_model?.name,
      status: statuses[r.status],
      request_date: r.request_date,
      notes: r.notes,
      updated_at: r.updated_at
    }
    rz.push(row)
  })
  return rz
})

onMounted(() => {
  let filter = "open"
  const currentUrl = window.location.href
  if (currentUrl.includes("dialogue")) {
    filter = "dialogue"
    statusFilter.value = "Dialogue"
  }
  if (currentUrl.includes("accepted")) {
    filter = "accepted"
    statusFilter.value = "Accepted"
  }
  if (currentUrl.includes("active")) {
    filter = "active"
    statusFilter.value = "Active"
  }
  if (currentUrl.includes("rejected")) {
    filter = "rejected"
    statusFilter.value = "Rejected"
  }
  if (currentUrl.includes("archived")) {
    filter = "archived"
    statusFilter.value = "Archived"
  }
  getRequests(filter)
})

function getRequests(filter) {
  filter = "filter[status]=" + filter
  const obj = {
    serviceId: null, // selectedService,
    matchVendor: "matchVendor",
    matchVendorId: props.vendor_id,
    matchCustomer: "matchCustomer",
    matchCustomerId: props.customer_id,
    filter: filter
  }
  store.dispatch("contract/customerrequests", obj)
  $q.loading.hide()
}

function onRowClick(row) {
  let path = ""
  if (props.vendor_id) {
    path = "/vendor/" + props.vendor_id + "/order-management/" + row.id
  }
  if (props.customer_id) {
    path = "/customer/" + props.customer_id + "/order-management/" + row.id
  }

  router.push({ path: path })
}

function btnClick(row) {
  const theId = row ? row.id : "new"
  let route = ""
  if (props.vendor_id) {
    route = "/vendor/" + props.vendor_id + "/order-management/" + theId
  }
  if (props.customer_id) {
    route = "/customer/" + props.customer_id + "/order-management/" + theId
  }
  router.push({ path: route })
}
</script>
