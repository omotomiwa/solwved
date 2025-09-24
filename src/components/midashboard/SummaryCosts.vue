<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods, DateMethods } from "src/modules/GlobalMethods.js"
import SummaryWidget from "src/components/midashboard/SummaryWidget.vue"
// import { DateTime } from 'luxon'

const store = useStore()

const props = defineProps({
  dates: Object,
  reportsData: Array
})
const periodCosts = ref(0)

watch(props.dates, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    buildData()
  }
})

const organisation = computed(() => store.getters["admin/getOrganisation"])

const totalPeriodCosts = computed(() =>
  CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, periodCosts.value)
)

function buildData() {
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
          costs += parseFloat(serviceLine.period_cost)
        }
      }
    }
  }
  periodCosts.value = costs
}

onMounted(() => {
  buildData()
})
</script>

<template>
  <summary-widget :value="totalPeriodCosts.toString()" label="Total costs" />
</template>
