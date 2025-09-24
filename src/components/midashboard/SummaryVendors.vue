<script setup>
import { onMounted, ref, watch } from "vue"
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

const totalVendors = ref(0)

function buildData() {
  const vendorIds = []
  if (props.reportsData && props.reportsData.length) {
    for (let i = 0; i < props.reportsData.length; i++) {
      const report = props.reportsData[i]
      if (DateMethods.reportEndDateWithinRange(report.period_end_date, props.dates.startDate, props.dates.endDate)) {
        if (vendorIds.find(element => element === report.vendor_id) === undefined) {
          vendorIds.push(report.vendor_id)
        }
      }
    }
  }
  totalVendors.value = vendorIds.length
}

onMounted(() => {
  buildData()
})
</script>

<template>
  <summary-widget :value="totalVendors.toString()" label="Total vendors" />
</template>
