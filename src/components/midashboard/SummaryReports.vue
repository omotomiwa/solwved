<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { DateMethods } from "src/modules/GlobalMethods.js"
import SummaryWidget from "src/components/midashboard/SummaryWidget.vue"
// import { DateTime } from 'luxon'

const props = defineProps({
  dates: Object,
  reportsData: Array
})

watch(props.dates, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    buildData()
  }
})

const totalReports = ref(0)
const reportsRequiringCustomerApproval = ref(0)

function buildData() {
  let total = 0
  let totalRequiringCustomerApproval = 0
  if (props.reportsData && props.reportsData.length) {
    for (let i = 0; i < props.reportsData.length; i++) {
      const report = props.reportsData[i]
      if (
        DateMethods.reportEndDateWithinRange(
          DateMethods.convertDateFormat(report.period_end_date, "/", "-"),
          props.dates.startDate,
          props.dates.endDate
        )
      ) {
        total++
        if (report.customer_approved === 0) {
          totalRequiringCustomerApproval++
        }
      }
    }
  }
  totalReports.value = total
  reportsRequiringCustomerApproval.value = totalRequiringCustomerApproval
}

const totalReportsLabel = computed(() => {
  return reportsRequiringCustomerApproval.value === 1 ? "Report in this time range" : "Reports in this time range"
})
const totalReportsRequiringApprovalLabel = computed(() => {
  return reportsRequiringCustomerApproval.value === 1 ? "Requires customer approval" : "Require customer approval"
})

onMounted(() => {
  buildData()
})
</script>

<template>
  <summary-widget :value="totalReports.toString()" :label="totalReportsLabel" />
  <summary-widget :value="reportsRequiringCustomerApproval.toString()" :label="totalReportsRequiringApprovalLabel" />
</template>
