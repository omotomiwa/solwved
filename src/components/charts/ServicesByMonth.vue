<template>
  <v-chart
    class="chart"
    :option="option"
  />
</template>

<script setup>
import { computed, provide } from "vue"
import { THEME_KEY } from "vue-echarts"
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { BarChart } from "echarts/charts"
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components"
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

const servicesByMonth = computed(() => {
  const e = []
  if (props.engagements && props.engagements.length) {
    for (let m = 0; m < props.months.length; m++) {
      const serviceIds = []
      for (let i = 0; i < props.engagements.length; i++) {
        const engagement = props.engagements[i]
        const month = props.months[m]
        if (DateMethods.existsInRange(engagement.start_date, engagement.end_date, month.startDate, month.endDate)) {
          if (!serviceIds.includes(engagement.request.service_id)) {
            serviceIds.push(engagement.request.service_id)
          }
        }
      }
      e.push(serviceIds.length)
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
        name: "Total Active Services",
        type: "bar",
        data: servicesByMonth
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
