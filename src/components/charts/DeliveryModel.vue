<template>
  <v-chart
    v-if="!noData"
    class="chart"
    ref="chart"
    :manual-update="true"
  />
  <div v-else class="row flex-center no-data-message">No data to show for this time range</div>
</template>

<script setup>
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { PieChart } from "echarts/charts"
import { LegendComponent, TitleComponent, TooltipComponent } from "echarts/components"
import VChart, { THEME_KEY } from "vue-echarts"
import { computed, nextTick, onMounted, provide, ref, watch } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

provide([THEME_KEY], "dark")

const store = useStore()

const props = defineProps({
  reportsData: Array // reports already filtered for being within date range
})

const chart = ref(null)

const organisation = computed(() => store.getters["admin/getOrganisation"])
const reports = computed(() => props.reportsData)
const noData = computed(() => !props.reportsData.length)
const totalsByDeliveryModel = computed(() => {
  const dm = {}
  if (reports.value && reports.value.length) {
    for (let i = 0; i < reports.value.length; i++) {
      const report = reports.value[i]
      if (dm[report.service.delivery_model.id] === undefined) {
        dm[report.service.delivery_model.id] = {
          name: report.service.delivery_model.name,
          total: 0
        }
      }
      dm[report.service.delivery_model.id].total += getReportTotal(report)
    }
    return Object.values(dm)
  } else {
    return []
  }
})
const deliveryModelNames = computed(() => {
  let names = []
  if (totalsByDeliveryModel.value.length) {
    names = totalsByDeliveryModel.value.map(elem => {
      return elem.name
    })
  }
  return names
})

watch(reports, async () => {
  await nextTick()
  buildChart()
})

function getReportTotal(report) {
  let total = 0
  report.spend_report_service_lines.forEach(serviceLine => {
    total += parseFloat(serviceLine.period_charge)
  })
  return total
}

function buildOption() {
  return {
    backgroundColor: "transparent",
    color: ["#F5F5F5", "#5C6BC0", "#26A69A", "#8D6E63", "#BA68C8", "#FFD54F", "#81C784", "#FF7043", "#42A5F5", "#D4E157"],
    title: {
      text: "",
      left: "center"
    },
    tooltip: {
      trigger: "item",
      formatter: params => {
        return params.data.name + "<br/>" + CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, params.data.value) + " (" + params.percent + "%)"
      }
    },
    legend: {
      orient: "vertical",
      left: "left",
      data: deliveryModelNames.value
    },
    series: [
      {
        name: "Delivery Model",
        type: "pie",
        radius: "55%",
        center: ["50%", "60%"],
        startAngle: 315,
        label: {
          formatter: "{b}\n{d}%"
        },
        data: totalsByDeliveryModel.value.map(elem => {
          return {
            name: elem.name,
            value: elem.total
          }
        }),
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

function buildChart() {
  if (chart.value) {
    chart.value.clear()
    const option = buildOption()
    chart.value.setOption(option, {
      notMerge: true,
      lazyUpdate: true
    })
  }
}

onMounted(() => {
  buildChart()
})
</script>

<style scoped>
.chart {
  height: 400px;
}
</style>
