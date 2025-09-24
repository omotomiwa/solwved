<template>
  <q-page >
    <div class="row justify-center q-pa-md swlvd-container-bg q-mt-xl">
      <div class="col-12 col-md-10 col-lg-8">
        <div class="text-h2 q-pt-lg text-weight-bold text-center text-white">Add New Record</div>
        <div class="details2 text-weight-bold row q-mb-xl">

        
      </div>
      <div v-if="engagement" class="column q-mb-xs-xl">
        
        <div class="column q-pa-xs-sm q-pa-md-md q-pa-lg-lg no-wrap">
          <div class="q-mb-sm q-pa-md-sm">New Timesheet</div>
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
              :options="weekOption"
              label="Week"
              default-class="full-width"
              :is-selected-option-customisable="true"
              @update:option_id="onWeekChange"
            >
              <template #selected-item="{ option }">
                <span v-if="hasUserSelectedWeek">{{ option.label }}</span>
              </template>
            </new-selector-form>

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
                <div class="self-center full-width no-outline" tabindex="1" v-if="hasUserSelectedWeek">
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
            </div >
            <div v-if="!fallowWeek">
              <div class="row items-center no-wrap q-mt-lg q-mb-sm">
              <div class="col">
                <div class="text-h6">Days Worked</div>
              </div>
            </div>

            <div class="row output-row q-mb-sm q-col-gutter-md" >
  <q-input
    v-model.number="localData.days.monday"
    class="col-12 col-sm-6 col-md-3"
    color="primary"
    outlined
    label="Monday"
    stack-label
    label-color="white"
    type="text"

  />
  <q-input
    v-model.number="localData.days.tuesday"
    class="col-12 col-sm-6 col-md-3"
    color="primary"
    outlined
    label="Tuesday"
    stack-label
    label-color="white"
    type="text"

  />
  <q-input
    v-model.number="localData.days.wednesday"
    class="col-12 col-sm-6 col-md-3"
    color="primary"
    outlined
    label="Wednesday"
    stack-label
    label-color="white"
    type="text"

  />
  <q-input
    v-model.number="localData.days.thursday"
    class="col-12 col-sm-6 col-md-3"
    color="primary"
    outlined
    label="Thursday"
    stack-label
    label-color="white"
    type="text"

  />
  <q-input
    v-model.number="localData.days.friday"
    class="col-12 col-sm-6 col-md-3"
    color="primary"
    outlined
    label="Friday"
    stack-label
    label-color="white"
    type="text"

  />
  <q-input
    v-model.number="localData.days.saturday"
    class="col-12 col-sm-6 col-md-3"
    color="primary"
    outlined
    label="Saturday"
    stack-label
    label-color="white"
    type="text"

  />
  <q-input
    v-model.number="localData.days.sunday"
    class="col-12 col-sm-6 col-md-3"
    color="primary"
    outlined
    label="Sunday"
    stack-label
    label-color="white"
    type="text"

  />
  <q-input
    v-model.number="localData.effort"
    class="col-12 col-sm-6 col-md-3"
    color="primary"
    outlined
    label="Total Units"
    stack-label
    label-color="white"
    type="text"
    readonly
    @focus="localData.manuallyEditedTotal = true"

  />


</div>

            </div>
            <q-input
    v-model="localData.notes"
    class="col-12 q-mt-sm"
    color="primary"
    outlined
    label="Notes"
    stack-label
    label-color="white"
    type="textarea"
    maxlength="255"
    autogrow
  />


          </div>
        </div>
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
            <q-item v-for="week in validWeeks" :key="week.label" v-close-popup clickable @click="selectWeek(week)">
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
            @click="save"
          />
        </div>
      </div>


      </div></div>



  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue"
