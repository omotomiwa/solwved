<template>
  <q-page :class="cc?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Contract Change Requests</div>
      <BreadCrumb align="center" :organisation="organisation" v-if="organisation" />
      <div v-if="isAuthorised" class="column q-mt-lg">
        <q-btn
          class="col-xs-2 col-lg-2"
          color="primary"
          text-color="dark"
          model-value="newRaidLogForm"
          options="newRaidLogFormOptions"
          style="width: 300px"
          @click="createNew"
          icon="add"
        >
          New Contract Change Request
        </q-btn>

        <q-item class="q-mb-md q-pt-lg">
          <q-item-section>Please choose a Contract Change Request</q-item-section>
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
                  @click.stop="onViewClicked(props.row)"
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
  name: "ContractChangeRequests",
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup>
import { date, useQuasar } from "quasar"
import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import { vendorAuth, customerAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations, Config } from "src/modules/StaticData.js"
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

const organisationType = ref(null)
const changeRequestType = "contract"
let organisation
let isAuthorised
if (props.vendor_id) {
  organisationType.value = "vendor"
  const obj = vendorAuth(props.vendor_id)
  organisation = obj.vendor
  isAuthorised = obj.isAuthorised
} else if (props.customer_id) {
  organisationType.value = "customer"
  const obj = customerAuth(props.customer_id)
  organisation = obj.customer
  isAuthorised = obj.isAuthorised
}

let firstCols = [
  {
    name: "requestDate",
    label: "Date",
    field: "created_at",
    align: "center",
    sortable: true,
    sortOrder: "da",
    rawSort: (a, b) => date.getDateDiff(DateMethods.convertDateTimeFormat(a), DateMethods.convertDateTimeFormat(b), "second"),
    format: val => val ? date.formatDate(DateMethods.convertDateTimeFormat(val), Config.DATE_FORMAT_DMY) : "-"
  }
]
if (props.vendor_id) {
  firstCols = [
    ...firstCols,
    { name: "vendor", label: "Vendor", field: "vendor", align: "left", sortable: true },
    { name: "customer", label: "Customer", field: "customer", align: "left", sortable: true }
  ]
}
if (props.customer_id) {
  firstCols = [
    ...firstCols,
    { name: "customer", label: "Customer", field: "customer", align: "left", sortable: true },
    { name: "vendor", label: "Vendor", field: "vendor", align: "left", sortable: true }
  ]
}

const organisationId = ref(null)
const pagination = ref({
  rowsPerPage: 20 // current rows per page being displayed
})
const columns = ref([
  ...firstCols,
  { name: "contract", label: "Contract", field: "contract", align: "left", sortable: true },
  { name: "title", label: "Title", field: "title", align: "left", classes: "max-350", sortable: true },
  { name: "requestedBy", label: "Created By", field: "requested_by", align: "left", sortable: true },
  { name: "status", label: "Status", field: "status", align: "center", sortable: true },
  { name: "actions", label: "Actions", field: "actions", align: "center" }
])

const cc = computed(() => ClassCombinations)
const changeRequests = computed(() => store.getters["common/getChangeRequests"])
const rows = computed(() => {
  const rz = []

  if (changeRequests.value.length > 0) {
    changeRequests.value.forEach(r => {
      const row = {
        id: r.id,
        customer: r?.contract?.customer?.name,
        vendor: r?.contract?.vendor?.name,
        title: r?.title,
        contract: r?.contract?.reference,
        requested_by: r?.requested_by?.fullName,
        created_at: r?.created_at,
        status: StringMethods.ucfirst(r?.status?.name ?? ""),
        status_id: r?.status_id
      }
      rz.push(row)
    })
  }
  return rz
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

  let filter = "filter[" + organisationType.value + "_id]=" + organisationId.value
  getChangeRequests(filter)
})

onUnmounted(() => {
  store.dispatch("common/clearChangeRequests")
})

watch(organisation, newVal => {
  if (newVal && newVal.id) {
    let filter = "filter[" + organisationType.value + "_id]=" + organisation.value.id
    getChangeRequests(filter)
  }
})

function getChangeRequests(filter) {
  store.dispatch(
    "common/getChangeRequests",
    { type: changeRequestType, filter: filter }
  )
}

function onViewClicked(row) {
  const route = `/${organisationType.value}/${organisation.value.id}/service-management/contract-change-requests/${row.id}`
  router.push({ path: route })
}

function createNew() {
  const route = `/${organisationType.value}/${organisation.value.id}/service-management/contract-change-requests/new`
  router.push({ path: route })
}
</script>
