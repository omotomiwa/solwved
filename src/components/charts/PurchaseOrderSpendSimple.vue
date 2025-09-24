<template>
  <v-chart class="chart" :option="option" />
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
  name: "PurchaseOrderSpendSimple",
  components: {
    VChart
  },
  provide: {
    [THEME_KEY]: "infographic"
  },
  props: {
    poReference: String,
    purchaseOrderValue: Number,
    currentSpend: Number,
    endDate: String
  },
  computed: {
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    option: function() {
      return {
        title: {
          text: `PO Utilisation: ${this.poReference}`,
          subtext: `Total Value: ${CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.purchaseOrderValue)}`,
          left: "center",
          textStyle: {
            color: "rgba(252,234,34,1)",
            fontSize: "1.5rem"
          },
          subtextStyle: {
            color: "white",
            fontSize: "1.3rem"
          }
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} ({d}%)"
        },
        legend: {
          show: false,
          orient: "vertical",
          left: "left",
          color: "white",
          data: [
            `Spend to ${this.endDate} : ${CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.currentSpend)}`,
            "Remaining Budget " + CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.purchaseOrderValue - this.currentSpend)
          ]
        },
        series: [
          {
            name: "PO Utilisation",
            type: "pie",
            radius: "55%",
            startAngle: 315,
            center: ["50%", "50%"],
            color: this.purchaseOrderValue > this.currentSpend ? ["#26A69A", "#FF6F61"] : ["#FF6F61", "#26A69A"],
            data: [
              {
                value: this.currentSpend,
                name: `Spend to ${this.endDate} : ${CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.currentSpend)}`,
                avoidLabelOverlap: true
              },
              {
                value: this.purchaseOrderValue - this.currentSpend,
                name:
                  "Remaining Budget " + CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.purchaseOrderValue - this.currentSpend),
                avoidLabelOverlap: true
              }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: "none",
                shadowOffsetX: "none",
                textShadowColor: "transparent"
              }
            },
            label: {
              textShadowColor: "transparent",
              shadowBlur: 0,
              backgroundColor: "transparent",
              color: "white",
              fontSize: "1rem",
              overflow: "break"
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
