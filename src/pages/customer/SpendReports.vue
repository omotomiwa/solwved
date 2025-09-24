<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Customer Area</div>
      <BreadCrumb align="center" :organisation="customer" v-if="isAuthorised" />
      <div v-if="isAuthorised" class="column q-mt-lg">
        <h1>Spend Reports</h1>
        <new-selector-form
          v-model:option_id="selectedVendorID"
          label="Select Vendor"
          filled
          is-clearable
          :options="vendors"
          is-filterable
          filter-key="name"
          classes="q-gutter-md row"
          default-class="full-width"
          style="width: 350px; padding-bottom: 32px"
          no-option-label="No results"
          autofocus
        />
        <div v-if="selectedVendorID > 0">
          <div class="q-mb-xl">
            <div class="status-heading">Pending Approval</div>
            <q-list v-if="vendor_approved_reports.length" dense>
              <q-item v-for="report in vendor_approved_reports" :key="report.id" :to="reportLink(report.id)">
                <q-item-section avatar>
                  <q-icon color="primary" name="summarize" />
                </q-item-section>
                <q-item-section>{{ report.vendor_name }} - {{ report.period_label }}</q-item-section>
              </q-item>
            </q-list>
            <div v-else class="none-message">There are no reports to display</div>
          </div>
          <div class="q-mb-xl">
            <div class="status-heading">Fully Approved Reports</div>
            <q-list v-if="customer_approved_reports.length" dense>
              <q-item v-for="report in customer_approved_reports" :key="report.id" :to="reportLink(report.id)">
                <q-item-section avatar>
                  <q-icon color="primary" name="summarize" />
                </q-item-section>
                <q-item-section>{{ report.vendor_name }} - {{ report.period_label }}</q-item-section>
              </q-item>
            </q-list>
            <div v-else class="none-message">There are no reports to display</div>
          </div>
        </div>
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useStore } from "vuex"
import { customerAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations } from "src/modules/StaticData.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

const store = useStore()

const props = defineProps({
  customer_id: { type: String }
})
const { customer, isAuthorised, isAdminAuthorised } = customerAuth(props.customer_id)
console.log("cuatomer auth", customer.value)

const selectedVendorID = ref(undefined)
const vendorOptions = ref([])

const customerDashboardLink = computed(() => "/customer/" + props.customer_id)
const vendors = computed(() => store.getters["customer/getVendorsByCustomer"](parseInt(props.customer_id)))
const reports = computed(() => store.getters["customer/getSpendReports"](parseInt(props.customer_id)))
const selectedVendorReports = computed(() => reports.value.filter(report => report.vendor_id === selectedVendorID.value))
const vendor_approved_reports = computed(() => {
  return (selectedVendorReports.value ?? []).filter(report => report.vendor_approved === 1 && report.customer_approved === 0)
})
const customer_approved_reports = computed(() => {
  return (selectedVendorReports.value ?? []).filter(report => report.customer_approved === 1)
})

onMounted(() => {
  getReportsData()
  getVendors()
})

function getReportsData() {
  store.dispatch("customer/getReports", parseInt(props.customer_id))
}

function getVendors() {
  if (!vendors.value.length) {
    store.dispatch("customer/getCustomerVendors", props.customer_id)
  }
}

function reportLink(id) {
  return "/customer/" + props.customer_id + "/financial-management/spend-reports/" + id
}
</script>

<style scoped>
h1 {
  line-height: 2rem;
}

.none-message {
  font-style: italic;
}

.status-heading {
  font-weight: 600;
  font-size: larger;
}
</style>
