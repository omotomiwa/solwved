<template>
  <q-table
    v-model:selected="selectedRecords"
    flat
    :grid="$q.screen.xs"
    selection="multiple"
    :rows="rows"
    :columns="columns"
    row-key="engagement_id"
    :pagination="initialPagination"
    hide-pagination
    class="bordered delivery-data"
    color="primary"
    table-header-class="text-weight-bolder text-primary"
    :visible-columns="visibleColumns"
  >
    <template #body-cell-consultantlink="props">
      <q-td :props="props">
        <q-btn
          color="primary"
          outline
          size="sm"
          class="q-px-md q-mr-none q-mr-sm-lg"
          dense
          label="View Records"
          @click="showConsultantRecords(props.value)"
        >
          <q-badge
            v-if="countReportedRecords(props.value.delivery_records)"
            floating
            color="negative"
            align="top"
            class="records-badge"
          >
            <q-icon name="warning" style="font-size: 1.1em" color="white" />
            <div style="font-size: 1.1em" class="q-ml-xs">
              {{ countReportedRecords(props.value.delivery_records) }}
            </div>
            <q-tooltip
              transition-show="scale"
              transition-hide="scale"
              anchor="bottom middle"
              :offset="[10, 10]"
              class="bg-negative"
            >
              <div class="row items-top">
                <q-icon name="warning" style="font-size: 3rem" class="col-auto q-mr-xs" />
                <div class="col-auto" style="font-size: 1rem">
                  <span>Date range includes {{ countReportedRecords(props.value.delivery_records) }} record</span><span
                  v-if="countReportedRecords(props.value.delivery_records) !== 1">s</span><br />
                  <span>already reported on</span>
                </div>
              </div>
            </q-tooltip>
          </q-badge>
        </q-btn>
      </q-td>
    </template>
    <template #body-cell-lastreported="props">
      <q-td :props="props">
        <q-badge color="positive"
                 text-color="dark"
                 :label="props.value.week ?? 0"
                 :class="{'last-submitted-info':props.value.week}" />
        <q-tooltip
          v-if="props.value.week"
          transition-show="fade"
          transition-hide="fade"
          transition-duration="200"
          :delay="600"
          self="center end"
          :offset="[0, 0]"
          class="bg-accent week-reference-tip"
        >
          {{ props.value.name }}'s records have been reported on up to week {{ props.value.week }}
        </q-tooltip>
      </q-td>
    </template>
    <template #body-cell-lastsubmitted="props">
      <q-td :props="props">
        <q-badge
          color="primary"
          text-color="dark"
          :label="props.value.week ?? 0"
          :class="{'last-submitted-info':props.value.week}"
        />
        <q-tooltip
          v-if="props.value.week"
          transition-show="fade"
          transition-hide="fade"
          transition-duration="200"
          :delay="600"
          self="center end"
          :offset="[0, 0]"
          class="bg-accent week-reference-tip"
        >
          {{ props.value.name }} has submitted records up to week {{ props.value.week }}
        </q-tooltip>
      </q-td>
    </template>
    <template #top-left>
      <q-checkbox v-model="submittedOnly" color="primary" label="Show submitted data only" />
      <q-checkbox v-model="excludeReported" color="primary" label="Exclude records already reported on" />
    </template>
    <template #top-right>
      <q-btn
        color="primary"
        icon-right="archive"
        outline
        label="Export to csv"
        no-caps
        @click="exportTable"
      />
      <q-btn
        :disable="!enableReportGeneration"
        class="q-ml-md"
        color="primary"
        icon-right="summarize"
        label="Generate Report"
        outline
        no-caps
        @click="generateReport"
      />
    </template>
    <template #bottom>
      <div v-if="selectedRecords.length" class="col">
        <div class="row items-center justify-between totals grid-col-gap-4">
          <div class="col-12 col-sm-6 col-md-auto">
            {{ selectedRecords.length }} record<span v-if="selectedRecords.length !== 1">s</span> selected
          </div>
          <div class="col-12 col-sm-6 col-md-auto">
            Total effort: {{ selectedTotals.effort }}
          </div>
          <div class="col-12 col-sm-6 col-md-auto">
            Total cost: {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, selectedTotals.cost) }}
          </div>
          <div class="col-12 col-sm-6 col-md-auto">
            Total charge: {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, selectedTotals.charge) }}
          </div>
          <div class="col-12 col-sm-6 col-md-auto">
            Total profit Margin: {{ ((selectedTotals.profit / selectedTotals.charge) * 100).toFixed(2) }}%
          </div>
          <div class="col-12 col-sm-6 col-md-auto">
            Total profit: {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, selectedTotals.profit) }}
          </div>
        </div>
      </div>
    </template>
  </q-table>
