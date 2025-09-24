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
    class="bordered"
    table-header-class="text-weight-bolder text-primary"
    color="primary"
  >
    <template #body-cell-action="props">
      <q-td :props="props">
        <div>
          <q-btn
            color="green"
            label="EDIT"
            size="sm"
            icon="edit"
            @click="editEngagement(props.value)"
          />
        </div>
      </q-td>
    </template>
  </q-table>
</template>

<script>
import { defineComponent, ref } from "vue"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"

export default defineComponent({
  name: "ConsultantEngagementsTable",
  props: ["engagements"],
  emits: ["editEngagement"],
  setup() {
    const selectedRecords = ref([])

    return {
      selectedRecords,
      initialPagination: {
        rowsPerPage: 0
      }
    }
  },
  computed: {
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    isBuiltEnvironment: function() {
      return this.$store.getters["admin/getIsBuiltEnvironment"]
    },
    columns: function() {
      return [
        {
          name: "consultant",
          label: OrganisationTypeMethods.changeConsultant(this.isBuiltEnvironment),
          field: "consultant",
          align: "left"
        },
        { name: "capability", label: "Capability", field: "capability", align: "left" },
        { name: "competency", label: "Competency", field: "competency", align: "left" },
        { name: "projects", label: "Projects", field: "projects", align: "left" },
        {
          name: "charge_rate",
          label: "Charge Rate",
          field: "charge_rate",
          align: "right",
          format: val => CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, val)
        },
        {
          name: "pay_rate",
          label: "Pay Rate",
          field: "pay_rate",
          align: "right",
          format: val => CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, val)
        },
        {
          name: "budget",
          label: "Budget",
          field: "budget",
          align: "right",
          format: val => CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, val)
        },
        { name: "units", label: "Units", field: "units", align: "center" },
        { name: "status", label: "Status", field: "status", align: "center" },
        { name: "action", label: "Actions", field: "action", align: "right" }
      ]
    },
    rows: function() {
      const r = []
      if (this.engagements.length) {
        for (let index = 0; index < this.engagements.length; index++) {
          const engagement = this.engagements[index]
          const item = {
            id: engagement.id,
            consultant: this.buildConsultantString(engagement),
            capability: this.buildCapabilityString(engagement),
            competency: engagement.competency.name,
            charge_rate: parseInt(engagement.charge_rate),
            pay_rate: parseInt(engagement.pay_rate),
            budget: parseInt(engagement.budget),
            units: engagement.units,
            status: this.buildStatusString(engagement.status_id),
            action: engagement.id
          }
          const projects = []
          for (let index = 0; index < engagement.projects.length; index++) {
            const p = engagement.projects[index]
            if (p.project && p.project.name) {
              projects.push(p.project.name)
            }
          }
          item.projects = projects.join(", ")

          r.push(item)
        }
      }
      return r
    }
  },
  methods: {
    editEngagement: function(id) {
      this.$emit("editEngagement", id)
    },
    buildCapabilityString: function(engagement) {
      let s = "Data error"
      if (engagement.request_capability && engagement.request_capability.capability && engagement.request_capability.capability.name) {
        s = engagement.request_capability.capability.name
      }
      return s
    },
    buildConsultantString: function(engagement) {
      let s = "Data error"
      if (engagement.consultant && engagement.consultant.user && engagement.consultant.user.first_name) {
        s = engagement.consultant.user.first_name + " " + engagement.consultant.user.last_name
      }
      return s
    },
    buildStatusString: function(statusId) {
      const statusMap = { 1: "Active", 2: "Paused", 3: "Archived" }
      return statusMap[parseInt(statusId)]
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
</style>
