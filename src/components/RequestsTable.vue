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
          <q-btn color="green" label="VIEW / EDIT" size="sm" :to="props.value" service: icon="edit" />
        </div>
      </q-td>
    </template>
  </q-table>
</template>

<script>
import { date } from "quasar"
import { defineComponent, ref } from "vue"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"
import { Config } from "src/modules/StaticData.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"

export default defineComponent({
  name: "RequestsTable",
  props: ["requests"],
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
          name: "request_date",
          label: "Request Date",
          field: "request_date",
          align: "center",
          format: val => val ? date.formatDate(val, Config.DATE_FORMAT_DMY) : "-"
        },
        { name: "service_line", label: "Category", field: "service_line", align: "left" },
        /* { name: 'delivery_model', label: 'Delivery Model', field: 'delivery_model', align: 'left' },
        { name: 'financial_model', label: 'Financial Model', field: 'financial_model', align: 'left' }, */
        {
          name: "start_date",
          label: "Start Date",
          field: "start_date",
          align: "center",
          format: val => val ? date.formatDate(val, Config.DATE_FORMAT_DMY) : "-"
        },
        {
          name: "end_date",
          label: "End Date",
          field: "end_date",
          align: "center",
          format: val => val ? date.formatDate(val, Config.DATE_FORMAT_DMY) : "-"
        },
        {
          name: "consultants",
          label: OrganisationTypeMethods.changeConsultant(this.isBuiltEnvironment, { isPlural: true }),
          field: "consultants",
          align: "left"
        },
        {
          name: "budget",
          label: "Budget",
          field: "budget",
          align: "right",
          format: val => CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, val)
        },
        { name: "units", label: "Units", field: "units", align: "center" },
        { name: "action", label: "Actions", field: "action", align: "right" }
      ]
    },
    rows: function() {
      const r = []
      if (this.requests.length) {
        for (let index = 0; index < this.requests.length; index++) {
          const request = this.requests[index]
          const item = {
            id: request.id,
            service_line: request.service_line.name,
            // service_name: request.service_name.name,
            // delivery_model: request.delivery_model.delivery_model.name,
            // financial_model: request.financial_model.financial_model.name,
            consultants: Array.isArray(request.consultant_engagements) ? request.consultant_engagements.length : 0,
            budget: Math.round(request.budget),
            units: request.units,
            request_date: request.request_date,
            start_date: request.start_date,
            end_date: request.end_date,
            action: this.buildEditLink(request)
          }

          if (request.delivery_model && request.delivery_model.delivery_model) {
            item.delivery_model = request.delivery_model.delivery_model.name
          }
          if (request.financial_model && request.financial_model.financial_model) {
            item.financial_model = request.financial_model.financial_model.name
          }

          r.push(item)
        }
      }
      return r
    }
  },
  methods: {
    buildEditLink: function(record) {
      return this.$route.path + "/requests/" + record.id
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
