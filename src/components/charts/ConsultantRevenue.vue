<template>
  <v-chart
    class="chart"
    :option="option"
  />
</template>

<script>
import { defineComponent, ref } from "vue"
import { use } from "echarts/core"
import VChart, { THEME_KEY } from "vue-echarts"
import { CanvasRenderer } from "echarts/renderers"
import { BarChart } from "echarts/charts"
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components"

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

export default defineComponent({
  name: "ConsultantRevenue",
  components: {
    VChart
  },
  provide: {
    [THEME_KEY]: "light"
  },
  setup() {
    const option = ref({
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
      xAxis: {
        type: "value",
        max: "dataMax",
        axisLabel: {
          hideOverlap: true
        }
      },
      yAxis: {
        type: "category",
        data: ["Mark", "David", "Richard"]
      },
      series: [
        {
          name: "Revenue",
          type: "bar",
          data: [18203, 23489, 29034]
        },
        {
          name: "Profit",
          type: "bar",
          data: [19325, 23438, 31000]
        }
      ]
    })

    return { option }
  }
})
</script>

<style scoped>
.chart {
  height: 400px;
}
</style>
