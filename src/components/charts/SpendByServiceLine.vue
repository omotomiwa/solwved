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
import { BarChart } from "echarts/charts"
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

export default defineComponent({
  name: "SpendByServiceLine",
  components: {
    VChart
  },
  provide: {
    [THEME_KEY]: "dark"
  },
  props: {
    serviceLines: Array,
    period: String
  },
  computed: {
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    serviceLineNames: function() {
      return (this.serviceLines ?? []).map(elem => elem.service_line_name)
    },
    serviceLineValues: function() {
      return (this.serviceLines ?? []).map(elem => parseInt(elem.period_charge))
    },
    totalSpend: function() {
      let spend = 0
      for (let index = 0; index < (this.serviceLines ?? []).length; index++) {
        const serviceLine = this.serviceLines[index]
        spend += parseInt(serviceLine.period_charge)
      }
      return spend
    },
    option: function() {
      return {
        backgroundColor: "transparent",
        color: ["#F5F5F5", "#5C6BC0", "#26A69A", "#8D6E63", "#BA68C8", "#FFD54F", "#81C784", "#FF7043", "#42A5F5", "#D4E157"],
        title: {
          text: "Charge by Category",
          subtext: this.period,
          left: "center"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          },
          formatter: params => {
            const pc = Math.round(100 * params[0].value / this.totalSpend)
            return CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, params[0].value) + " (" + pc + "%)"
          }
        },
        legend: {
          show: false
        },
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
            hideOverlap: true,
            formatter: value => {
              return CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, value)
            }
          }
        },
        yAxis: {
          type: "category",
          data: this.serviceLineNames
        },
        series: [
          {
            name: "Charge",
            type: "bar",
            data: this.serviceLineValues
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
