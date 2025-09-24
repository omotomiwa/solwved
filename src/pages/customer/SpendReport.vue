<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Customer Area</div>
      <div v-if="isAuthorised" class="text-h6 breadcrumb text-center q-mt-sm">
        <router-link :to="customerDashboardLink" class="text-primary">
          {{ customer.name }}
        </router-link>
        <span> / </span>
        <router-link :to="spendReportsLink" class="text-primary"> Spend Reports</router-link>
        <span> / {{ report_id }}</span>
      </div>
      <div v-if="isAuthorised && reportData" class="column q-mt-lg">
        <spend-report-component
          :report-data="reportData"
          :raid-logs="raidLogs"
          :data-message="dataMessage"
          :componentKey="componentKey"
          view-mode="customer"
          @save="onSaveChanges"
          @revert="revertChanges"
          @clear="clearMessages"
          @approve="approveReport"
          @unapprove="unapproveReport"
        />
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar"
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import { customerAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations } from "src/modules/StaticData.js"
import SpendReportComponent from "src/components/reports/SpendReportComponent.vue"

const store = useStore()
const router = useRouter()
const $q = useQuasar()

const props = defineProps({
  customer_id: { type: String },
  report_id: { type: String }
})

const { customer, isAuthorised, isAdminAuthorised } = customerAuth(props.customer_id)

const raidLogs = ref([])
const reportData = ref(false)
const dataMessage = ref("")
const componentKey = ref(0)

const customerDashboardLink = computed(() => "/customer/" + props.customer_id)
const spendReportsLink = computed(() => "/customer/" + props.customer_id + "/financial-management/spend-reports")

onMounted(() => {
 
  store.commit("auth/setBadge", "customer")
  getSpendReport()
  $q.loading.show({
    message: "Gathering report data, please wait..."
  })
})

function getSpendReport() {
  store.dispatch(
    "customer/getSpendReport",
    { customerID: parseInt(props.customer_id), reportID: parseInt(props.report_id) }
  ).then(response => {
    reportData.value = response.data
    reportData.value.notes = reportData.value?.notes || ""
    componentKey.value++
    $q.loading.hide()
    getRaidLogs()
  }).catch(e => {
    alert(e.data.message || e.statusText)
  })
}

function getRaidLogs() {
  const filter = "filter[service_id]=" + parseInt(reportData.value.service_id)
  store.dispatch("common/getRaidLogs", filter).then(response => {
    raidLogs.value = response
  }).catch(e => {
    alert(e.data.message || e.statusText)
  })
}

function approveReport() {
  $q.dialog({
    title: "Confirm Report Approval",
    message: "Once you have approved this report it can no longer be changed.",
    ok: { label: "Confirm Approval", color: "primary", textColor: "dark" },
    cancel: { label: "Cancel", color: "white", outline: true },
    persistent: true
  }).onOk(() => {
    onConfirmApproveReport()
  })
}

function onConfirmApproveReport() {
  store.dispatch(
    "customer/approveSpendReport",
    { customerID: parseInt(props.customer_id), reportID: parseInt(props.report_id) }
  ).then(response => {
    reportData.value = response.data
    dataMessage.value = "Report approved"
    componentKey.value++
  }).catch(e => {
    alert(e.data.message || e.statusText)
  })
}

function unapproveReport() {
  store.dispatch(
    "customer/unApproveSpendReport",
    { customerID: parseInt(props.customer_id), reportID: parseInt(props.report_id) }
  ).then(response => {
    reportData.value = response.data
    dataMessage.value = "Report reset to unapproved"
    componentKey.value++
  }).catch(e => {
    alert(e.data.message || e.statusText)
  })
}

function onSaveChanges(changes) {
  store.dispatch(
    "customer/updateSpendReport",
    { customerID: parseInt(props.customer_id), reportID: parseInt(props.report_id), updates: changes }
  ).then(response => {
    reportData.value = response.data
    dataMessage.value = "Changes saved successfully!"
    componentKey.value++
  }).catch(e => {
    alert(e.data.message || e.statusText)
  })
}

function revertChanges() {
  dataMessage.value = "Changes reverted - now displaying previously saved report data"
  componentKey.value++
}

function clearMessages() {
  dataMessage.value = ""
}
</script>

<style scoped>
h1 {
  line-height: 2rem;
}
</style>
