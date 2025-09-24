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
import { CurrencyMethods } from "src/modules/GlobalMethods.js"

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export default defineComponent({
  name: "PurchaseOrderSpend",
  components: {
    VChart
  },
  provide: {
    [THEME_KEY]: "dark"
  },
  props: {
    purchaseOrderValue: Number,
    periodCharge: Number,
    otherCharge: Number,
    balance: Number,
    period: String
  },
  computed: {
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    option: function() {
      return {
        backgroundColor: "transparent",
        color: ["#F5F5F5", "#5C6BC0", "#26A69A", "#8D6E63", "#BA68C8", "#FFD54F", "#81C784", "#FF7043", "#42A5F5", "#D4E157"],
        title: {
          text: "PO Utilisation (Budget: " + CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.purchaseOrderValue) + ")",
          subtext: this.period,
          left: "center"
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} ({d}%)"
        },
        legend: {
          show: false,
          orient: "vertical",
          left: "left",
          data: [
            "Charged this period " + CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.periodCharge),
            "Charged outside this period " + CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.otherCharge),
            "Remaining Budget " + CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.balance)
          ]
        },
        series: [
          {
            name: "PO Utilisation",
            type: "pie",
            radius: "55%",
            startAngle: 315,
            center: ["50%", "50%"],
            data: [
              {
                value: this.periodCharge,
                name: "Charged this period " + CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.periodCharge)
              },
              {
                value: this.otherCharge,
                name: "Charged outside this period " + CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.otherCharge)
              },
              {
                value: this.balance,
                name: "Remaining Budget " + CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.balance)
              }
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
  height: 320px;
}
</style>
