<template>
  <v-chart
    class="chart"
    :option="option"
  />
</template>

<script setup>
import { computed, provide } from "vue"
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { BarChart } from "echarts/charts"
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components"
import VChart, { THEME_KEY } from "vue-echarts"
import { DateMethods } from "src/modules/GlobalMethods.js"

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

provide([THEME_KEY], "light")

const props = defineProps({
  months: Array,
  engagements: Array
})

const contractsByMonth = computed(() => {
  const e = []
  if (props.engagements && props.engagements.length) {
    for (let m = 0; m < props.months.length; m++) {
      const contractIds = []
      for (let i = 0; i < props.engagements.length; i++) {
        const engagement = props.engagements[i]
        const month = props.months[m]
        if (DateMethods.existsInRange(engagement.start_date, engagement.end_date, month.startDate, month.endDate)) {
          if (!contractIds.includes(engagement.contract_id)) {
            contractIds.push(engagement.contract_id)
          }
        }
      }
      e.push(contractIds.length)
    }
  }

  return e
})
const monthsArray = computed(() => props.months.map(el => el.monthLabel + "" + el.yearLabel))
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
      data: monthsArray
    },
    series: [
      {
        name: "Total Active Contracts",
        type: "bar",
        /* data: [10, 12, 17, 15, 16, 17, 13, 10, 12, 17, 15, 16] */
        data: contractsByMonth
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
