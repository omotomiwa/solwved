<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">
        {{ OrganisationTypeMethods.changeConsultant(isBuiltEnvironment) }} Delivery Records
      </div>
      <div class="text-subtitle1 q-mb-md text-center">
        <span style="font-style: italic">for </span> <span style="font-weight: bold">{{ user_name }}</span>
        <span style="font-style: italic"> on behalf of </span>
        <span style="font-weight: bold">{{ engagement.vendor }}</span>
      </div>
      <div class="details2 text-weight-bold row">
        <div>Customer: <span class="text-primary"> {{ engagement.customer }}</span></div>
        <div class="q-mx-sm">|</div>
        <div>Service: <span class="text-primary"> {{ engagement.service_name }}</span></div>
        <div class="q-mx-sm">|</div>
        <div>Capability: <span class="text-primary">{{ engagement.capability }}</span></div>
        <div class="q-mx-sm">|</div>
        <div>Competency: <span class="text-primary">{{ engagement.competency }}</span></div>
      </div>
      <div class="details text-weight-medium text-white">
        {{ engagement_dates }}. Status:
        <span :class="engagement_status_class">
          <span class="ucfirst">{{ engagement_status }}</span>
          {{ engagement_status_message }}
        </span>
      </div>
      <q-separator class="q-my-md" />
      <q-table
        v-model:selected="selectedRecords"
        flat
        :grid="$q.screen.xs"
        selection="multiple"
        color="primary"
        :rows="rows"
        :columns="columns"
        row-key="week"
        :pagination="initialPagination"
        hide-pagination
        class="bordered"
        table-header-class="text-weight-bolder text-primary swlvd-checkbox"
      >
        <template #body-cell-action="props">
          <q-td :props="props">
            <div v-if="!props.row.submitted">
              <q-btn
                color="primary"
                outline
                label="EDIT"
                size="sm"
                :to="props.value"
                icon="edit"
              />
            </div>
          </q-td>
        </template>
        <template v-if="$q.screen.xs" #top>
          <div v-if="selectedRecords.length" class="col row items-center justify-between">
            <div>{{ selectedRecords.length }} record<span v-if="selectedRecords.length !== 1">s</span> selected</div>
            <div>Total effort: {{ selectedTotalEffort }}</div>
            <div>
              <q-btn
                :label="submitLabel"
                color="primary"
                text-color="dark"
                @click="submitSelectedRecords"
              />
            </div>
          </div>
        </template>
        <template #bottom-row>
          <q-tr>
            <q-td colspan="5" class="text-right">Total: {{ totalEffort }} out of {{ engagement.units }}</q-td>
            <q-td colspan="2" class="text-left" :class="remainingUnits <= 5 ? 'text-negative' : ''">
              <div class="row items-center">
                <q-icon v-if="remainingUnits < 6" name="warning" class="q-mr-xs" />
                <div v-if="remainingUnits >= 0">{{ remainingUnits }} units remaining</div>
                <div v-else>Maximum units breached. Contact your manager</div>
              </div>
            </q-td>
          </q-tr>
        </template>
        <template #bottom>
          <div v-if="selectedRecords.length" class="col row items-center justify-between totals">
            <div>{{ selectedRecords.length }} record<span v-if="selectedRecords.length !== 1">s</span> selected</div>
            <div>Total effort: {{ selectedTotalEffort }}</div>
            <div>
              <q-btn
                :label="submitLabel"
                color="primary"
                text-color="dark"
                @click="submitSelectedRecords"
              >
                <q-tooltip
                  class="st-tooltip"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-icon name="warning" style="font-size: 1.6rem" />
                  Once submitted you cannot edit a record
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </template>
        <template #body-selection="service">
          <q-checkbox v-if="!service.row.submitted"
                      v-model="service.selected"
                      color="primary"
                      class="swlvd-checkbox" />
        </template>
        <template #item="props">
          <div class="col-xs-12 q-mb-sm">
            <q-card :class="props.selected ? 'bg-grey-2' : ''">
              <q-card-section>
                <q-checkbox v-model="props.selected" dense :label="'Week ' + props.row.week" />
              </q-card-section>
              <q-separator />
              <q-list dense>
                <q-item v-for="col in filterColAttributesForCard(props.cols)" :key="col.name">
                  <q-item-section>
                    <q-item-label>{{ col.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label caption>
                      {{ col.value }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-card-section>
                <q-btn
                  v-if="!props.row.submitted"
                  color="primary"
                  outline
                  label="EDIT"
                  size="sm"
                  :to="props.row.action"
                  icon="edit"
                />
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
      <div class="row">
        <router-link class="q-mt-lg q-mr-lg" to="/consultant"> View Dashboard</router-link>
        <router-link v-if="allowNewRecord && !allPossibleRecordsSubmitted" class="q-mt-lg" :to="newDeliveryRecordLink">
          New Record
        </router-link>
      </div>
    </div>
    <q-dialog v-model="saveDataResponse">
      <q-card>
        <q-card-section>
          <div class="text-h6">Submit Record(s) Message</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ saveDataMessage }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            label="OK"
            color="primary"
            text-color="dark"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue"
import { DateTime } from "luxon"
import { remove as _remove } from "lodash"
import { ClassCombinations, Config } from "src/modules/StaticData.js"
import { DateMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"

export default defineComponent({
  name: "DeliveryRecords",
  props: ["engagement_id"],
  setup() {
    const selectedRecords = ref([])
    const columns = ref([
      { name: "week", required: true, label: "Week", align: "center", field: "week", sortable: true },
      { name: "dates", align: "center", label: "Dates", field: "dates", sortable: false },
      { name: "outputs", align: "center", label: "Outputs", field: "outputs", sortable: false },
      { name: "effort", align: "center", label: "Effort", field: "effort" },
      {
        name: "submitted",
        label: "Submitted?",
        field: "submitted",
        align: "center",
        format: val => val ? "Yes" : "No"
      },
      { name: "action", label: "Actions", field: "action", align: "right" }
    ])
    const saveDataResponse = ref()
    const saveDataMessage = ref("")
    const saveError = ref(false)

    return {
      selectedRecords,
      columns,
      saveDataResponse,
      saveDataMessage,
      saveError,

      initialPagination: {
        rowsPerPage: 0
      },

      OrganisationTypeMethods,
      ClassCombinations
    }
  },
  computed: {
    isBuiltEnvironment: function() {
      // return this.$store.getters["admin/getIsBuiltEnvironment"]
      return false
    },
    rows: function() {
      const records = []
      if (this.engagement_records.length) {
        for (let index = 0; index < this.engagement_records.length; index++) {
          const record = this.engagement_records[index]
          const item = {
            week: record.week,
            year: parseInt(DateTime.fromISO(DateMethods.convertDateFormat(record.start_date, "/", "-")).startOf("week").toFormat(Config.YEAR_FORMAT)),
            dates: this.formatDate(record.start_date),
            outputs: record.outputs.length,
            effort: this.combinedUnits(record.outputs),
            action: this.buildEditLink(record),
            id: record.id,
            submitted: record.submitted
          }
          records.push(item)
        }
      }
      records.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year
        return b.week - a.week
      })
      return records
    },
    totalEffort: function() {
      let units = 0
      for (let record of this.engagement_records) {
        const effort = this.combinedUnits(record.outputs)
        units += effort
      }
      return units
    },
    remainingUnits: function() {
      return this.engagement.units - this.totalEffort
    },
    submitLabel: function() {
      if (this.selectedRecords.length === 1) {
        return "SUBMIT RECORD"
      }
      return "SUBMIT SELECTED RECORDS (" + this.selectedRecords.length + ")"
    },
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    user_name: function() {
      return this.user.first_name + " " + this.user.last_name
    },
    all_records: function() {
      return this.$store.getters["consultant/getDeliveryRecords"]
    },
    engagement_records: function() {
      let r = []
      if (this.all_records !== false && this.all_records[this.engagement_id]) {
        r = this.all_records[this.engagement_id]
      }
      const sorted = JSON.parse(JSON.stringify(r))
      sorted.sort((a, b) => (a.start_date > b.start_date ? -1 : 1))
      return sorted
    },
    engagements: function() {
      return this.$store.getters["consultant/getEngagements"]
    },
    engagement: function() {
      if (this.engagements.length) {
        const id = parseInt(this.engagement_id)
        return this.engagements.find(function(engagement) {
          if (engagement.id === id) {
            return engagement
          }
          return false
        })
      }
      return false
    },
    allowNewRecord: function() {
      return !!(this.engagement && parseInt(this.engagement.status_id) === 1 && this.remainingUnits > 0)
    },
    engagement_dates: function() {
      if (this.engagement) {
        return "Engagement start: " + this.engagement.start_date + " - Engagement end: " + this.engagement.end_date
      }
      return ""
    },
    engagement_status: function() {
      let s = ""
      if (this.engagement) {
        s = "active"
        const now = DateTime.now().toJSDate().getTime()
        if (parseInt(this.engagement.status_id) === 1 && DateTime.fromISO(DateMethods.convertDateFormat(this.engagement.end_date, "/", "-")).toJSDate().getTime() < now) {
          s = "expired"
        } else if (parseInt(this.engagement.status_id) === 1) {
          return "active"
        } else if (parseInt(this.engagement.status_id) === 2) {
          return "paused"
        } else if (parseInt(this.engagement.status_id) === 3) {
          return "archived"
        }
      }
      return s
    },
    engagement_status_message: function() {
      if (this.engagement) {
        const now = DateTime.now().toJSDate().getTime()
        if (parseInt(this.engagement.status_id) === 1 && DateTime.fromISO(DateMethods.convertDateFormat(this.engagement.end_date, "/", "-")).toJSDate().getTime() < now) {
          const cutoff = DateTime.fromISO(DateMethods.convertDateFormat(this.engagement.end_date, "/", "-")).plus({ days: 30 }).toFormat(Config.DATE_FORMAT_DLY)
          if (this.allPossibleRecordsSubmitted) {
            return ". You have submitted all possible records for this engagement."
          } else {
            return ". You have until " + cutoff + " to complete all of your delivery records."
          }
        } else if (parseInt(this.engagement.status_id) === 2) {
          return ". This engagement is on a temporary hold. You can view but not edit records"
        }
        return ""
      }
      return ""
    },
    engagement_status_class: function() {
      const statusClassMap = {
        active: "text-positive text-weight-bold",
        expired: "text-negative text-weight-bold",
        paused: "text-accent text-weight-bold",
        archived: "text-weight-bold text-secondary"
      }

      return statusClassMap[this.engagement_status] || ""
    },
    selectedTotalEffort: function() {
      let total = 0
      for (let index = 0; index < this.selectedRecords.length; index++) {
        const record = this.selectedRecords[index]
        total += record.effort
      }
      return total
    },
    newDeliveryRecordLink: function() {
      return "/delivery-record/" + this.engagement_id + "/new"
    },
    allEngagementWeeks: function() {
      const a = []
      if (this.engagement) {
        const startWeek = DateTime.fromISO(DateMethods.convertDateFormat(this.engagement.start_date, "/", "-")).weekNumber
        const startYear = DateTime.fromISO(DateMethods.convertDateFormat(this.engagement.start_date, "/", "-")).weekYear
        const finalWeek = DateTime.fromISO(DateMethods.convertDateFormat(this.engagement.end_date, "/", "-")).weekNumber
        const finalYear = DateTime.fromISO(DateMethods.convertDateFormat(this.engagement.end_date, "/", "-")).weekYear

        const endWeek = finalWeek

        for (let index = startYear; index <= finalYear; index++) {
          // process all the years
          if (index === startYear) {
            if (startYear === finalYear) {
              // loop through until the end week
              for (let w = startWeek; w <= endWeek; w++) {
                a.push({ label: w, value: index + "-" + w })
              }
            } else {
              // loop through from start to last week in year
              const lastWeek = DateTime.local(index).weeksInWeekYear
              for (let w = startWeek; w <= lastWeek; w++) {
                a.push({ label: index + " - Week " + w, value: index + "-" + w })
              }
            }
          } else if (index > startYear && index < finalYear) {
            // just create all the weeks in this year
            const lastWeek = DateTime.local(index).weeksInWeekYear
            for (let w = 1; w <= lastWeek; w++) {
              a.push({ label: index + " - Week " + w, value: index + "-" + w })
            }
          } else if (index === finalYear) {
            // only get here if multiple years
            // loop from 1 up to the last week
            for (let w = 1; w <= finalWeek; w++) {
              a.push({ label: index + " - Week " + w, value: index + "-" + w })
            }
          }
        }
      }
      // a.reverse()
      return a
    },
    totalPossibleRecords: function() {
      return this.allEngagementWeeks.length
    },
    submittedWeeks: function() {
      const weeks = []
      for (let j = 0; j < this.engagement_records.length; j++) {
        const record = this.engagement_records[j]
        const year = DateTime.fromISO(DateMethods.convertDateFormat(record.start_date, "/", "-")).weekYear

        if (parseInt(record.submitted) === 1) {
          weeks.push(year + "-" + record.week)
        }
      }
      return weeks
    },
    allPossibleRecordsSubmitted: function() {
      return this.submittedWeeks.length === this.totalPossibleRecords
    }
  },
  watch: {
    selectedRecords: function(newVal) {
      for (let index = newVal.length - 1; index >= 0; index--) {
        const record = newVal[index]
        if (record.submitted === 1) {
          newVal.splice(index, 1)
        }
      }
    }
  },
  created() {
    this.$store.dispatch("consultant/engagements")
    this.$store.dispatch(
      "consultant/getDeliveryRecords",
      { consultant_engagement_id: parseInt(this.engagement_id) }
    )
  },
  methods: {
    formatDate: function(date) {
      const start = DateTime.fromISO(DateMethods.convertDateFormat(date, "/", "-")).startOf("week").toFormat(Config.DATE_FORMAT_DLY)
      const end = DateTime.fromISO(DateMethods.convertDateFormat(date, "/", "-")).endOf("week").toFormat(Config.DATE_FORMAT_DLY)
      return start + " - " + end
    },
    combinedUnits: function(outputs) {
      let units = 0
      for (let index = 0; index < outputs.length; index++) {
        const effort = outputs[index].effort
        units += effort * 1
      }
      return units
    },
    buildEditLink: function(record) {
      return "/delivery-record/" + this.engagement_id + "/edit/" + record.id
    },
    filterColAttributesForCard: function(cols) {
      return _remove(cols, function(item) {
        return !(item.name === "week" || item.name === "action")
      })
    },
    submitSelectedRecords: function() {
      const ids = this.selectedRecords.map(a => a.id)
      const data = { records: ids }
      this.$store.dispatch("consultant/submitDeliveryRecords", data).then(() => {
        this.saveError = false
        this.saveDataResponse = true
        this.saveDataMessage = "Record(s) submitted successfully"
        this.$store.dispatch(
          "consultant/getDeliveryRecords",
          { consultant_engagement_id: parseInt(this.engagement_id) }
        )
      }).catch(e => {
        this.saveError = true
        this.saveDataMessage = e
        this.saveDataResponse = true
      })
    }
  }
})
</script>

<style scoped>
.details {
  font-size: 1.2rem;
}

.details2 {
  font-size: 1.1rem;
}
</style>

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
