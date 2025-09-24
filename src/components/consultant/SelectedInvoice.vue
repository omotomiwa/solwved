<template>
      <q-page :class="cc?.pageContainer">
        <div v-if="!allowNewRecord || action === 'edit'"
             class="w-standard q-pa-xs-xs q-pa-lg-lg q-mt-xs-md q-mt-lg-xl q-mb-xs-xl swlvd-container-bg">
          
          <div class="details2 text-weight-bold row q-mb-xl">
            <div>New <span class="text-weight-light"> timesheet</span></div>
            <div class="q-mx-sm">|</div>
            <div>For ContLabVen: <span class="primary"> {{ selectedWeekLabel }}</span></div>
            
            
          </div>
          <div v-if="engagement" class="column q-mb-xs-xl">
            <div class="column q-pa-xs-sm q-pa-md-md q-pa-lg-lg no-wrap">
              <div class="row q-col-gutter-sm q-mb-sm">
                <q-field
                  class="col-xs-6 col-sm"
                  :dense="quasar.screen.lt.sm"
                  standout
                  readonly
                  color="primary"
                  hide-bottom-space
                  label="Customer"
                  stack-label
                  label-color="white"
                  autofocus
                >
                  <template #control>
                    <div class="self-center full-width no-outline ellipsis" tabindex="1">
                      {{ engagement.customer }}
                    </div>
                  </template>
                </q-field>
                <q-field
                  class="col-xs-6 col-sm"
                  :dense="quasar.screen.lt.sm"
                  standout
                  readonly
                  color="primary"
                  hide-bottom-space
                  label="Contract"
                  stack-label
                  label-color="white"
                >
                  <template #control>
                    <div class="self-center full-width no-outline ellipsis" tabindex="1">
                      {{ engagement.contract_reference }}
                    </div>
                  </template>
                </q-field>
                <q-field
                  class="col-xs-6 col-sm"
                  :dense="quasar.screen.lt.sm"
                  standout
                  readonly
                  color="primary"
                  hide-bottom-space
                  label="Service"
                  stack-label
                  label-color="white"
                >
                  <template #control>
                    <div class="self-center full-width no-outline ellipsis" tabindex="1">
                      {{ engagement.service_name }}
                    </div>
                  </template>
                </q-field>
                <q-field
                  class="col-xs-6 col-sm"
                  :dense="quasar.screen.lt.sm"
                  standout
                  readonly
                  color="primary"
                  hide-bottom-space
                  label="Category"
                  stack-label
                  label-color="white"
                >
                  <template #control>
                    <div class="self-center full-width no-outline ellipsis" tabindex="1">
                      {{ engagement.service_line }}
                    </div>
                  </template>
                </q-field>
              </div>
              <div class="row q-col-gutter-sm q-mb-sm">
                <q-field
                  class="col-xs-6 col-sm"
                  :dense="quasar.screen.lt.sm"
                  standout
                  readonly
                  color="primary"
                  hide-bottom-space
                  label="Capability Type"
                  stack-label
                  label-color="red"
                >
                  <template #control>
                    <div class="self-center full-width no-outline" tabindex="1">
                      {{ engagement.capability }}
                    </div>
                  </template>
                </q-field>
                <q-field
                  v-if="engagement.service_has_competency"
                  class="col-xs-6 col-sm"
                  :dense="quasar.screen.lt.sm"
                  standout
                  readonly
                  color="primary"
                  hide-bottom-space
                  label="Competency"
                  stack-label
                  label-color="red"
                >
                  <template #control>
                    <div class="self-center full-width no-outline" tabindex="1">
                      {{ engagement.competency }}
                    </div>
                  </template>
                </q-field>
              </div>
              <div class="row q-col-gutter-sm q-mb-sm">
                <q-field
                  class="col-12 col-md"
                  :dense="quasar.screen.lt.sm"
                  standout
                  readonly
                  color="primary"
                  hide-bottom-space
                  :label="OrganisationTypeMethods.changeConsultant(isBuiltEnvironment)"
                  stack-label
                  label-color="white"
                >
                  <template #control>
                    <div class="self-center full-width no-outline" tabindex="0">
                      {{ user.fullName }}
                    </div>
                  </template>
                </q-field>
                <new-selector-form
                  v-if="action === 'new'"
                  v-model:option_id="selectedWeek"
                  classes="col-4 col-md"
                  :dense="quasar.screen.lt.sm"
                  hide-bottom-space
                  is-filterable
                  filter-key="label"
                  option-label="label"
                  option-val-key="value"
                  :options="weekOptions"
                  label="Week"
                  default-class="full-width"
                />
                <q-field
                  v-if="action === 'edit'"
                  class="col-4 col-md"
                  :dense="quasar.screen.lt.sm"
                  standout
                  readonly
                  color="primary"
                  hide-bottom-space
                  label="Week"
                  stack-label
                  label-color="white"
                >
                  <template #control>
                    <div class="self-center full-width no-outline" tabindex="0">
                      {{ selectedWeekLabel }}
                    </div>
                  </template>
                </q-field>
                <q-field
                  class="col-8 col-md"
                  :dense="quasar.screen.lt.sm"
                  standout
                  readonly
                  color="primary"
                  hide-bottom-space
                  label="Period"
                  stack-label
                  label-color="white"
                >
                  <template #prepend>
                    <q-icon name="event" color="green" />
                  </template>
                  <template #control>
                    <div class="self-center full-width no-outline" tabindex="1">
                      {{ weekStartDate }} - {{ weekEndDate }}
                    </div>
                  </template>
                </q-field>
              </div>
              <div>
                <div v-if="fallowWeek" class="row items-center">
                  <div class="effortLess bg-primary text-dark q-py-md" style="width: calc(100% - 40px)">
                    No activity / tasks this week: {{ fallowWeek.reason }}
                  </div>
                  <div style="width: 40px">
                    <q-btn
                      icon="remove"
                      class="remove-button q-mx-md"
                      color="negative"
                      round
                      size="xs"
                      @click="removeFallowWeek"
                    />
                  </div>
                </div>
    
                <div class="row items-center no-wrap q-mt-lg q-mb-sm">
                  <div class="col">
                    <div class="text-h6">Days Worked</div>
                  </div>
                </div>
    
                <days-row
                  v-for="(output, index) in outputs"
                  :class="index > 0 ? 'q-mt-md' : ''"
                  :key="index"
                  :org-id="engagement.vendor_id"
                  :project-options="engagement.projects"
                  :available-outputs="availableOutputs"
                  :used-outputs="[]"
                  :output-data="output"
                  :show-remove-button="outputs.length > 1"
                  :effort-suffix="effortSuffix"
                  :allow-changes="allowChanges"
                  @remove-row="removeOutputRow(index)"
                  @request-output="requestOutput()"
                  @update="updateOutput(outputs[index], $event)"
                />
               
                <div v-if="!allowChanges" class="text-negative">
                  Please note, changes are not possible while this engagement is paused.
                </div>
              </div>
            </div>
          </div>
          <div v-if="availableUnitsExceeded" class="text-right text-negative">
            You cannot submit this record as it would exceed the total units assigned to you for this engagement. The
            maximum you can submit is {{ remainingUnits }}
          </div>
          <div class="gt-xs row q-mt-md q-mb-xl" :class="action === 'new' ? 'justify-between' : 'justify-between'">
            <q-btn
              :label="quasar.screen.gt.xs ? 'Back to list' : 'Back'"
              color="white"
              outline
              icon="reply"
              class="q-mr-md"
              @click="goBackToList"
            />
            <q-btn-dropdown
              v-if="action === 'new' || action === 'edit'"
              :label="quasar.screen.gt.xs ? 'Copy week' : 'Copy week'"
              color="primary"
              outline
              icon="content_copy"
              class="q-mr-md"
            >
              <q-list>
                <q-item
                  v-for="week in copyWeekOptions"
                  :key="week.value"
                  v-close-popup
                  clickable
                  @click="copyWeek(week.value)"
                >
                  <q-item-section>
                    <q-item-label>{{ week.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-btn-dropdown
              v-if="!fallowWeek"
              class="q-ml-sm q-mr-sm"
              :label="quasar.screen.gt.xs ? 'Fallow week' : 'Fallow week'"
              color="accent"
              icon="flaky"
            >
              <q-list>
                <q-item
                  v-for="item in fallowReasons"
                  :key="item.value"
                  v-close-popup
                  clickable
                  @click="setFallowWeek(item.id)"
                >
                  <q-item-section>
                    <q-item-label>{{ item.reason }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <div class="col text-center text-caption">
              Total Outputs: {{ outputs.length }}
              <br />
              <span :class="availableUnitsExceeded ? 'text-negative text-weight-bold' : ''">
                Total Effort: {{ totalEffort }}
              </span>
            </div>
            <div class="row">
              <q-btn
                v-if="action === 'edit'"
                class="q-mr-md"
                :label="quasar.screen.gt.xs ? 'REVERT CHANGES' : 'CANCEL'"
                icon="close"
                color="white"
                outline
                :disable="!allowRevert"
                @click="revert"
              />
              <q-btn
                :label="quasar.screen.gt.xs ? 'SAVE RECORD' : 'SAVE'"
                icon="save"
                color="primary"
                text-color="dark"
                :disable="!allowSave"
                @click="save"
              />
            </div>
          </div>
          <q-dialog v-model="newOutputPrompt">
            <output-request-form :vendor_poc="vendor_poc" @close="newOutputPrompt = !newOutputPrompt" />
          </q-dialog>
        </div>
        <div v-else class="w-standard q-pa-xs-xs q-pa-lg-lg q-mt-xs-md q-mt-lg-xl swlvd-container-bg">
          <div>
            <div class="text-h6 text-weight-bold text-white q-mb-md">
              {{ page_title }}
            </div>
          </div>
          <div v-if="engagement" class="column">
            <div class="column q-pa-xs-sm q-pa-md-md q-pa-lg-lg no-wrap">
              You can't added a new delivery record at this point, as you have already completed all records to date. Please
              come back next week.<br />
              <router-link :to="viewRecordsLink" class="q-mt-sm"> View Existing Records</router-link>
            </div>
          </div>
        </div>
        <q-dialog v-model="comingSoonAlert">
          <q-card>
            <q-card-section>
              <div class="text-h6">Coming soon!</div>
            </q-card-section>
    
            <q-card-section class="q-pt-none">
              This feature is not quite ready yet, but will be released soon.
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
        <q-dialog v-model="saveDataResponse">
          <q-card>
            <q-card-section>
              <div class="text-h6">Save Record Message</div>
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
        <q-page-sticky expand position="bottom" class="lt-sm bg-primary text-white">
          <div class="col q-pa-xs">
            <div class="row justify-between q-pa-xs">
              <div class="col">Total Outputs: {{ outputs.length }}</div>
              <div class="col text-right">Total Effort: {{ totalEffort }}</div>
            </div>
            <div class="row justify-between col">
              <q-btn-dropdown
                v-if="action === 'new'"
                label=""
                dense
                color="primary"
                text-color="dark"
                icon="content_copy"
              >
                <q-list style="min-width: 240px">
                  <q-item v-for="week in copyWeekOptions" :key="week" v-close-popup clickable @click="copyWeek(week.value)">
                    <q-item-section>
                      <q-item-label>{{ week.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-btn
                :label="quasar.screen.gt.xs ? 'Back to list' : 'Back'"
                color="primary"
                text-color="dark"
                icon="reply"
                @click="goBackToList"
              />
              <div class="row">
                <q-btn
                  v-if="action === 'edit'"
                  class="q-mr-md"
                  label="CANCEL"
                  icon="close"
                  color="primary"
                  text-color="dark"
                  :disable="!allowRevert"
                  @click="revert"
                />
                <q-btn
                  label="Save"
                  icon="save"
                  color="primary"
                  text-color="dark"
                  :disable="!allowSave"
                  @click="save"
                />
              </div>
            </div>
          </div>
        </q-page-sticky>
      </q-page>
    </template>
    
    <script>
    import { defineComponent, ref } from "vue"
    import { DateTime } from "luxon"
    import { useQuasar } from "quasar"
    import { differenceBy as _differenceBy, isEqual as _isEqual } from "lodash"
    import { ClassCombinations, Config } from "src/modules/StaticData.js"
    import { DateMethods } from "src/modules/GlobalMethods.js"
    import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
    import OutputRow from "src/components/consultant/OutputRow.vue"
     import DaysRow from "src/components/consultant/DaysRow.vue"
    import OutputRequestForm from "src/components/consultant/OutputRequestForm.vue"
    import NewSelectorForm from "components/NewSelectorForm.vue"
    
    export default defineComponent({
      name: "SelectedInvoice",
      components: { DaysRow, OutputRequestForm, NewSelectorForm },
      props: ["engagement_id", "action", "delivery_record_id"],
      setup() {
        const quasar = useQuasar()
        const outputs = ref([])
        const savedOutputs = ref([])
        const savedFallowWeek = ref(null)
        const comingSoonAlert = ref()
        const saveDataResponse = ref()
        const saveDataMessage = ref("")
        const saveError = ref(false)
    
        return {
          quasar,
          outputs,
          savedOutputs,
          savedFallowWeek,
          comingSoonAlert,
          saveDataResponse,
          saveDataMessage,
          saveError,
          OrganisationTypeMethods
        }
      },
      data() {
        return {
          newOutputPrompt: false,
          selectedWeek: DateTime.now().weekYear + "-" + DateTime.now().weekNumber,
          fallowWeek: null
        }
      },
      computed: {
        cc() {
          return ClassCombinations
        },
        isBuiltEnvironment() {
          // return this.$store.getters["admin/getIsBuiltEnvironment"]
          return false
        },
        user: function() {
          return this.$store.getters["auth/getUser"]
        },
        engagements() {
          return this.$store.getters["consultant/getEngagements"]
        },
        engagement() {
          const id = parseInt(this.engagement_id)
          return this.engagements.find(function(engagement) {
            if (engagement.id === id) {
              return engagement
            }
            return false
          })
        },
        totalEngagementEffort() {
          let units = 0
          for (let record of this.engagement_records) {
            const effort = this.combinedUnits(record.outputs)
            units += effort
          }
          return units
        },
        remainingUnits() {
          if (this.engagement) {
            if (this.action === "edit" && this.engagement_records && this.engagement_records.length) {
              const existingRecord = this.engagement_records.find((record) => {
                return parseInt(record.id) === parseInt(this.delivery_record_id)
              })
              return this.engagement.units - this.totalEngagementEffort + this.combinedUnits(existingRecord.outputs)
            } else {
              return this.engagement.units - this.totalEngagementEffort
            }
          }
          return 0
        },
        availableUnitsExceeded() {
          return this.totalEffort > this.remainingUnits
        },
        vendor_poc() {
          return this.engagement.vendor_poc ? this.engagement.vendor_poc : false
        },
        page_title: function() {
          if (!this.engagement) {
            return ""
          }
          if (this.action === "edit") {
            return "Editing delivery record for " + this.engagement.vendor
          } else if (this.action === "new") {
            return "New delivery record for " + this.engagement.vendor
          } else {
            return "Page error "
          }
        },
        viewRecordsLink: function() {
          return "/delivery-records/" + this.engagement_id
        },
        availableOutputs: function() {
          return this.engagement !== undefined && this.engagement.outputs ? this.engagement.outputs : []
        },
        effortSuffix: function() {
          return this.engagement.delivery_model === "Contingent Labour" ? "days" : "units"
        },
        recordsComplete: function() {
          let complete = true
          for (let index = 0; index < this.outputs.length; index++) {
            const output = this.outputs[index]
            const ignore = ["sub_output_id", "notes", "created_at", "updated_at", "deleted_at"]
            for (const key in output) {
              if (Object.hasOwnProperty.call(output, key)) {
                if (ignore.indexOf(key) === -1 && output[key] === null) {
                  complete = false
                }
              }
            }
          }
          return complete
        },
        allowChanges: function() {
          return !(this.engagement && this.engagement.status === "paused")
        },
        allowSave: function() {
          if (this.action === "new" && this.fallowWeek) {
            return true
          }
          if (this.availableUnitsExceeded) {
            return false
          }
          return !!((this.action === "new" && this.outputs.length && this.recordsComplete && this.allowChanges) ||
            (this.action === "edit" && this.changedFallowWeek && (this.fallowWeek || (this.outputs.length && this.recordsComplete))) ||
            (this.action === "edit" && this.changes && this.outputs.length && this.recordsComplete && this.allowChanges))
        },
        allowRevert: function() {
          return !!(this.action === "edit" && this.changes && this.allowChanges)
        },
        completedWeeks: function() {
          const weeks = []
          for (let j = 0; j < this.engagement_records.length; j++) {
            const record = this.engagement_records[j]
            const year = DateTime.fromISO(DateMethods.convertDateFormat(record.start_date, "/", "-")).weekYear
            weeks.push(year + "-" + record.week)
          }
          return weeks
        },
        weekOptions: function() {
          const a = []
          if (this.engagement) {
            const startWeek = DateTime.fromISO(DateMethods.convertDateFormat(this.engagement.start_date, "/", "-")).weekNumber
            const startYear = DateTime.fromISO(DateMethods.convertDateFormat(this.engagement.start_date, "/", "-")).weekYear
            const finalWeek = DateTime.fromISO(DateMethods.convertDateFormat(this.engagement.end_date, "/", "-")).weekNumber
            const finalYear = DateTime.fromISO(DateMethods.convertDateFormat(this.engagement.end_date, "/", "-")).weekYear
    
            let endWeek = this.currentWeek
    
            if (this.currentYear === finalYear && endWeek > finalWeek) {
              endWeek = finalWeek
            }
    
            for (let index = startYear; index <= finalYear; index++) {
              // process all the years
              if (index === startYear) {
                if (startYear === finalYear) {
                  // loop through until the end week
                  for (let w = startWeek; w <= endWeek; w++) {
                    // disable weeks with existing records
                    if (this.completedWeeks.indexOf(index + "-" + w) > -1) {
                      a.push({ label: w, value: index + "-" + w, disable: true })
                    } else {
                      a.push({ label: w, value: index + "-" + w })
                    }
                  }
                } else {
                  // loop through from start to last week in year
                  const lastWeek = DateTime.local(index, 2).weeksInWeekYear
                  for (let w = startWeek; w <= lastWeek; w++) {
                    // disable weeks with existing records
                    if (this.completedWeeks.indexOf(index + "-" + w) > -1) {
                      a.push({ label: index + " - Week " + w, value: index + "-" + w, disable: true })
                    } else {
                      a.push({ label: index + " - Week " + w, value: index + "-" + w })
                    }
                  }
                }
              } else if (index > startYear && index < finalYear) {
                // just create all the weeks in this year
                const lastWeek = DateTime.local(index, 2).weeksInWeekYear
                for (let w = 1; w <= lastWeek; w++) {
                  // disable weeks with existing records
                  if (this.completedWeeks.indexOf(index + "-" + w) > -1) {
                    a.push({ label: index + " - Week " + w, value: index + "-" + w, disable: true })
                  } else {
                    a.push({ label: index + " - Week " + w, value: index + "-" + w })
                  }
                }
              } else if (index === finalYear) {
                // only get here if multiple years
                // loop from 1 up to the last week
                for (let w = 1; w <= finalWeek; w++) {
                  // disable weeks with existing records
                  if (this.completedWeeks.indexOf(index + "-" + w) > -1) {
                    a.push({ label: index + " - Week " + w, value: index + "-" + w, disable: true })
                  } else {
                    a.push({ label: index + " - Week " + w, value: index + "-" + w })
                  }
                }
              }
            }
          }
          // a.reverse()
          return a
        },
        allowNewRecord: function() {
          return this.completedWeeks.length < this.weekOptions.length
        },
        mostRecentIncompleteWeek: function() {
          let w = this.currentYear + "-" + this.currentWeek
          for (let index = 0; index < this.weekOptions.length; index++) {
            let element = this.weekOptions[index]
            if (Object.prototype.hasOwnProperty.call(element, "value")) {
              element = element.value
            }
            if (this.completedWeeks.indexOf(element) === -1) {
              w = element
              break
            }
          }
          return w
        },
        currentWeek: function() {
          return DateTime.now().weekNumber
        },
        currentYear: function() {
          return DateTime.now().weekYear
        },
        selectedWeekNumber() {
          if (typeof this.selectedWeek === "object" && this.selectedWeek !== null) {
            return String(this.selectedWeek.value)
          }
          return String(this.selectedWeek)
        },
        selectedWeekLabel() {
          return this.selectedWeekNumber.split("-")[0] + " - Week " + this.selectedWeekNumber.split("-")[1]
        },
        weekStartDate: function() {
          const dt = DateTime.fromObject({
            weekYear: this.selectedWeekNumber.split("-")[0],
            weekNumber: this.selectedWeekNumber.split("-")[1]
          })
          return dt.startOf("week").toFormat(Config.DATE_FORMAT_DLY)
        },
        weekEndDate: function() {
          const dt = DateTime.fromObject({
            weekYear: this.selectedWeekNumber.split("-")[0],
            weekNumber: this.selectedWeekNumber.split("-")[1]
          })
          return dt.endOf("week").toFormat(Config.DATE_FORMAT_DLY)
        },
        weekStartDB: function() {
          const dt = DateTime.fromObject({
            weekYear: this.selectedWeekNumber.split("-")[0],
            weekNumber: this.selectedWeekNumber.split("-")[1]
          })
          return dt.startOf("week").toISODate()
        },
        weekEndDB: function() {
          const dt = DateTime.fromObject({
            weekYear: this.selectedWeekNumber.split("-")[0],
            weekNumber: this.selectedWeekNumber.split("-")[1]
          })
          return dt.endOf("week").toISODate()
        },
        combinedRecord: function() {
          let record = false
          if (this.engagement) {
            record = {
              consultant_engagement_id: this.engagement.id,
              week: null,
              start_date: this.weekStartDB,
              end_date: this.weekEndDB,
              outputs: this.outputs,
              fallow_week_id: this.fallowWeek?.id
            }
            if (this.selectedWeekNumber) {
              record.week = parseInt(this.selectedWeekNumber.split("-")[1])
            }
          }
          return record
        },
        combinedUpdates: function() {
          let _updates = false
          let _deliveryRecordId = false
          if (this.current_record) {
            _updates = {
              deleted: this.deletedOutputs,
              updated: this.changedOutputs,
              new: this.newOutputs
            }
            if (this.changedFallowWeek) {
              if (this.fallowWeek) {
                _updates.fallowWeekId = this.fallowWeek.id
              } else {
                _updates.fallowWeekId = null
              }
            }
            _deliveryRecordId = this.current_record.id
          }
          return { updates: _updates, delivery_record_id: _deliveryRecordId }
        },
        all_records() {
          return this.$store.getters["consultant/getDeliveryRecords"]
        },
        engagement_records() {
          let r = []
          if (this.all_records !== false && this.all_records[this.engagement_id]) {
            r = this.all_records[this.engagement_id]
          }
          return r
        },
        current_record() {
          let record = false
          if (this.action === "edit" && this.delivery_record_id) {
            if (this.engagement_records.length) {
              record = this.engagement_records.filter((obj) => {
                return parseInt(obj.id) === parseInt(this.delivery_record_id)
              })
              if (record.length) {
                record = record[0]
              }
            }
          }
          return record
        },
        copyWeekOptions() {
          const a = []
          if (this.engagement_records.length) {
            for (let index = 0; index < this.engagement_records.length; index++) {
              const record = this.engagement_records[index]
              const year = DateTime.fromISO(DateMethods.convertDateFormat(record.start_date, "/", "-")).weekYear
              // ignore the current week if in edit mode
              if (this.action === "edit" && parseInt(this.current_record.week) === parseInt(record.week)) {
                continue
              }
              a.push({ label: year + " - Week " + record.week, value: year + "-" + record.week })
            }
            a.sort()
          }
          return a
        },
        fallowReasons() {
          return this.$store.getters["consultant/getFallowWeek"]
        },
        changedOutputs() {
          const outputs = []
          for (let index = 0; index < this.outputs.length; index++) {
            const output = this.outputs[index]
            if (Object.prototype.hasOwnProperty.call(output, "id")) {
              let savedOutput = this.savedOutputs.filter((obj) => {
                return parseInt(obj.id) === parseInt(output.id)
              })
              if (savedOutput && savedOutput.length) {
                savedOutput = savedOutput[0]
              }
              const changed = !_isEqual(output, savedOutput)
              if (changed) {
                outputs.push(output)
              }
            }
          }
          return outputs
        },
        deletedOutputs() {
          return _differenceBy(this.savedOutputs, this.outputs, "id")
        },
        newOutputs() {
          const outputs = []
          for (let index = 0; index < this.outputs.length; index++) {
            const output = this.outputs[index]
            if (!Object.prototype.hasOwnProperty.call(output, "id")) {
              outputs.push(output)
            }
          }
          return outputs
        },
        changedFallowWeek() {
          return this.savedFallowWeek !== this.fallowWeek
        },
        changes() {
          return !!(this.changedOutputs.length || this.deletedOutputs.length || this.newOutputs.length)
        },
        totalEffort() {
          let effort = 0
          for (let index = 0; index < this.outputs.length; index++) {
            const e = parseFloat(this.outputs[index].effort)
            if (!isNaN(e)) {
              effort += e
            }
          }
          return effort
        }
      },
      watch: {
        all_records: function() {
          this.selectedWeek = this.mostRecentIncompleteWeek
          if (this.current_record) {
            this.outputs = JSON.parse(JSON.stringify(this.current_record.outputs))
            this.savedOutputs = JSON.parse(JSON.stringify(this.outputs))
          }
        },
        current_record: function(newVal) {
          if (newVal.week) {
            const year = DateTime.fromISO(DateMethods.convertDateFormat(newVal.start_date, "/", "-")).weekYear
            this.selectedWeek = year + "-" + newVal.week
          }
        },
        mostRecentIncompleteWeek: function() {
          if (this.action === "new") {
            this.selectedWeek = this.mostRecentIncompleteWeek
          }
        },
        outputs: function(val) {
          if (val && val.length) {
            this.fallowWeek = null
          }
        },
        fallowReasons: function(val) {
          if (val && val.length) {
            if (this.current_record && this.current_record.fallow_week_id) {
              this.setFallowWeek(this.current_record.fallow_week_id, true)
            }
          }
        }
      },
      created: async function() {
        if (!this.engagement) {
          this.$store.dispatch("consultant/engagements")
        }
        if (!this.engagement_records.length) {
          await this.$store.dispatch("consultant/getDeliveryRecords", {
            consultant_engagement_id: parseInt(this.engagement_id)
          })
        } else if (this.current_record) {
          this.outputs = JSON.parse(JSON.stringify(this.current_record.outputs))
          this.savedOutputs = JSON.parse(JSON.stringify(this.outputs))
          if (this.fallowReasons.length) {
            this.setFallowWeek(this.current_record.fallow_week_id, true)
          }
        }
        if (!this.fallowReasons.length) {
          this.$store.dispatch("consultant/fallowWeek").then(() => {
            if (this.current_record && this.current_record.fallow_week_id) {
              this.setFallowWeek(this.current_record.fallow_week_id, true)
            }
          })
        }
      },
      mounted() {
        if (this.action === "new") {
          this.addOutputRow()
          this.selectedWeek = this.mostRecentIncompleteWeek
        } else if (this.current_record) {
          const year = DateTime.fromISO(DateMethods.convertDateFormat(this.current_record.start_date, "/", "-")).weekYear
          this.selectedWeek = year + "-" + this.current_record.week
        }
      },
      methods: {
        combinedUnits: function(outputs) {
          let units = 0
          for (let index = 0; index < outputs.length; index++) {
            const effort = outputs[index].effort
            units += effort * 1
          }
          return units
        },
        addOutputRow: function() {
          const output = {
            output_id: null,
            sub_output_id: null,
            project_id: null,
            output_status: null,
            output_rag: null,
            output_type: null,
            completion: 0,
            effort: 0,
            notes: ""
          }
          if (this.action === "edit" && this.current_record) {
            output.delivery_record_id = this.current_record.id
          }
          this.outputs.push(output)
        },
        removeOutputRow: function(index) {
          this.outputs.splice(index, 1)
        },
        save: function() {
          if (this.action === "new") {
            this.saveNewRecord()
          } else if (this.action === "edit") {
            this.saveRecordOutputs()
          }
        },
        saveNewRecord: async function() {
          this.$store.dispatch("consultant/saveDeliveryRecord", this.combinedRecord).then(() => {
            this.saveError = false
            this.saveDataResponse = true
            this.saveDataMessage = "Record saved successfully"
            this.$store.dispatch("consultant/getDeliveryRecords", {
              consultant_engagement_id: parseInt(this.engagement_id)
            })
            this.$router.push({ path: "/delivery-records/" + this.engagement_id })
          }).catch((e) => {
            this.saveError = true
            this.saveDataMessage = e
            this.saveDataResponse = true
          })
        },
        saveRecordOutputs: function() {
          // send one update call with 3 properties, new, updated, deleted
          this.$store.dispatch("consultant/updateDeliveryRecord", this.combinedUpdates).then(() => {
            this.saveError = false
            this.saveDataResponse = true
            this.saveDataMessage = "Record outputs updated successfully"
            this.loadFreshData()
          }).catch((e) => {
            this.saveError = true
            this.saveDataMessage = e
            this.saveDataResponse = true
          })
        },
        loadFreshData: function() {
          this.$store.dispatch("consultant/getDeliveryRecords", {
            consultant_engagement_id: parseInt(this.engagement_id)
          }).then(() => {
            this.outputs = JSON.parse(JSON.stringify(this.current_record.outputs))
            this.savedOutputs = JSON.parse(JSON.stringify(this.outputs))
            this.setFallowWeek(this.current_record.fallow_week_id)
          }).catch((e) => {
            this.saveError = true
            this.saveDataMessage = e
            this.saveDataResponse = true
          })
        },
        revert: function() {
          if (this.current_record) {
            // make new local independent copies of the vuex data
            this.outputs = JSON.parse(JSON.stringify(this.current_record.outputs))
            this.savedOutputs = JSON.parse(JSON.stringify(this.outputs))
            if (this.savedFallowWeek) {
              this.fallowWeek = JSON.parse(JSON.stringify(this.savedFallowWeek))
            }
          }
        },
        updateOutput: function(output, object) {
          for (const key in object) {
            if (Object.hasOwnProperty.call(object, key)) {
              output[key] = object[key]
            }
          }
        },
        requestOutput: function() {
          this.newOutputPrompt = true
        },
        goBackToList: function() {
            window.history.back();
         // this.$router.push({ path: "/delivery-records/" + this.engagement_id })
        },
        copyWeek: function(weekNumber) {
          let record
          if (this.engagement_records.length) {
            for (let index = 0; index < this.engagement_records.length; index++) {
              const r = this.engagement_records[index]
              if (
                parseInt(r.week) === parseInt(weekNumber.split("-")[1]) &&
                parseInt(DateTime.fromISO(DateMethods.convertDateFormat(r.start_date, "/", "-")).weekYear) === parseInt(weekNumber.split("-")[0])
              ) {
                record = r
                break
              }
            }
            if (record) {
              // copy the outputs
              const outputs = JSON.parse(JSON.stringify(record.outputs))
              for (let index = 0; index < outputs.length; index++) {
                const output = outputs[index]
                delete output.id //need to delete the id, so that a new delivery record output is created
                delete output.created_at
                delete output.updated_at
                //set the correct delivery record id, if editing
                if (this.action === "edit" && this.delivery_record_id) {
                  output.delivery_record_id = this.delivery_record_id
                }
              }
    
              this.outputs = outputs
            }
          }
        },
        setFallowWeek: function(id, save) {
          if (id && this.fallowReasons && this.fallowReasons.length) {
            this.fallowWeek = this.fallowReasons.find((item) => item.id === id)
            this.outputs = []
            if (save) {
              this.savedFallowWeek = JSON.parse(JSON.stringify(this.fallowWeek))
            }
          }
        },
        removeFallowWeek() {
          this.fallowWeek = null
          this.addOutputRow()
        }
      }
    })
    </script>
    
    <style scoped>
    .add-row {
      align-self: flex-end;
      justify-self: center;
    }
    
    .q-field {
      font-size: 12px;
    }
    
    .effortLess {
      font-size: 20px;
      text-align: center;
      color: white;
    }
    </style>
    