</template>

<script>
import { exportFile } from "quasar"
import { defineComponent, ref } from "vue"
import { CurrencyMethods, DateMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"

function wrapCsvValue(val, formatFn) {
  let formatted = formatFn !== void 0 ? formatFn(val) : val
  formatted = formatted === void 0 || formatted === null ? "" : String(formatted)
  formatted = formatted.split("\"").join("\"\"")
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`
}

export default defineComponent({
  name: "DeliveryDataTable",
  props: ["data", "startDate", "endDate"],
  emits: ["showRecords", "generateReport"],
  setup() {
    const selectedRecords = ref([])
    const visibleColumns = ref([
      "consultant",
      "capability",
      "service_line",
      "effort",
      "pay_rate",
      "charge_rate",
      "cost",
      "charge",
      "margin",
      "profit",
      "lastsubmitted",
      "lastreported",
      "consultantlink"
    ])

    return {
      selectedRecords,
      visibleColumns,
      initialPagination: {
        rowsPerPage: 0
      },

      CurrencyMethods
    }
  },
  data() {
    return {
      submittedOnly: true,
      excludeReported: false,
      csvFromToFormatKey: ["lastsubmitted", "lastreported"],
      csvIgnoreColumn: ["consultantlink"]
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
        { name: "engagement_id", label: "Engagement ID", field: "engagement_id", align: "left" },
        {
          name: "consultant",
          label: OrganisationTypeMethods.changeConsultant(this.isBuiltEnvironment),
          field: "consultant",
          align: "left"
        },
        { name: "service_line", label: "Category", field: "service_line", align: "left" },
        { name: "capability", label: "Capability", field: "capability", align: "left" },
        { name: "effort", label: "Effort", field: "effort", align: "center" },
        {
          name: "pay_rate",
          label: "Pay Rate",
          field: "pay_rate",
          align: "right",
          format: val => CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, val)
        },
        {
          name: "charge_rate",
          label: "Charge Rate",
          field: "charge_rate",
          align: "right",
          format: val => CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, val)
        },
        {
          name: "cost",
          label: "Cost",
          field: "cost",
          align: "right",
          format: val => CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, val)
        },
        {
          name: "charge",
          label: "Charge",
          field: "charge",
          align: "right",
          format: val => CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, val)
        },
        {
          name: "margin",
          label: "Margin",
          field: "margin",
          align: "right",
          format: (val, row) => (row?.profit && row?.charge ? (((row.profit / row.charge) * 100) || 0) : 0).toFixed(2) + "%"
        },
        {
          name: "profit",
          label: "Profit",
          field: "profit",
          align: "right",
          format: val => CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, val)
        },
        { name: "lastsubmitted", label: "Submitted", field: "lastsubmitted", align: "center" },
        { name: "lastreported", label: "Reported", field: "lastreported", align: "center" },
        { name: "consultantlink", label: "", field: "consultantlink", align: "left" }
      ]
    },
    rows: function() {
      const r = []
      if (this.requests.length) {
        for (let index = 0; index < this.requests.length; index++) {
          const request = this.requests[index]
          if (request?.consultant_engagements && request.consultant_engagements.length) {
            for (let j = 0; j < request.consultant_engagements.length; j++) {
              const engagement = request.consultant_engagements[j]
              const recent_delivery = this.mostRecent(engagement.delivery_records)
              const item = {
                engagement_id: engagement.id,
                capability: engagement.request_capability?.capability?.name,
                service_line: request?.service_line?.name,
                consultant: engagement.consultant.user.first_name + " " + engagement.consultant.user.last_name,
                effort: this.combinedEffort(engagement.delivery_records),
                pay_rate: parseInt(engagement.pay_rate),
                charge_rate: parseInt(engagement.charge_rate),
                cost: this.combinedEffort(engagement.delivery_records) * engagement.pay_rate,
                charge: this.combinedEffort(engagement.delivery_records) * engagement.charge_rate,
                profit:
                  this.combinedEffort(engagement.delivery_records) * (engagement.charge_rate - engagement.pay_rate),
                lastsubmitted: {
                  week: recent_delivery.submitted.week,
                  name: engagement.consultant.user.first_name + " " + engagement.consultant.user.last_name,
                  start_date: recent_delivery.submitted.start_date,
                  end_date: recent_delivery.submitted.end_date
                },
                lastreported: {
                  week: recent_delivery.reported.week,
                  name: engagement.consultant.user.first_name + " " + engagement.consultant.user.last_name,
                  start_date: recent_delivery.reported.start_date,
                  end_date: recent_delivery.reported.end_date
                },
                consultantlink: engagement
              }

              if (engagement.delivery_records.length) {
                r.push(item)
              }
            }
          }
        }
      }
      return r
    },
    requests: function() {
      let r = []
      if (this.data !== false) {
        if (Array.isArray(this.data?.requests ?? []) && this.data.requests.length) {
          r = JSON.parse(JSON.stringify(this.data.requests ?? []))
          r.sort((a, b) =>
            a.service_line.name > b.service_line.name
              ? 1
              : a.service_line.name === b.service_line.name
                ? a.service_line.name > b.service_line.name
                  ? 1
                  : -1
                : -1
          )
        }
      }
      return r
    },
    selectedEngagementIds: function() {
      const ids = []
      for (let index = 0; index < this.selectedRecords.length; index++) {
        const element = this.selectedRecords[index]
        ids.push(element.engagement_id)
      }
      return ids
    },
    selectedEngagements: function() {
      const e = []
      if (this.requests.length) {
        for (let index = 0; index < this.requests.length; index++) {
          const request = this.requests[index]
          if (request?.consultant_engagements && request.consultant_engagements.length) {
            for (let j = 0; j < request.consultant_engagements.length; j++) {
              const engagement = request.consultant_engagements[j]
              if (this.selectedEngagementIds.indexOf(engagement.id) > -1) {
                e.push(engagement)
              }
            }
          }
        }
      }
      return e
    },
    // NB warning, selectedEngagements have not yet been date filtered
    selectedTotals: function() {
      const totals = { effort: 0, cost: 0, charge: 0, profit: 0 }
      for (let index = 0; index < this.selectedEngagements.length; index++) {
        const engagement = this.selectedEngagements[index]
        const effort = this.combinedEffort(engagement.delivery_records)
        totals.effort += effort
        const cost = effort * engagement.pay_rate
        totals.cost += cost
        const charge = effort * engagement.charge_rate
        totals.charge += charge
      }
      totals.profit = totals.charge - totals.cost
      return totals
    },
    reportedRecordsCount: function() {
      let count = 0
      for (let index = 0; index < this.selectedEngagements.length; index++) {
        const engagement = this.selectedEngagements[index]
        if (engagement.delivery_records && engagement.delivery_records.length) {
          for (let j = 0; j < engagement.delivery_records.length; j++) {
            const record = engagement.delivery_records[j]
            if (
              this.isWithinSelectedDates(record) &&
              this.parsesSubmittedFilter(record) &&
              this.isAlreadyReported(record) &&
              !this.excludeReported
            ) {
              count++
            }
          }
        }
      }
      return count
    },
    enableReportGeneration: function() {
      return this.selectedTotals.charge > 0
    }
  },
  methods: {
    showConsultantRecords: function(e) {
      // filter the records according to current filters
      const engagement = JSON.parse(JSON.stringify(e))
      const projects = engagement.projects.map(el => el.project)
      engagement.delivery_records = JSON.parse(JSON.stringify(this.applyCurrentFilters(engagement.delivery_records, false)))
      engagement.projects = projects
      this.$emit("showRecords", engagement)
    },
    mostRecent: function(records) {
      const sorted = JSON.parse(JSON.stringify(records))
      const r = { submitted: 0, reported: 0 }
      sorted.sort((a, b) => (a.start_date > b.start_date ? -1 : 1))
      if (sorted.length) {
        for (let index = 0; index < sorted.length; index++) {
          const record = sorted[index]
          if (record.status !== "pending") {
            r.reported = record
            break
          }
        }
        for (let index = 0; index < sorted.length; index++) {
          const record = sorted[index]
          if (parseInt(record.submitted) === 1) {
            r.submitted = record
            break
          }
        }
      }
      return r
    },
    combinedEffort: function(records) {
      let e = 0
      if (records && records.length) {
        for (let i = 0; i < records.length; i++) {
          const record = records[i]
          if (
            this.parsesSubmittedFilter(record) &&
            this.parsesExcludedRecordsFilter(record) &&
            this.isWithinSelectedDates(record)
          ) {
            for (let j = 0; j < record.outputs.length; j++) {
              const output = record.outputs[j]
              e += parseFloat(output.effort)
            }
          }
        }
      }
      return e
    },
    parsesSubmittedFilter: function(record) {
      return !!(!this.submittedOnly || (this.submittedOnly && record.submitted))
    },
    parsesExcludedRecordsFilter: function(record) {
      return !(this.excludeReported && this.isAlreadyReported(record))
    },
    countReportedRecords: function(records) {
      let count = 0
      if (records && records.length) {
        for (let index = 0; index < records.length; index++) {
          const record = records[index]
          if (
            this.parsesSubmittedFilter(record) &&
            this.parsesExcludedRecordsFilter(record) &&
            this.isWithinSelectedDates(record)
          ) {
            if (this.isAlreadyReported(record)) {
              count++
            }
          }
        }
      }
      return count
    },
    isAlreadyReported: function(record) {
      return record.status === "accepted" || record.status === "approved"
    },
    isWithinSelectedDates: function(record) {
      const startDate = new Date(DateMethods.convertDateFormat(this.startDate)).getTime()
      const endDate = new Date(DateMethods.convertDateFormat(this.endDate)).getTime()
      const recordStart = new Date(DateMethods.convertDateFormat(record.start_date)).getTime()
      const recordEnd = new Date(DateMethods.convertDateFormat(record.end_date)).getTime()

      return recordStart >= startDate && recordEnd <= endDate
    },
    exportTable: function() {
      // naive encoding to csv format
      const content = [
        this.columns
          .filter(col => !this.csvIgnoreColumn.includes(col.field))
          .map(col => {
            if (this.csvFromToFormatKey.includes(col.name)) {
              return [wrapCsvValue(col.label + " From"), wrapCsvValue(col.label + " To")].join(",")
            } else {
              return wrapCsvValue(col.label)
            }
          })
      ].concat(
        this.rows.map(row =>
          this.columns
            .filter(col => !this.csvIgnoreColumn.includes(col.field))
            .map(col => {
              let val = wrapCsvValue(typeof col.field === "function" ? col.field(row) : row[col.field === void 0 ? col.name : col.field], col.format)

              if (this.csvFromToFormatKey.includes(col.name)) {
                if (typeof col.field === "function") {
                  val = [
                    wrapCsvValue(col.field(row)?.start_date, col.format),
                    wrapCsvValue(col.field(row)?.end_date, col.format)
                  ].join(",")
                } else {
                  val = [
                    wrapCsvValue(row[col.field === void 0 ? col.name : col.field]["start_date"] ?? "", col.format),
                    wrapCsvValue(row[col.field === void 0 ? col.name : col.field]["end_date"] ?? "", col.format)
                  ].join(",")
                }
              }
              return val
            }).join(",")
        )
      ).join("\r\n")

      const status = exportFile("table-export.csv", content, "text/csv")

      if (status !== true) {
        this.$q.notify({
          message: "Browser denied file download...",
          color: "negative",
          icon: "warning"
        })
      }
    },
    // if forReport is true, it excludes unsubmitted records and any previously reported records
    applyCurrentFilters: function(records, forReport) {
      if (forReport === undefined) {
        forReport = false
      }
      const r = []
      if (records && records.length) {
        for (let i = 0; i < records.length; i++) {
          const record = records[i]
          if (forReport && record.submitted && !this.isAlreadyReported(record) && this.isWithinSelectedDates(record)) {
            r.push(record)
          } else if (
            !forReport &&
            this.parsesSubmittedFilter(record) &&
            this.parsesExcludedRecordsFilter(record) &&
            this.isWithinSelectedDates(record)
          ) {
            r.push(record)
          }
        }
      }
      return r
    },
    generateReport: function() {
      // filter delivery records according to the selected filters
      const requests = {}

      for (let index = 0; index < this.selectedEngagements.length; index++) {
        const engagement = JSON.parse(JSON.stringify(this.selectedEngagements[index]))
        engagement.delivery_records = JSON.parse(JSON.stringify(this.applyCurrentFilters(engagement.delivery_records, true)))

        if (!Object.prototype.hasOwnProperty.call(requests, engagement.request.id)) {
          requests[engagement.request.id] = {
            engagements: [],
            request_id: engagement.request.id,
            po_id: engagement.request.purchase_order_id,
            po_ref: engagement.request.purchase_order.reference,
            service_line_id: engagement.request.service_line_id,
            service_line_name: engagement.request.service_line.name,
            service_owner:
              engagement.request.service_owner === null
                ? "Not Specified"
                : engagement.request.service_owner.first_name + " " + engagement.request.service_owner.last_name,
            service_owner_id: engagement.request.service_owner === null ? null : engagement.request.service_owner.id,
            service_requester:
              engagement.request.service_requester === null
                ? "Not Specified"
                : engagement.request.service_requester.first_name +
                " " +
                engagement.request.service_requester.last_name,
            service_requester_id:
              engagement.request.service_requester === null ? null : engagement.request.service_requester.id,
            delivery_model_id: engagement.request.delivery_model_id,
            delivery_model: engagement.request.delivery_model.name,
            financial_model_id: engagement.request.financial_model_id,
            financial_model: engagement.request.financial_model.name,
            period_charge: 0,
            period_cost: 0,
            period_effort: 0
          }
        }
        requests[engagement.request.id].engagements.push(engagement)
      }

      const requestArray = []
      let totalCharge = 0
      // now loop through the requests, and total up all the charge and effort
      for (const id in requests) {
        const collation = this.collatePeriodTotals(requests[id].engagements)
        requests[id].period_charge = collation.charge
        requests[id].period_cost = collation.cost
        totalCharge += collation.charge
        requests[id].period_effort = collation.effort
        requests[id].total_engagements = collation.engagements
        if (parseInt(requests[id].delivery_model_id) === 1) {
          requests[id].consultant = collation.consultant
          requests[id].consultant_id = collation.consultant_id
          requests[id].competency = collation.competency
          requests[id].competency_id = collation.competency_id
        } else {
          requests[id].consultant = null
          requests[id].consultant_id = null
        }
        requestArray.push(requests[id])
      }

      if (totalCharge > 0) {
        // then emit the data to the parent component, for data saving
        this.$emit("generateReport", requestArray)
      } else {
        alert("The total charge must be more than zero, excluding any records previously reported on")
      }
    },
    collatePeriodTotals: function(engagements) {
      let charge = 0
      let cost = 0
      let totalEffort = 0
      let totalEngagements = 0
      let consultant = null
      let consultantId = null
      let competency = null
      let competencyId = null
      for (let e = 0; e < engagements.length; e++) {
        totalEngagements += 1
        const engagement = engagements[e]
        consultant = engagement.consultant.user.first_name + " " + engagement.consultant.user.last_name
        consultantId = engagement.consultant.id
        competency = engagement.competency.name
        competencyId = engagement.competency_id
        let effort = 0
        if (engagement.delivery_records && engagement.delivery_records.length) {
          for (let i = 0; i < engagement.delivery_records.length; i++) {
            const deliveryRecord = engagement.delivery_records[i]
            if (deliveryRecord.outputs && deliveryRecord.outputs.length) {
              for (let j = 0; j < deliveryRecord.outputs.length; j++) {
                effort += deliveryRecord.outputs[j].effort
              }
            }
          }
        }
        totalEffort += effort
        charge += effort * engagement.charge_rate
        cost += effort * engagement.pay_rate
      }
      return {
        charge: charge,
        cost: cost,
        effort: totalEffort,
        engagements: totalEngagements,
        consultant: consultant,
        consultant_id: consultantId,
        competency: competency,
        competency_id: competencyId
      }
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

.records-badge {
  top: -8px;
  right: -26px;
}

.delivery-data .q-table th,
.delivery-data .q-table td {
  padding: 5px 5px;
}

.last-submitted-info {
  cursor: help;
}

.week-reference-tip {
  font-size: 1rem;
}
</style>
