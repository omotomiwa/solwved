<template>
  <v-chart
    class="chart"
    :option="option"
  />
</template>

<script>
import { defineComponent, ref } from "vue"
import VChart, { THEME_KEY } from "vue-echarts"
import { use } from "echarts/core"
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
  name: "NewRequestsByMonth",
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
      yAxis: {
        type: "value",
        max: "dataMax",
        axisLabel: {
          hideOverlap: true
        }
      },
      xAxis: {
        type: "category",
        data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
      },
      series: [
        {
          name: "New Service requests",
          type: "bar",
          data: [1, 5, 7, 5, 1, 4, 4]
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
