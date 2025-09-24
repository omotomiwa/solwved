<script setup>
import { onMounted, ref, watch } from "vue"
import { DateMethods } from "src/modules/GlobalMethods.js"
import SummaryWidget from "src/components/midashboard/SummaryWidget.vue"
// import { DateTime } from 'luxon'

const props = defineProps({
  dates: Object,
  reportsData: Array
})

const totalContracts = ref(0)

watch(props.dates, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    buildData()
  }
})

function buildData() {
  const contractIds = []
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
        if (contractIds.find(element => element === report.service.contract_id) === undefined) {
          contractIds.push(report.service.contract_id)
        }
      }
    }
  }
  totalContracts.value = contractIds.length
}

onMounted(() => {
  buildData()
})
</script>

<template>
  <summary-widget :value="totalContracts.toString()" label="Total contracts" />
</template>
