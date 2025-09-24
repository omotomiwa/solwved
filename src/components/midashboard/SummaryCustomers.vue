<script setup>
import { onMounted, ref, watch } from "vue"
import { DateMethods } from "src/modules/GlobalMethods.js"
import SummaryWidget from "src/components/midashboard/SummaryWidget.vue"
// import { DateTime } from 'luxon'

const props = defineProps({
  dates: Object,
  reportsData: Array
})

const totalCustomers = ref(0)

watch(props.dates, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    buildData()
  }
})

function buildData() {
  const customerIds = []
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
        if (customerIds.find(element => element === report.customer_id) === undefined) {
          customerIds.push(report.customer_id)
        }
      }
    }
  }
  totalCustomers.value = customerIds.length
}

onMounted(() => {
  buildData()
})
</script>

<template>
  <summary-widget :value="totalCustomers.toString()" label="Total customers" />
</template>
