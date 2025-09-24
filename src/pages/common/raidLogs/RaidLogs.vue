<template>
  <q-page :class="cc?.pageContainer">
    <div class="column q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">
        {{ OrganisationTypeMethods.changeRaid(isBuiltEnvironment) }} Log
      </div>
      <BreadCrumb align="center" :organisation="organisation" v-if="organisation" />
      <div v-if="isAuthorised" class="column q-mt-lg">
        <q-btn
          class="q-mb-lg"
          color="primary"
          text-color="dark"
          model-value="newRaidLogForm"
          options="newRaidLogFormOptions"
          style="width: 200px"
          @click="btnClick(0)"
          icon="add"
        >
          New {{ OrganisationTypeMethods.changeRaid(isBuiltEnvironment) }} log
        </q-btn>
        <div class="q-mb-sm q-pa-md-sm">
          Please choose a {{ OrganisationTypeMethods.changeRaid(isBuiltEnvironment) }} log entry
        </div>

        <q-table
          flat
          :grid="$q.screen.xs"
          selection="none"
          :rows="rows"
          :columns="columns"
          row-key="id"
          :pagination="pagination"
          class="bordered"
          table-header-class="text-weight-bolder text-primary"
          color="primary"
          @row-click="onRowClick"
          binary-state-sort
        >
          <template #body-cell-actions="props">
            <q-td :props="props">
              <div>
                <q-btn
                  dense
                  outline
                  color="primary"
                  size="sm"
                  padding="xs md"
                  @click.stop="btnClick(props.row)"
                  label="View"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
      <div v-else class="q-my-lg">
        You are not authorised to view this page
        <div style="visibility: hidden">
          {{ badge }}
          {{ isVendorAdmin }}
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "RaidLogs",
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
import { DateMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"

const $q = useQuasar()
const store = useStore()
const router = useRouter()

const arrayProbabilityScore = [
  { value: 1, label: "Low" },
  { value: 2, label: "Moderate" },
  { value: 3, label: "High" },
  { value: 4, label: "Very High" }
]

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null }
})

const organisationType = ref(null)
const organisationId = ref(null)
const theArea = ref("null")
const pagination = ref({
  sortBy: "created_at",
  descending: true,
  rowsPerPage: 20 // current rows per page being displayed
})

let firstCol = {}
if (props.vendor_id) {
  firstCol = { name: "customer", label: "Customer", field: "customer" }
}
if (props.customer_id) {
  firstCol = { name: "vendor", label: "Vendor", field: "vendor" }
}

const badge = computed(() => store.getters["auth/getBadge"])
const cc = computed(() => ClassCombinations)
const user = computed(() => store.getters["auth/getUser"])
const raidLogs = computed(() => store.getters["common/getRaidLogs"])
const rows = computed(() => {
  const rz = []

  if (raidLogs.value.length > 0) {
    raidLogs.value.forEach(r => {
      const row = {
        id: r.id,
        customer: r.service.contract.customer.name,
        vendor: r.service.contract.vendor.name,
        contract: r.service.contract.reference,
        service: r.service.name,
        service_line: r.service_line_id ? r.service_line.name : " - ",
        consultant: r.consultant_id ? r.consultant.name : " - ",
        created_by: r.created_by.fullName,
        created_at: r.created_at,
        type: r.type.name,
        category: r.category.name,
        impact: r.impact.name,
        impact_score: r.impact_score,
        status: r.status.name,
        status_id: r.status_id,
        probability_score: mapProbabilityScore(r.probability_score),
        original_probability_score: r.probability_score
      }
      rz.push(row)
    })
  }
  return rz
})
const isVendorAdmin = computed(() => !!(user.value && user.value.roles && user.value.roles.indexOf("vendor_admin") > -1))
const organisation = computed(() => organisations.value.find(obj => parseInt(obj.id) === parseInt(organisationId.value)))
const organisations = computed(() => store.getters["admin/getOrganisations"])
const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const columns = computed(() => [
  {
    name: "requestDate",
    label: "Date",
    field: "created_at",
    align: "center",
    sortable: true,
    sortOrder: "da",
    rawSort: (a, b) => date.getDateDiff(DateMethods.convertDateTimeFormat(a), DateMethods.convertDateTimeFormat(b), "second"),
    format: val => val ? date.formatDate(DateMethods.convertDateTimeFormat(val), Config.DATE_FORMAT_DMY) : "-"
  },
  { name: firstCol.name, label: firstCol.label, field: firstCol.field, align: "left", sortable: true },
  { name: "contract", label: "Contract", field: "contract", align: "left", sortable: true },
  { name: "service", label: "Service", field: "service", align: "left", sortable: true },
  { name: "category", label: "Category", field: "category", align: "center", sortable: true },
  /*
  { name: 'service_line', label: 'Service Line', field: 'service_line', align: 'left' },
  { name: 'consultant', label: 'Consultant', field: 'consultant', align: 'left' },
  */
  { name: "createdBy", label: "Created By", field: "created_by", align: "left", sortable: true },
  {
    name: "status",
    label: "Status",
    field: "status",
    align: "center",
    sortable: true,
    rawSort: (a, b, aRow, bRow) => parseInt(aRow.status_id) - parseInt(bRow.status_id)
  },
  { name: "type", label: "Type", field: "type", align: "center", sortable: true },
  { name: "impact", label: "Impact", field: "impact", align: "center", sortable: true },
  { name: "impactScore", label: "Impact Score", field: "impact_score", align: "center", sortable: true },
  {
    name: "probabilityScore",
    label: "Probability Score",
    field: "probability_score",
    align: "center",
    sortable: true,
    rawSort: (a, b, aRow, bRow) => parseInt(aRow.original_probability_score) - parseInt(bRow.original_probability_score)
  },
  { name: "actions", label: "Actions", field: "actions", align: "center" }
])
const isAuthorised = computed(() => {
  if (props.customer_id) {
    return true
  }
  const result = organisations.value.find(obj => parseInt(obj.id) === parseInt(props.vendor_id))
  return !!result
})

onMounted(() => {
  let filter
  if (props.vendor_id) {
    organisationType.value = "vendor"
    organisationId.value = props.vendor_id
    theArea.value = "Vendor Area"
  }

  if (props.customer_id) {
    organisationType.value = "customer"
    organisationId.value = props.customer_id
    theArea.value = "Customer Area"
  }

  getOrganisations(true)

  store.dispatch("vendor/getVendorAccess").then(() => {
  }).catch(e => {
    alert(e.data.message || e.statusText)
  })

  filter = "filter[" + organisationType.value + "_id]=" + organisationId.value
  getRaidLogs(filter)
})

function mapProbabilityScore(val) {
  return arrayProbabilityScore[val - 1].label
}

function getOrganisations(force) {
  if (organisations.value.length < 1 || force) {
    const obj = {
      call: "organisations",
      method: "get"
    }
    store.dispatch("admin/datacallDt", obj)
    $q.loading.hide()
  }
}

function getRaidLogs(filter) {
  store.dispatch("common/getRaidLogs", filter)
}

function btnClick(row) {
  const raidLogId = row ? row.id : "new"
  let route = ""
  if (props.vendor_id) {
    route = "/vendor/" + props.vendor_id + "/service-management/raid/" + raidLogId
  }
  if (props.customer_id) {
    route = "/customer/" + props.customer_id + "/service-management/raid/" + raidLogId
  }
  router.push({ path: route, query: {} })
}

function onRowClick(evt, row) {
  btnClick(row)
}
</script>