import { DateTime } from "luxon"
import { useQuasar } from "quasar"
import { differenceBy as _differenceBy, isEqual as _isEqual } from "lodash"
import { Config } from "src/modules/StaticData.js"
import { DateMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import NewSelectorForm from "components/NewSelectorForm.vue"



export default defineComponent({
  name: "AddRecord",
  components: {   NewSelectorForm },
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
    const isBuiltEnvironment = ref("")

    return {
      isBuiltEnvironment,
      quasar,
      outputs,
      savedOutputs,
      savedFallowWeek,
      comingSoonAlert,
      saveDataResponse,
      saveDataMessage,
      saveError,
      OrganisationTypeMethods,
    }
  },
  data() {
    return {
      selectedWeek: null,
      fallowWeek: null,
      vendorId: 0,
      weeks: {},
      localData: {
        days: {
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
          sunday: 0,
        },
        effort: 0,
        notes: "",
        manuallyEditedTotal: false,

      },
    }
  },

  computed: {
    hasUserSelectedWeek() {
      return !!this.selectedWeek // or refine based on how your data looks
    },
    weekOption() {
  const filtered = Object.entries(this.weeks).filter(([key, value]) => value === null);
  return filtered.map(([key]) => ({
    label: key,
    value: key,
  }));
}
,
    validWeeks() {
      return Object.entries(this.weeks)
        .filter(([key, value]) => value !== null)
        .map(([key, value]) => ({
          label: key,
          value: value,
        }))
    },

    user: function () {
      return this.$store.getters["auth/getUser"]
    },
    engagements() {
      return this.$store.getters["consultant/getEngagements"]
    },
    engagement() {
      const id = parseInt(this.engagement_id)
      return this.engagements.find(function (engagement) {
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

    completedWeeks: function () {
      const weeks = []
      for (let j = 0; j < this.engagement_records.length; j++) {
        const record = this.engagement_records[j]
        const year = DateTime.fromISO(DateMethods.convertDateFormat(record.start_date, "/", "-")).weekYear
        weeks.push(year + "-" + record.week)
      }
      return weeks
    },
    weekOptions: function () {
      const a = []
      if (this.engagement) {
        const startWeek = DateTime.fromISO(
          DateMethods.convertDateFormat(this.engagement.start_date, "/", "-")
        ).weekNumber
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
    allowNewRecord: function () {
      return this.completedWeeks.length < this.weekOptions.length
    },
    mostRecentIncompleteWeek: function () {
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
    currentWeek: function () {
      return DateTime.now().weekNumber
    },
    currentYear: function () {
      return DateTime.now().weekYear
    },
    selectedWeekNumber() {
      if (typeof this.selectedWeek === "object" && this.selectedWeek !== null) {
        return String(this.selectedWeek.value)
      }

      return String(this.selectedWeek)
    },
    selectedWeekLabel() {
      return this.selectedWeekNumber?.split("-")[0] + " - Week " + this.selectedWeekNumber?.split("-")[1]
    },
    weekStartDate: function () {
      const dt = DateTime.fromObject({
        weekYear: this.selectedWeekNumber?.split("-")[0],
        weekNumber: this.selectedWeekNumber?.split("-")[1],
      })
      return dt.startOf("week").toFormat(Config.DATE_FORMAT_DLY)
    },
    weekEndDate: function () {
      const dt = DateTime.fromObject({
        weekYear: this.selectedWeekNumber?.split("-")[0],
        weekNumber: this.selectedWeekNumber?.split("-")[1],
      })
      return dt.endOf("week").toFormat(Config.DATE_FORMAT_DLY)
    },
    weekStartDB: function () {
      const dt = DateTime.fromObject({
        weekYear: this.selectedWeekNumber?.split("-")[0],
        weekNumber: this.selectedWeekNumber?.split("-")[1],
      })
      return dt.startOf("week").toISODate()
    },
    weekEndDB: function () {
      const dt = DateTime.fromObject({
        weekYear: this.selectedWeekNumber?.split("-")[0],
        weekNumber: this.selectedWeekNumber?.split("-")[1],
      })
      return dt.endOf("week").toISODate()
    },
    combinedRecord: function () {
      let record = false
      if (this.engagement) {
        record = {
          consultant_engagement_id: this.engagement.id,
          vendor_id: this.vendorId,
          start_date: this.weekStartDB,
          end_date: this.weekEndDB,
          week: this.selectedWeek,
          days: this.localData.days,
          effort: this.localData.effort,
          notes: this.localData.notes,
          fallow_week_id: this.fallowWeek?.id,
        }
      }
      return record
    },
    combinedUpdates: function () {
      let _updates = false
      let _deliveryRecordId = false
      if (this.current_record) {
        _updates = {
          deleted: this.deletedOutputs,
          updated: this.changedOutputs,
          new: this.newOutputs,
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
    },
  },
  watch: {
    weeks: {
    immediate: true,
    handler(newVal) {
      const firstWeek = this.weekOption[0]?.value;

      if (firstWeek && !this.selectedWeek) {
        this.selectedWeek = firstWeek;
      }
    }
  },
    "localData.days": {
      handler(newVal) {
        if (!this.localData.manuallyEditedTotal) {
          const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = newVal
          const sum =
            (parseFloat(monday) || 0) +
            (parseFloat(tuesday) || 0) +
            (parseFloat(wednesday) || 0) +
            (parseFloat(thursday) || 0) +
            (parseFloat(friday) || 0) +
            (parseFloat(saturday) || 0) +
            (parseFloat(sunday) || 0)

          this.localData.effort = sum
        }
      },
      deep: true,
    },

    outputs: function (val) {
      if (val && val.length) {
        this.fallowWeek = null
      }
    },
    fallowReasons: function (val) {
      if (val && val.length) {
        if (this.current_record && this.current_record.fallow_week_id) {
          this.setFallowWeek(this.current_record.fallow_week_id, true)
        }
      }
    },
  },
  created: async function () {
    await this.$store.dispatch("consultant/engagements")

    if(this.engagements.length > 0) {
      this.vendorId = this.engagements[0].vendor_id

      this.$store.dispatch("consultant/copyWeek", { vendor_id: this.vendorId }).then((weeks) => {
        this.weeks = weeks
      })
    }

    if (this.engagement_records.length === 0) {
      await this.$store.dispatch("consultant/getDeliveryRecords", {
        consultant_engagement_id: parseInt(this.engagement_id),
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



  },
  methods: {
    onWeekChange(value) {
      this.selectedWeek = value
    },
    selectWeek(week) {
      this.localData.days = week.value
      // do something with it
    },


    combinedUnits: function (outputs) {
      let units = 0
      for (let index = 0; index < outputs.length; index++) {
        const effort = outputs[index].effort
        units += effort * 1
      }
      return units
    },
    addOutputRow: function () {
      const output = {
        effort: 0,
        notes: "",
      }
      if (this.action === "edit" && this.current_record) {
        output.delivery_record_id = this.current_record.id
      }
      this.outputs.push(output)
    },
    removeOutputRow: function (index) {
      this.outputs.splice(index, 1)
    },
    save: function () {
      this.saveNewRecord()
    },
    saveNewRecord: async function () {
      this.$store
        .dispatch("consultant/createTimesheet", this.combinedRecord)
        .then(() => {
          this.saveError = false
          this.saveDataResponse = true

          this.$store.dispatch("consultant/getDeliveryRecords", {
            consultant_engagement_id: parseInt(this.engagement_id),
          })

          this.$q.notify({
            type: "positive",
            message: "Record saved successfully!",
          })
          window.history.back()
        })
        .catch((e) => {
          this.saveError = true
          this.$q.notify({
            type: "negative",
            message: "Record saving unsuccessful!",
          })
          this.saveDataResponse = true
        })
    },
    saveRecordOutputs: function () {
      // send one update call with 3 properties, new, updated, deleted
      this.$store
        .dispatch("consultant/updateDeliveryRecord", this.combinedUpdates)
        .then(() => {
          this.saveError = false
          this.saveDataResponse = true
          this.saveDataMessage = "Record outputs updated successfully"
          this.loadFreshData()
        })
        .catch((e) => {
          this.saveError = true
          this.saveDataMessage = e
          this.saveDataResponse = true
        })
    },
    loadFreshData: function () {
      this.$store
        .dispatch("consultant/getDeliveryRecords", {
          consultant_engagement_id: parseInt(this.engagement_id),
        })
        .then(() => {
          this.outputs = JSON.parse(JSON.stringify(this.current_record.outputs))
          this.savedOutputs = JSON.parse(JSON.stringify(this.outputs))
          this.setFallowWeek(this.current_record.fallow_week_id)
        })
        .catch((e) => {
          this.saveError = true
          this.saveDataMessage = e
          this.saveDataResponse = true
        })
    },
    revert: function () {
      if (this.current_record) {
        // make new local independent copies of the vuex data
        this.outputs = JSON.parse(JSON.stringify(this.current_record.outputs))
        this.savedOutputs = JSON.parse(JSON.stringify(this.outputs))
        if (this.savedFallowWeek) {
          this.fallowWeek = JSON.parse(JSON.stringify(this.savedFallowWeek))
        }
      }
    },
    updateOutput: function (output, object) {
      for (const key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
          output[key] = object[key]
        }
      }
    },

    goBackToList: function () {
      window.history.back()
    },
    copyWeek: function (weekNumber) {
      let record
      if (this.engagement_records.length) {
        for (let index = 0; index < this.engagement_records.length; index++) {
          const r = this.engagement_records[index]
          if (
            parseInt(r.week) === parseInt(weekNumber?.split("-")[1]) &&
            parseInt(DateTime.fromISO(DateMethods.convertDateFormat(r.start_date, "/", "-")).weekYear) ===
              parseInt(weekNumber?.split("-")[0])
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
    setFallowWeek: function (id, save) {
      this.localData.days.monday = 0;
      this.localData.days.tuesday = 0
      this.localData.days.wednesday = 0;
      this.localData.days.thursday = 0;
      this.localData.days.friday = 0;
      this.localData.days.saturday = 0;
      this.localData.days.sunday = 0;
      this.localData.effort = 0;

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
    },
  },
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
.w-standard {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}
</style>
