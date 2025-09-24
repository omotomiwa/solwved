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
    <template #bottom>
      <div class="col">
        <div class="col row items-center justify-between totals">
          <div>Total charge: {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, totalCharge) }}</div>
        </div>
      </div>
    </template>
  </q-table>
</template>

<script>
import { defineComponent, ref } from "vue"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"

export default defineComponent({
  name: "ContingentLabourReportTable",
  props: ["purchase_orders", "service"],
  setup() {
    const selectedRecords = ref([])

    return {
      selectedRecords,
      initialPagination: {
        rowsPerPage: 0
      },

      CurrencyMethods
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
      let columnList = [
        {
          name: "name",
          label: OrganisationTypeMethods.changeConsultant(this.isBuiltEnvironment),
          field: "name",
          align: "left"
        },
        { name: "po", label: "Purchase Order", field: "po", align: "left" }
      ]

      if (this.service?.has_competency) {
        columnList.push({ name: "competency", label: "Competency", field: "competency", align: "left" })
      }

      return [
        ...columnList,
        { name: "period_effort", label: "Units", field: "period_effort", align: "center" },
        {
          name: "period_charge",
          label: "Period Charge",
          field: "period_charge",
          align: "right",
          format: val => CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, val)
        },
        {
          name: "cumulative_charge",
          label: "Charged to date",
          field: "cumulative_charge",
          align: "right",
          format: val => CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, val)
        },
        {
          name: "po_value",
          label: "PO Value",
          field: "po_value",
          align: "right",
          format: val => CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, val)
        },
        {
          name: "po_remaining",
          label: "PO Remaining",
          field: "po_remaining",
          align: "right",
          format: val => CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, val)
        },
        { name: "service_requester", label: "Service Requester", field: "service_requester", align: "left" }
      ]
    },
    totalCharge: function() {
      let charge = 0
      for (let index = 0; index < this.rows.length; index++) {
        const item = this.rows[index]
        charge += parseFloat(item.period_charge)
      }
      return charge
    },
    rows: function() {
      const r = []
      if (this.purchase_orders.length) {
        for (let index = 0; index < this.purchase_orders.length; index++) {
          const consultants = this.purchase_orders[index].consultants
          for (let j = 0; j < consultants.length; j++) {
            const consultant = consultants[j]
            const cumulativeCharge = parseFloat(this.purchase_orders[index].cumulative_charge) + parseFloat(consultant.period_charge)
            const item = {
              name: consultant.consultant,
              po: consultant.po_ref,
              period_charge: consultant.period_charge,
              period_effort: consultant.period_effort,
              service_requester: consultant.service_requester,
              competency: consultant.competency,
              cumulative_charge: cumulativeCharge,
              po_value: this.purchase_orders[index].amount,
              po_remaining: parseFloat(this.purchase_orders[index].amount) - cumulativeCharge
            }

            r.push(item)
          }
        }
      }
      return r
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

.totals {
  font-size: 1rem;
  font-weight: 600;
}
</style>
