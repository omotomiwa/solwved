<template>
  <v-chart
    v-if="!noData"
    ref="chart"
    class="chart"
    :manual-update="true"
  />
  <div v-else class="row flex-center no-data-message">No data to show for this time range</div>
</template>

<script setup>
import { computed, nextTick, onMounted, provide, ref, watch } from "vue"
import { useStore } from "vuex"
import VChart, { THEME_KEY } from "vue-echarts"
import { use } from "echarts/core"
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

provide([THEME_KEY], "dark")

const store = useStore()

const props = defineProps({
  view: String,
  reportsData: Array // reports already filtered for being within date range
})

const chart = ref(null)

const organisation = computed(() => store.getters["admin/getOrganisation"])
const reports = computed(() => props.reportsData)
const noData = computed(() => !props.reportsData.length)
const revenueByService = computed(() => {
  const services = {}
  if (reports.value && reports.value.length) {
    reports.value.forEach(report => {
      let reportTotal = 0
      report.spend_report_service_lines.forEach(serviceLine => {
        reportTotal += parseFloat(serviceLine.period_charge)
      })
      if (services[report.service_id] === undefined) {
        services[report.service_id] = {
          customerName: report.customer_name,
          vendorName: report.vendor_name,
          serviceName: report.service.name,
          total: 0
        }
      }
      services[report.service_id].total += reportTotal
    })
  }
  const svs = Object.values(services)
  svs.sort((a, b) => a.total - b.total)
  return svs
})
const seriesData = computed(() => {
  const s = []
  if (revenueByService.value && revenueByService.value.length) {
    for (let i = 0; i < revenueByService.value.length; i++) {
      const service = revenueByService.value[i]
      s.push(service.total)
      if (i >= 4) {
        break
      }
    }
  }
  return s
})
const topServicesLabels = computed(() => {
  const a = []
  if (revenueByService.value && revenueByService.value.length) {
    for (let i = 0; i < revenueByService.value.length; i++) {
      if (props.view === "customer") {
        a.push(revenueByService.value[i].vendorName + "\n" + revenueByService.value[i].serviceName)
      } else {
        a.push(revenueByService.value[i].customerName + "\n" + revenueByService.value[i].serviceName)
      }
      if (i >= 4) {
        break
      }
    }
  }
  return a
})

watch(reports, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    await nextTick()
    buildOptions()
  }
})

function buildOptions() {
  const option = {
    backgroundColor: "transparent",
    color: ["#5C6BC0", "#26A69A", "#8D6E63", "#BA68C8", "#FFD54F", "#81C784", "#FF7043", "#42A5F5", "#D4E157"],
    title: {
      show: false,
      text: "",
      left: "center"
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: params => {
        return CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, params[0].value)
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
      max: value => value.max + (value.max * 0.1),
      axisLabel: {
        formatter: value => {
          return CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, value)
        },
        hideOverlap: true
      }
    },
    yAxis: {
      type: "category",
      data: topServicesLabels.value,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    series: [{
      type: "bar",
      showBackground: true,
      label: {
        show: true,
        color: "white",
        formatter: params => {
          return params.name + "\n" + CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, params.value)
        }
      },
      data: seriesData.value
    }]
  }

  if (chart.value !== null) {
    chart.value.clear()
    chart.value.setOption(option, {
      notMerge: true,
      lazyUpdate: true
    })
  }
}

onMounted(() => {
  buildOptions()
})
</script>

<style scoped>
.chart {
  height: 400px;
}
</style>
