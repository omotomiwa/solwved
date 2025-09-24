<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Management Information</div>
      <BreadCrumb align="center" :organisation="vendor" v-if="isAuthorised" />
      <div v-if="isAdminAuthorised" class="column q-mt-lg mi-dashboard">
        <h1>Management Information Dashboard</h1>
        <date-range-widget class="q-mb-lg" @setDates="buildDates" />
        <div v-if="dates.startDate === null" class="q-pa-lg q-mb-lg">
          Click on APPLY to view MI Data for the selected date range
        </div>
        <div v-if="showWidgets" class="row items-stretch q-col-gutter-md">
          <div class="row items-stretch col-xs-12 col-sm-6 col-md-4">
            <div class="swlvd-border-thin q-pa-md">
              <div class="q-mb-md">
                <div class="card-title">Summary</div>
                <div class="card-sub-heading">for selected time range</div>
              </div>
              <div class="row items-stretch q-col-gutter-sm" :key="componentKey">
                <div class="col-12">
                  <summary-profit :dates="dates" :reportsData="vendorApprovedReports" />
                </div>
                <div class="col-12">
                  <summary-revenue :dates="dates" :reportsData="vendorApprovedReports" view="vendor" />
                </div>
                <div class="col-12">
                  <summary-costs :dates="dates" :reportsData="vendorApprovedReports" />
                </div>
                <div class="col-12">
                  <summary-margin :dates="dates" :reportsData="vendorApprovedReports" />
                </div>
                <div class="col-12">
                  <summary-customers :dates="dates" :reportsData="vendorApprovedReports" />
                </div>
                <div class="col-12">
                  <summary-contracts :dates="dates" :reportsData="vendorApprovedReports" />
                </div>
                <div class="col-12">
                  <summary-services :dates="dates" :reportsData="vendorApprovedReports" />
                </div>
                <div class="col-12">
                  <summary-consultants :dates="dates" :reportsData="vendorApprovedReports" />
                </div>
                <div class="col-12">
                  <summary-reports :dates="dates" :reportsData="vendorApprovedReports" />
                </div>
              </div>
            </div>
          </div>
          <div class="row items-stretch col-xs-12 col-sm-6 col-md-8">
            <div class="swlvd-border-thin q-pa-md column items-stretch col">
              <div class="q-mb-md col-auto">
                <div class="card-title">Revenue by Month</div>
                <div class="card-sub-heading">based on Vendor approved reports</div>
              </div>
              <revenue-by-month class="col" :months="monthsInRange" :reportsData="reportsInDateRange" view="vendor" />
            </div>
          </div>
          <div class="row items-stretch col-xs-12 col-sm-6 col-md-12">
            <div class="swlvd-border-thin q-pa-md column items-stretch col">
              <div class="q-mb-md col-auto">
                <div class="card-title">Top Services</div>
                <div class="card-sub-heading">for time range, listed by revenue</div>
              </div>
              <top-services :reportsData="reportsInDateRange" view="vendor" />
            </div>
          </div>
          <div class="row items-stretch col-xs-12 col-sm-6 col-md-4">
            <div class="swlvd-border-thin q-pa-md column items-stretch col">
              <div class="q-mb-md col-auto">
                <div class="card-title">New / Stopped Services</div>
                <div class="card-sub-heading">in selected time range</div>
              </div>
              <services-start-end :dates="dates" :reportsData="vendorApprovedReports" />
            </div>
          </div>
          <div class="row items-stretch col-xs-12 col-sm-6 col-md-4">
            <div class="swlvd-border-thin q-pa-md column items-stretch col">
              <div class="q-mb-md col-auto">
                <div class="card-title">Delivery Model</div>
                <div class="card-sub-heading">in selected time range</div>
              </div>
              <delivery-model-pie :reportsData="reportsInDateRange" />
            </div>
          </div>
          <div class="row items-stretch col-xs-12 col-sm-6 col-md-4">
            <div class="swlvd-border-thin q-pa-md column items-stretch col">
              <div class="q-mb-md col-auto">
                <div class="card-title">Financial Model</div>
                <div class="card-sub-heading">in selected time range</div>
              </div>
              <financial-model-pie :reportsData="reportsInDateRange" />
            </div>
          </div>
          <div class="row items-stretch col-xs-12 col-sm-6 col-md-4">
            <div class="swlvd-border-thin q-pa-md column items-stretch col">
              <div class="q-mb-md col-auto">
                <div class="card-title">Reports awaiting Customer approval</div>
              </div>
              <q-list v-if="unapprovedReports.length" dense>
                <q-item v-for="report in unapprovedReports" :key="report.id" :to="reportLink(report.id)">
                  <q-item-section avatar>
                    <q-icon color="primary" name="summarize" />
                  </q-item-section>
                  <q-item-section>{{ report.customer_name }} - {{ report.period_label }}</q-item-section>
                </q-item>
              </q-list>
              <p v-else>There are no reports awaiting approval</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { DateTime } from "luxon"
