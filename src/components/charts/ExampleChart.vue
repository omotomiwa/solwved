<template>
  <v-chart
    class="chart"
    :option="option"
  />
</template>

<script>
import { defineComponent } from "vue"
import { use } from "echarts/core"
import VChart, { THEME_KEY } from "vue-echarts"
import { CanvasRenderer } from "echarts/renderers"
import { PieChart } from "echarts/charts"
import { LegendComponent, TitleComponent, TooltipComponent } from "echarts/components"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export default defineComponent({
  name: "ExampleChart",
  components: {
    VChart
  },
  provide: {
    [THEME_KEY]: "light"
  },
  computed: {
    isBuiltEnvironment: function() {
      return this.$store.getters["admin/getIsBuiltEnvironment"]
    },
    option: function() {
      return {
        title: {
          text: "",
          left: "center"
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          orient: "vertical",
          left: "left",
          data: ["FCDO Services", "Other"]
        },
        series: [
          {
            name: OrganisationTypeMethods.changeConsultant(this.isBuiltEnvironment, { isPlural: true }),
            type: "pie",
            radius: "55%",
            center: ["50%", "60%"],
            startAngle: 315,
            data: [
              { value: 9, name: "FCDO Services" },
              { value: 0, name: "Other" }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          }
        ]
      }
    }
  }
})
</script>

<style scoped>
.chart {
  height: 400px;
}
</style>
