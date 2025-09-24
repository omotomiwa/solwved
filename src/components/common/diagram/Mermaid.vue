<template>
  <div>
    <div ref="graphContainer" class="mermaid"></div>
    <q-menu
      transition-show="jump-down"
      transition-hide="jump-up"
      fit context-menu auto-close
    >
      <q-list dense>
        <q-item clickable @click="exportGraph">
          <q-item-section avatar class="min-w-auto">
            <q-icon name="fa-solid fa-download" color="white" size="12px" />
          </q-item-section>
          <q-item-section>Download</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUpdated, ref, watch } from "vue"
import mermaid from "mermaid"

const props = defineProps({
  graphType: { type: String, default: "flowchart LR" },
  fileName: { type: String },
  title: { type: String },
  subTitle: { type: String },
  chart: { type: String, required: true },
  renderIndex: { type: Number, required: true }
})

defineExpose({ exportGraph })

const graphId = ref("graph-id-" + Date.now())
const graphContainer = ref(null)

const viewMermaid = mermaid
const exportMermaid = mermaid

watch(() => props.renderIndex, val => {
  if (val !== 0) {
    renderMermaid()
  }
})
onMounted(() => {
  if (props.renderIndex !== 0) {
    renderMermaid()
  }
})
onUpdated(() => {
  if (props.renderIndex !== 0) {
    renderMermaid()
  }
})

async function renderMermaid() {
  await nextTick()
  if (!graphContainer.value) return

  viewMermaid.initialize({
    startOnLoad: true,
    flowchart: {
      useMaxWidth: true,
      curve: "linear",
      subGraphTitleMargin: {
        top: 10,
        bottom: 10
      }
    },
    theme: "dark",
    wrap: true
  })

  const {
    svg,
    bindFunctions
  } = await viewMermaid.render(
    "export-" + graphId.value,
    props.graphType
    + "\n"
    + "subgraph \""
    + props.subTitle
    + "\"\n"
    + "direction LR\n"
    + props.chart
    + "\nend"
  )
  graphContainer.value.innerHTML = svg
  bindFunctions?.(graphContainer.value)
}

async function exportGraph() {
  exportMermaid.initialize({
    startOnLoad: false,
    flowchart: {
      useMaxWidth: true,
      curve: "linear",
      subGraphTitleMargin: {
        top: 10
      },
      diagramPadding: 50,
      wrappingWidth: 800
    },
    theme: "base"
  })

  const { svg: svgData } = await exportMermaid.render(
    "graphDiv-export",
    props.graphType
    + "\n"
    + "subgraph \""
    + props.subTitle
    + "\"\n"
    + "direction LR\n"
    + props.chart
    + "\nend"
  )


  // Parse the SVG content and remove `max-width`
  let parser = new DOMParser()
  let doc = parser.parseFromString(svgData, "image/svg+xml")
  let svg = doc.querySelector("svg")

  if (svg) {
    // Get existing style
    let style = svg.getAttribute("style") || ""

    // Remove max-width
    style = style.replace(/max-width\s*:\s*[^;]+;?/gi, "")
    svg.setAttribute("style", style.trim())

    const styleTag = document.createElement("style")
    styleTag.innerText = `
    .flowchartTitleText {
      font-size: 36px !important;
      font-weight: bold !important;
    }
    .cluster-label p{
      text-decoration: underline !important;
    }
    `
    svg.prepend(styleTag)
  }

  // Serialize the modified SVG back to string
  let serializer = new XMLSerializer()
  let cleanedSvgData = serializer.serializeToString(doc.documentElement)

  let svgBlob = new Blob([cleanedSvgData], { type: "image/svg+xml;charset=utf-8" })
  let svgUrl = URL.createObjectURL(svgBlob)

  let downloadLink = document.createElement("a")
  downloadLink.href = svgUrl
  downloadLink.download = (props.fileName || "new-file") + ".svg"
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}
</script>

<style scoped lang="scss">
.mermaid {
  background: #161616;
  text-align: center;
  border-radius: 7px;
}
</style>
