<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { DateMethods } from "src/modules/GlobalMethods.js"
import SummaryWidget from "src/components/midashboard/SummaryWidget.vue"

const props = defineProps({
  dates: Object,
  reportsData: Array
})
const periodMargin = ref(0)

watch(props.dates, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    buildData()
  }
})

const totalPeriodMargin = computed(() => parseFloat(periodMargin.value || 0).toFixed(2) + "%")

function buildData() {
  let revenue = 0
  let costs = 0
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
        for (let r = 0; r < report.spend_report_service_lines.length; r++) {
          const serviceLine = report.spend_report_service_lines[r]
          revenue += parseFloat(serviceLine.period_charge)
          costs += parseFloat(serviceLine.period_cost)
        }
      }
    }
  }
  periodMargin.value = ((revenue - costs) / revenue) * 100
}

onMounted(() => {
  buildData()
})
</script>

<template>
  <summary-widget :value="totalPeriodMargin" label="Total Margin" />
</template>
