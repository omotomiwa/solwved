<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Vendor Area</div>
      <div v-if="isAdminAuthorised && vendor" class="text-h6 breadcrumb text-center q-mt-sm">
        <router-link :to="vendorDashboardLink" class="text-primary">
          {{ vendor.name }}
        </router-link>
        <span> / </span>
        <router-link :to="spendReportsLink" class="text-primary"> Spend Reports</router-link>
        <span> / {{ report_id }}</span>
      </div>
      <div v-if="isAdminAuthorised && reportData" class="column q-mt-lg">
        <spend-report-component
          :report-data="reportData"
          :raid-logs="raidLogs"
          :data-message="dataMessage"
          :componentKey="componentKey"
          view-mode="vendor"
          @save="onSaveChanges"
          @delete="deleteReport"
          @revert="revertChanges"
          @clear="clearMessages"
          @approve="approveReport"
          @unapprove="unapproveReport"
          @approve-customer="approveReportCustomer"
          @unapprove-customer="unApproveReportCustomer"
        />
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar, QSpinnerGears } from "quasar"
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import { ClassCombinations } from "src/modules/StaticData.js"
import { vendorAuth } from "src/modules/AuthLogic.js"
import SpendReportComponent from "src/components/reports/SpendReportComponent.vue"

const store = useStore()
const router = useRouter()
const $q = useQuasar()

const props = defineProps({
  vendor_id: { type: String },
  report_id: { type: String }
})

const { vendor, isAuthorised, isAdminAuthorised } = vendorAuth(props.vendor_id)

const raidLogs = ref([])
const reportData = ref(false)
const dataMessage = ref("")
const componentKey = ref(0)

const vendorDashboardLink = computed(() => "/vendor/" + props.vendor_id)
const spendReportsLink = computed(() => "/vendor/" + props.vendor_id + "/financial-management/spend-reports")

onMounted(() => {
  store.commit("auth/setBadge", "vendor")
  getSpendReport()
  $q.loading.show({
    message: "Gathering report data, please wait..."
  })
})

function getSpendReport() {
  store.dispatch(
    "vendor/getSpendReport",
    { vendorID: parseInt(props.vendor_id), reportID: parseInt(props.report_id) }
  ).then(response => {
    reportData.value = response.data
    componentKey.value++
    $q.loading.hide()
    getRaidLogs()
  }).catch(e => {
    alert(e.data.message || e.statusText)
  })
}

function getRaidLogs() {
  const serviceId = reportData.value.service_id
  const filter = "filter[service_id]=" + serviceId
  store.dispatch("common/getRaidLogs", filter).then(response => {
    raidLogs.value = response
  }).catch(e => {
    alert(e.data.message || e.statusText)
  })
}

function approveReportCustomer() {
  $q.dialog({
    title: "Confirm customer approval",
    message: "Warning, you are overriding normal procedure using your Super Admin rights. Normally the Customer should approve the report themselves",
    ok: { label: "Confirm Approval", color: "primary", textColor: "dark" },
    cancel: { hidden: true, textColor: "dark" }
  }).onOk(() => {
    onConfirmCustomerApproveReport()
  })
}

function unApproveReportCustomer() {
  $q.dialog({
    title: "Confirm customer un-approval",
    message: "Warning, you are overriding normal procedure using your Super Admin rights. You are removing the Customer Approval for this report",
    ok: { label: "Ok", color: "primary", textColor: "dark" },
    cancel: { hidden: true, textColor: "dark" }
  }).onOk(() => {
    onConfirmCustomerUnApproveReport()
  })
}

function approveReport() {
  $q.dialog({
    title: "Confirm Report Approval",
    message: "Once you have approved this report you can no longer edit it, and a message will be automatically sent to the customer notifying them that it is ready for them to view.",
    ok: { label: "Confirm Approval", color: "primary", textColor: "dark" },
    cancel: { label: "Cancel", color: "white", outline: true },
    persistent: true
  }).onOk(() => {
    onConfirmApproveReport()
  })
}

function onConfirmApproveReport() {
  store.dispatch(
    "vendor/approveSpendReport",
    { vendorID: parseInt(props.vendor_id), reportID: parseInt(props.report_id) }
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
    "vendor/unApproveSpendReport",
    { vendorID: parseInt(props.vendor_id), reportID: parseInt(props.report_id) }
  ).then(response => {
    reportData.value = response.data
    dataMessage.value = "Report reset to unapproved"
    componentKey.value++
  }).catch(e => {
    alert(e.data.message || e.statusText)
  })
}

function onConfirmCustomerApproveReport() {
  store.dispatch(
    "customer/approveSpendReport",
    { customerID: parseInt(reportData.value.customer_id), reportID: parseInt(props.report_id) }
  ).then(response => {
    reportData.value = response.data
    dataMessage.value = "Report set to approved by Customer"
    componentKey.value++
  }).catch(e => {
    alert(e.data.message || e.statusText)
  })
}

function onConfirmCustomerUnApproveReport() {
  store.dispatch(
    "customer/unApproveSpendReport",
    { customerID: parseInt(reportData.value.customer_id), reportID: parseInt(props.report_id) }
  ).then(response => {
    reportData.value = response.data
    dataMessage.value = "Report reset to unapproved by Customer"
    componentKey.value++
  }).catch(e => {
    alert(e.data.message || e.statusText)
  })
}

function onSaveChanges(changes) {
  store.dispatch(
    "vendor/updateSpendReport",
    { vendorID: parseInt(props.vendor_id), reportID: parseInt(props.report_id), updates: changes }
  ).then(response => {
    reportData.value = response.data
    dataMessage.value = "Changes saved successfully!"
    componentKey.value++
  }).catch(e => {
    alert(e.data.message || e.statusText)
  })
}

function deleteReport() {
  $q.dialog({
    title: "Confirm Report Deletion!",
    message: "Warning! Deleting a report may cause significant data loss. Only do this if you know what you are doing.",
    ok: { label: "Confirm Deletion", color: "negative" },
    cancel: { label: "Cancel", color: "white", outline: true },
    persistent: true
  }).onOk(() => {
    onDeleteReportConfirm()
  })
}

function onDeleteReportConfirm() {
  $q.loading.show({
    spinner: QSpinnerGears,
    spinnerColor: "dark",
    messageColor: "dark",
    backgroundColor: "negative",
    message: "Deleting report, please wait..."
  })
  store.dispatch(
    "vendor/deleteSpendReport",
    { vendorID: parseInt(props.vendor_id), reportID: parseInt(props.report_id) }
  ).then(() => {
    $q.loading.show({
      message: "Report deleted. Redirecting..."
    })
    setTimeout(() => {
      $q.loading.hide()
      router.push({ path: spendReportsLink.value })
    }, 1500)
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
