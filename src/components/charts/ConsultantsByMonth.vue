<template>
  <v-chart
    class="chart"
    :option="option"
  />
</template>

<script setup>
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { BarChart } from "echarts/charts"
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components"
import VChart, { THEME_KEY } from "vue-echarts"
import { computed, provide } from "vue"
import { useStore } from "vuex"
import { DateMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const store = useStore()

provide([THEME_KEY], "light")

const props = defineProps({
  months: Array,
  engagements: Array
})

const engagementsByMonth = computed(() => {
  const e = []
  if (props.engagements && props.engagements.length) {
    for (let m = 0; m < props.months.length; m++) {
      let total = 0
      for (let i = 0; i < props.engagements.length; i++) {
        const engagement = props.engagements[i]
        const month = props.months[m]
        // if ((engagement.start_date <= month.startDate && engagement.end_date >= month.startDate) || (engagement.start_date <= month.endDate && engagement.end_date >= month.endDate)) {
        if (DateMethods.existsInRange(engagement.start_date, engagement.end_date, month.startDate, month.endDate)) {
          total++
        }
      }
      e.push(total)
    }
  }

  return e
})
const monthsArray = computed(() => props.months.map(el => el.monthLabel + "" + el.yearLabel))
const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const option = computed(() => {
  return {
    title: {
      text: "",
      left: "center"
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    legend: {},
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    yAxis: {
      type: "value",
      max: "dataMax",
      axisLabel: {
        hideOverlap: true
      }
    },
    xAxis: {
      type: "category",
      /* data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] */
      data: monthsArray
    },
    series: [
      {
        name: "Total Active " + OrganisationTypeMethods.changeConsultant(isBuiltEnvironment.value, { isPlural: true }),
        type: "bar",
        /* data: [10, 12, 17, 15, 16, 17, 13, 10, 12, 17, 15, 16] */
        data: engagementsByMonth
      }
    ]
  }
})
</script>

<style scoped>
.chart {
  height: 400px;
}
</style>