import { DateMethods } from "src/modules/GlobalMethods.js"
import { vendorAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations, Config } from "src/modules/StaticData.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import RevenueByMonth from "src/components/charts/RevenueByMonth.vue"
import TopServices from "src/components/charts/TopServices.vue"
import DeliveryModelPie from "src/components/charts/DeliveryModel.vue"
import FinancialModelPie from "src/components/charts/FinancialModel.vue"
import ServicesStartEnd from "src/components/midashboard/ServicesStartEnd.vue"
import DateRangeWidget from "src/components/midashboard/DateRangeWidget.vue"
import SummaryRevenue from "src/components/midashboard/SummaryRevenue.vue"
import SummaryProfit from "src/components/midashboard/SummaryProfit.vue"
import SummaryReports from "src/components/midashboard/SummaryReports.vue"
import SummaryCosts from "src/components/midashboard/SummaryCosts.vue"
import SummaryMargin from "src/components/midashboard/SummaryMargin.vue"
import SummaryCustomers from "src/components/midashboard/SummaryCustomers.vue"
import SummaryServices from "src/components/midashboard/SummaryServices.vue"
import SummaryConsultants from "src/components/midashboard/SummaryConsultants.vue"
import SummaryContracts from "src/components/midashboard/SummaryContracts.vue"

const store = useStore()

const props = defineProps({
  vendor_id: String
})
const { vendor, isAuthorised, isAdminAuthorised } = vendorAuth(props.vendor_id)

const dates = ref({ startDate: null, endDate: null })
const componentKey = ref(0)

const spendReportsData = computed(() => store.getters["vendor/getSpendReports"](parseInt(props.vendor_id)))
const unapprovedReports = computed(() => {
  const a = []
  if (spendReportsData.value && spendReportsData.value.length) {
    for (let index = 0; index < spendReportsData.value.length; index++) {
      const report = spendReportsData.value[index]
      if (report.customer_approved === 0) {
        a.push(report)
      }
    }
  }
  return a
})
const reportsInDateRange = computed(() => {
  return vendorApprovedReports.value.filter(elem =>
    DateMethods.reportEndDateWithinRange(
      DateMethods.convertDateFormat(elem.period_end_date, "/", "-"),
      dates.value.startDate,
      dates.value.endDate
    )
  )
})
const vendorApprovedReports = computed(() => {
  const a = []
  if (spendReportsData.value && spendReportsData.value.length) {
    for (let index = 0; index < spendReportsData.value.length; index++) {
      const report = spendReportsData.value[index]
      if (report.vendor_approved === 1) {
        a.push(report)
      }
    }
  }
  return a
})
const monthsInRange = computed(function() {
  // current month
  const months = []
  if (dates.value.startDate !== null) {
    let month = getMonthDates(DateTime.fromISO(dates.value.startDate))
    months.push(month)
    while (getNextMonth(month).endDate <= dates.value.endDate) {
      month = getNextMonth(month)
      months.push(month)
    }
  }
  return months
})
const showWidgets = computed(() => {
  return !!(dates.value.startDate !== null && vendorApprovedReports.value.length)
})

watch(isAdminAuthorised, newValue => {
  if (newValue) {
    getReports()
  }
})

function getNextMonth(month) {
  const nextMonth = DateTime.fromISO(month.startDate).plus({ months: 1 })
  return getMonthDates(nextMonth)
}

function getMonthDates(date) {
  return {
    number: date.month,
    startDate: date.startOf("month").toISODate(),
    endDate: date.endOf("month").toISODate(),
    monthLabel: date.toFormat(Config.MONTH_FORMAT),
    yearLabel: date.toFormat(Config.YEAR_FORMAT),
    lux: date
  }
}

function buildDates(d) {
  nextTick(() => {
    dates.value.startDate = d.startDate
    dates.value.endDate = d.endDate
    componentKey.value++
  })
}

function getReports() {
  store.dispatch("vendor/getReports", parseInt(props.vendor_id))
}

function reportLink(id) {
  return "/vendor/" + props.vendor_id + "/financial-management/spend-reports/" + id
}

onMounted(() => {
  if (isAdminAuthorised.value) {
    getReports()
  }
})
</script>

<style scoped lang="scss">
h1 {
  line-height: 2rem;
}

.mi-card {
  width: 100%;
  max-width: 450px;
}

.card-title {
  text-transform: uppercase;
  font-size: 1.4rem;
  font-weight: 600;
}

.card-sub-heading {
  font-style: italic;
}

.no-data-message {
  font-style: italic;
}

.border-grey {
  border: 1px solid $grey-5;
}
</style>
