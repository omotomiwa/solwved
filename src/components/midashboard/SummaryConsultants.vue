<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { DateMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import SummaryWidget from "src/components/midashboard/SummaryWidget.vue"

const store = useStore()
const props = defineProps({
  dates: Object,
  reportsData: Array
})

const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const label = computed(() => OrganisationTypeMethods.changeConsultant(isBuiltEnvironment.value) + " engagements")

watch(props.dates, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    buildData()
  }
})

const totalConsultants = ref(0)

function buildData() {
  let consultants = 0
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
        for (let r = 0; r < report.spend_report_requests.length; r++) {
          const req = report.spend_report_requests[r]
          consultants += parseInt(req.total_engagements)
        }
      }
    }
  }
  totalConsultants.value = consultants
}

onMounted(() => {
  buildData()
})
</script>

<template>
  <summary-widget :value="totalConsultants.toString()" :label="label" />
</template>
