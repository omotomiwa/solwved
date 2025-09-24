<template>
  <v-chart
    v-if="!noData"
    :option="option"
    class="chart"
  />
  <div v-else class="row flex-center no-data-message">No data to show for this time range</div>
</template>

<script>
import { defineComponent } from "vue"
import { use } from "echarts/core"
import VChart, { THEME_KEY } from "vue-echarts"
import { CanvasRenderer } from "echarts/renderers"
import { BarChart } from "echarts/charts"
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components"
import { CurrencyMethods, DateMethods } from "src/modules/GlobalMethods.js"

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

export default defineComponent({
  name: "RevenueByMonth",
  components: {
    VChart
  },
  provide: {
    [THEME_KEY]: "dark"
  },
  props: {
    months: Array,
    view: String,
    reportsData: Array
  },
  computed: {
    organisation: function() {
      return this.view === "customer" ? "vendor" : "customer"
    },
    organisationDetail: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    noData: function() {
      return !this.reportsData.length
    },
    reportsByOrganisation: function() {
      const c = {}
      if (this.reportsData && this.reportsData.length) {
        for (let i = 0; i < this.reportsData.length; i++) {
          const report = this.reportsData[i]
          if (c[report[this.organisation + "_id"]] === undefined) {
            c[report[this.organisation + "_id"]] = []
          }
          c[report[this.organisation + "_id"]].push(report)
        }
      }
      return Object.values(c)
    },
    seriesData: function() {
      return this.reportsByOrganisation.map(val => {
        return {
          name: val[0][this.organisation + "_name"],
          type: "bar",
          stack: "total",
          data: this.revenueByMonth(val)
        }
      })
    },
    monthsArray: function() {
      return this.months.map(el => el.monthLabel + "" + el.yearLabel)
    },
    height: function() {
      let h = 400
      const numMonths = this.monthsArray.length
      if (numMonths > 8) {
        h = numMonths * 50 * 0.8
      }
      return h
    },
    style: function() {
      return "height: " + this.height + "px;"
    },
    option: function() {
      return {
        backgroundColor: "transparent",
        color: ["#F5F5F5", "#5C6BC0", "#26A69A", "#8D6E63", "#BA68C8", "#FFD54F", "#81C784", "#FF7043", "#42A5F5", "#D4E157"],
        title: {
          text: "",
          left: "center"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          },
          valueFormatter: value => CurrencyMethods.toCurrencyFormat(this.organisationDetail?.currency?.code, value)
        },
        legend: {
          shadowColor: "transparent",
          shadowBlur: 0,
          textShadowColor: "transparent",
          textShadowBlur: 0,
          color: "blue",
          itemStyle: {
            shadowBlur: "none",
            shadowOffsetX: "none",
            shadowColor: "transparent"
          },
          emphasis: {
            selectorLabel: {
              color: "white",
              shadowBlur: "none",
              shadowOffsetX: "none",
              textShadowColor: "transparent"
            }
          },
          selectorLabel: {
            color: "white",
            shadowBlur: "none",
            shadowOffsetX: "none",
            textShadowColor: "transparent",
            shadowColor: "transparent",
            textShadowBlur: 0
          }
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
            formatter: value => {
              return CurrencyMethods.toCurrencyFormat(this.organisationDetail?.currency?.code, value)
            },
            color: "white",
            hideOverlap: true
          }
        },
        yAxis: {
          type: "category",
          data: this.monthsArray,
          axisLabel: {
            color: "white"
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: "none",
            shadowOffsetX: "none",
            textShadowColor: "transparent"
          }
        },
        series: this.seriesData,
        label: {
          textShadowColor: "transparent",
          shadowBlur: 0,
          backgroundColor: "transparent",
          color: "white",
          fontSize: "1rem"
        }
      }
    }
  },
  methods: {
    revenueByMonth: function(reports) {
      return this.months.map(month => {
        let monthTotal = 0
        reports.forEach(report => {
          if (
            DateMethods.reportEndDateWithinRange(
              DateMethods.convertDateFormat(report.period_end_date, "/", "-"),
              month.startDate,
              month.endDate
            )
          ) {
            report.spend_report_service_lines.forEach(serviceLine => {
              monthTotal += parseFloat(serviceLine.period_charge)
            })
          }
        })
        return monthTotal
      })
    }
  }
})
</script>

<style scoped>
.chart {
  height: 400px;
}
</style>
