<template>
  <q-page :class="cc?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Change Requests</div>
      <BreadCrumb align="center" :organisation="organisation" v-if="organisation" />
      <div v-if="isAuthorised" class="column q-mt-lg">
        <q-btn
          class="col-xs-2 col-lg-2"
          color="primary"
          text-color="dark"
          model-value="newRaidLogForm"
          options="newRaidLogFormOptions"
          style="width: 250px"
          @click="btnClick(0)"
          icon="add"
        >
          New Change Request
        </q-btn>

        <q-item class="q-mb-md q-pt-lg">
          <q-item-section>Please choose a Change Request</q-item-section>
        </q-item>
        <q-table
          flat
          :grid="$q.screen.xs"
          selection="none"
          :rows="rows"
          :columns="columns"
          wrap-cells
          row-key="id"
          :pagination="pagination"
          class="bordered"
          table-header-class="text-weight-bolder text-primary"
          color="primary"
          binary-state-sort
        >

          <template #body-cell-title="props">
            <q-td :props="props">
              <text-with-show-more :show-more-words="15" :text="props.value ?? '-'" />
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props">
              <div>
                <q-btn
                  dense
                  label="View"
                  padding="xs md"
                  size="sm"
                  color="primary"
                  outline
                  @click.stop="btnClick(props.row)"
                />
              </div>
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
  name: "ChangeRequests",
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup>
import { date, useQuasar } from "quasar"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import { computed, onMounted, ref } from "vue"
import { ClassCombinations, Config } from "src/modules/StaticData.js"
import { vendorAuth, customerAuth } from "src/modules/AuthLogic.js"
import { DateMethods, StringMethods } from "src/modules/GlobalMethods.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import TextWithShowMore from "components/common/text/TextWithShowMore.vue"

const $q = useQuasar()
const store = useStore()
const router = useRouter()

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null }
})

let organisation
let isAuthorised
if (props.vendor_id) {
  const obj = vendorAuth(props.vendor_id)
  organisation = obj.vendor
  isAuthorised = obj.isAuthorised
} else if (props.customer_id) {
  const obj = customerAuth(props.customer_id)
  organisation = obj.customer
  isAuthorised = obj.isAuthorised
}

let firstCols = []
if (props.vendor_id) {
  firstCols = [
    { name: "vendor", label: "Vendor", field: "vendor", align: "left", sortable: true },
    { name: "customer", label: "Customer", field: "customer", align: "left", sortable: true }
  ]
}
if (props.customer_id) {
  firstCols = [
    { name: "customer", label: "Customer", field: "customer", align: "left" },
    { name: "vendor", label: "Vendor", field: "vendor", align: "left" }
  ]
}

const organisationType = ref(null)
const organisationId = ref(null)
const changeType = ref(null)
const columns = ref([
  {
    name: "created_at",
    label: "Date",
    field: "created_at",
    align: "center",
    sortable: true,
    sortOrder: "da",
    rawSort: (a, b) => date.getDateDiff(DateMethods.convertDateTimeFormat(a), DateMethods.convertDateTimeFormat(b), "second"),
    format: val => val ? date.formatDate(DateMethods.convertDateTimeFormat(val), Config.DATE_FORMAT_DMY) : "-"
  },
  ...firstCols,
  { name: "title", label: "Title", field: "title", align: "left", sortable: true, classes: "max-350" },
  { name: "contract", label: "Contract", field: "contract", align: "left", sortable: true },
  { name: "service", label: "Service", field: "service", align: "left", sortable: true },
  { name: "requestedBy", label: "Created By", field: "requested_by", align: "left", sortable: true },
  {
    name: "status",
    label: "Status",
    field: "status",
    align: "center",
    sortable: true,
    rawSort: (a, b, aRow, bRow) => aRow.status_id - bRow.status_id
  },
  { name: "actions", label: "Actions", field: "actions", align: "center" }
])
const pagination = ref({
  sortBy: "created_at",
  descending: true,
  rowsPerPage: 20 // current rows per page being displayed
})

const cc = computed(() => ClassCombinations)
const changeRequests = computed(() => store.getters["common/getChangeRequests"])
const rows = computed(() => {
  const rz = []

  if (changeRequests.value.length > 0) {
    changeRequests.value.forEach(r => {
      const row = {
        id: r.id,
        customer: r?.contract_detail?.customer?.name,
        vendor: r?.contract_detail?.vendor?.name,
        title: r?.title,
        contract: r?.contract_detail?.reference,
        service: r?.service?.name,
        requested_by: r?.requested_by?.fullName,
        created_at: r?.created_at,
        status: StringMethods.ucfirst(r?.status?.name ?? ""),
        status_id: r?.status_id
      }
      rz.push(row)
    })
  }
  return rz.sort((a, b) => (a.created_at < b.created_at ? 1 : b.created_at < a.created_at ? -1 : 0))
})

onMounted(() => {
  if (props.vendor_id) {
    organisationType.value = "vendor"
    organisationId.value = props.vendor_id
  }

  if (props.customer_id) {
    organisationType.value = "customer"
    organisationId.value = props.customer_id
  }

  // The type is either service or contract
  changeType.value = "service"

  let filter = "filter[" + organisationType.value + "_id]=" + organisationId.value
  getChangeRequests(filter)
})

function getChangeRequests(filter) {
  store.dispatch(
    "common/getChangeRequests",
    { type: changeType.value, filter: filter }
  )
}

function btnClick(row) {
  let theExtra = row ? row.id : "new"
  let route = ""
  if (props.vendor_id) {
    route = "/vendor/" + props.vendor_id + "/service-management/change-requests/" + theExtra
  }
  if (props.customer_id) {
    route = "/customer/" + props.customer_id + "/service-management/change-requests/" + theExtra
  }
  router.push({ path: route })
}
</script>
