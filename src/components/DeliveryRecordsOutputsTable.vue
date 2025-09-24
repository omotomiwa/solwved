<template>
  <q-table
    flat
    :grid="$q.screen.xs"
    selection="none"
    :rows="rows"
    :columns="columns"
    row-key="id"
    :pagination="initialPagination"
    hide-pagination
    class="bordered delivery-record-outputs-viewer"
    table-header-class="text-weight-bolder text-primary"
    color="primary"
  />
</template>

<script>
import { defineComponent, ref } from "vue"

export default defineComponent({
  name: "DeliveryRecordsOutputsTable",
  props: ["outputs"],
  setup() {
    const selectedRecords = ref([])
    const columns = ref([
      { name: "output", label: "Output", field: "output", align: "left" },
      { name: "sub_output", label: "Sub Output", field: "sub_output", align: "left" },
      { name: "project", label: "Project", field: "project", align: "left" },
      { name: "effort", label: "Effort", field: "effort", align: "center" },
      {
        name: "completion",
        label: "Completion",
        field: "completion",
        align: "center",
        format: val => val + "%"
      },
      { name: "status", label: "Status", field: "status", align: "center" },
      { name: "rag", label: "RAG", field: "rag", align: "center" },
      { name: "notes", label: "Notes", field: "notes", align: "left" }
    ])

    return {
      selectedRecords,
      columns,
      initialPagination: {
        rowsPerPage: 0
      }
    }
  },
  computed: {
    rows: function() {
      const r = []
      if (this.outputs && this.outputs.length) {
        for (let index = 0; index < this.outputs.length; index++) {
          const output = this.outputs[index]
          const item = {
            output: output.output.name,
            sub_output: this.getSubOutputLabel(output.sub_output_id, output.output.children),
            project: output.project,
            effort: output.effort,
            completion: output.completion,
            status: output.output_status,
            rag: output.output_rag,
            notes: output.notes
          }
          r.push(item)
        }
      }
      return r
    }
  },
  methods: {
    getSubOutputLabel: function(id, subOutputs) {
      let label = "n/a"
      if (Array.isArray(subOutputs) && subOutputs.length && parseInt(id) > 0) {
        const so = subOutputs.find(elem => parseInt(elem.id) === parseInt(id))
        if (so !== undefined && so.name) {
          label = so.name
        }
      }
      return label
    }
  }
})
</script>

<style>
.bordered {
  border: 1px solid rgba(0, 0, 0, 0.24);
}

.bordered tr.selected {
  background-color: rgba(76, 175, 80, 0.04);
}

.bordered .q-table th {
  font-weight: 600;
  font-size: 0.9rem;
}

.delivery-record-outputs-viewer .q-table tbody td {
  position: relative;
  max-width: 300px !important;
  white-space: normal;
}
</style>
