<script setup>
import { computed, onMounted, ref, watch, nextTick } from "vue"
import { DateTime } from "luxon"
import { DateMethods } from "src/modules/GlobalMethods.js"
import { Config } from "src/modules/StaticData.js"
import NewSelectorForm from "components/NewSelectorForm.vue"

const emit = defineEmits(["setDates"])
const selectedMonthStart = ref(DateMethods.getNextMonday(DateTime.local().minus({ months: 1 }).startOf("month")))
const selectedQuarterStart = ref(DateMethods.getNextMonday(DateTime.local().startOf("quarter").minus({ months: 3 })))
const startDate = ref(DateTime.local().minus({ years: 1 }).toISODate())
const endDate = ref(DateTime.local().toISODate())
const startWeek = ref()
const endWeek = ref()
const tab = ref("quarter")
const applied = ref(false)

const monthOptions = computed(() => {
  const months = [...Array(12).keys()]
  return months.map((_, index) => {
    const date = DateMethods.getNextMonday(DateTime.local().minus({ months: index }).startOf("month"))
    return { label: date.weekYear + " - " + date.monthLong, value: date }
  })
})
const quarterOptions = computed(() => {
  const quarters = [...Array(5).keys()]
  return quarters.map((_, index) => {
    let date = DateTime.local().endOf("quarter").minus({ quarter: index })
    const year = date.weekYear
    date = DateMethods.getNextMonday(date.startOf("quarter"))
    return { label: year + " - Q" + date.quarter, value: date }
  })
})

const startDateDisplay = computed(() => {
  if (!startDate.value) {
    return "_ _ _ _"
  }
  return DateTime.fromISO(startDate.value)
    .setLocale("en-gb")
    .toLocaleString({ ...DateTime.DATE_FULL, weekday: "short" })
})

const endDateDisplay = computed(() => {
  if (!endDate.value) {
    return "_ _ _ _"
  }
  return DateTime.fromISO(endDate.value)
    .setLocale("en-gb")
    .toLocaleString({ ...DateTime.DATE_FULL, weekday: "short" })
})

const weekOptions = computed(() => {
  const numberOfYears = 3 // Define how many years of weeks you want
  const weeks = []

  for (let yearOffset = 0; yearOffset < numberOfYears; yearOffset++) {
    const currentYear = DateTime.now().minus({ years: yearOffset }).weekYear
    const weeksInYear = DateTime.local(currentYear, 2).weeksInWeekYear

    for (let weekIndex = weeksInYear; weekIndex > 0; weekIndex--) {
      const dt = DateTime.fromObject({
        weekYear: currentYear,
        weekNumber: weekIndex
      })

      const weekObject = {
        weekRef: currentYear + "-" + weekIndex,
        weekYear: currentYear,
        weekNumber: weekIndex,
        startDate: dt.startOf("week").toFormat(Config.DATE_FORMAT_YMD),
        endDate: dt.endOf("week").toFormat(Config.DATE_FORMAT_YMD),
        label:
          currentYear +
          " - Week " +
          weekIndex +
          "  (" +
          dt.startOf("week").toFormat(Config.DATE_FORMAT_DLY) +
          " - " +
          dt.endOf("week").toFormat(Config.DATE_FORMAT_DLY) +
          ")"
      }

      weeks.push(weekObject)
    }
  }

  return weeks
})

const startWeekObject = computed(() => weekOptions.value.find(week => week.weekRef === startWeek.value))
const endWeekObject = computed(() => weekOptions.value.find(week => week.weekRef === endWeek.value))
const validDates = computed(() =>  !(!startDate.value || !endDate.value))

const endWeekOptions = computed(() => {
  if (!startWeek.value) return []
  if (!startWeekObject.value) return []
  return weekOptions.value.filter(week => week.startDate > startWeekObject.value.endDate)
})

watch(selectedMonthStart, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    startDate.value = newVal.toISODate()
    endDate.value = newVal.endOf("month").endOf("week").toISODate()
  }
})

watch(selectedQuarterStart, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    startDate.value = newVal.toISODate()
    endDate.value = newVal.endOf("quarter").endOf("week").toISODate()
  }
})

watch(startWeek, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    startDate.value = startWeekObject.value.startDate
    if (startDate.value > endDate.value) {
      endWeek.value = undefined
      endDate.value = undefined
    }
  }
})

watch(endWeek, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    endDate.value = endWeekObject.value.endDate
  }
})

watch([startDate, endDate], (newVal, oldVal) => {
    if (newVal !== oldVal) {
      applied.value = false
    }
  },
  { deep: true }
)

watch(tab, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    setDate(newVal)
  }
})

function setDate(tab) {
  nextTick(() => {
    if (tab === "month") {
      startDate.value = selectedMonthStart.value?.toISODate()
      endDate.value = selectedMonthStart.value?.endOf("month").endOf("week").toISODate()
    } else if (tab === "quarter") {
      startDate.value = selectedQuarterStart.value?.toISODate()
      endDate.value = selectedQuarterStart.value?.endOf("quarter").endOf("week").toISODate()
    } else if (tab === "year") {
      startDate.value = DateMethods.getNextMonday(DateTime.local().minus({ years: 1 }).startOf("month")).toISODate()
      endDate.value = DateTime.local().minus({ months: 1 }).endOf("month").endOf("week").toISODate()
    } else if (tab === "custom") {
      startWeek.value = undefined
      endWeek.value = undefined
      endDate.value = undefined
      startDate.value = undefined
    }
  })
}

function applyDates() {
  applied.value = true
  emit("setDates", { startDate: startDate.value, endDate: endDate.value })
}

onMounted(() => {
  setDate(tab.value)
})
</script>

<template>
  <div class="swlvd-border q-pa-md">
    <div class="row items-center">
      <div>How would you like to view your information?</div>
      <q-option-group
        class="col-12"
        v-model="tab"
        color="primary"
        inline
        :options="[
          { label: 'By Quarter', value: 'quarter' },
          { label: 'Last 12 Months', value: 'year' },
          { label: 'By Month', value: 'month' },
          { label: 'Date Range', value: 'custom' },
        ]"
      />
      <q-tab-panels v-model="tab" class="row q-mt-sm bg-transparent col-12" color="primary">
        <q-tab-panel name="month" class="col-12">
          <new-selector-form
            v-model:option_id="selectedMonthStart"
            class="row q-col-gutter-md"
            default-class="col-xs-12 col-md-6 col-lg-4"
            is-filterable
            filter-key="label"
            option-label="label"
            option-val-key="value"
            dense
            hide-bottom-space
            :options="monthOptions"
            label="Month"
          />
        </q-tab-panel>
        <q-tab-panel name="year" class="fit-content">
          <q-field dense />
        </q-tab-panel>
        <q-tab-panel name="quarter" class="col-12">
          <new-selector-form
            v-model:option_id="selectedQuarterStart"
            class="row q-col-gutter-md"
            default-class="col-xs-12 col-md-6 col-lg-4"
            hide-bottom-space
            :options="quarterOptions"
            is-filterable
            filter-key="label"
            option-label="label"
            option-val-key="value"
            label="Quarter"
            autofocus
          />
        </q-tab-panel>
        <q-tab-panel name="custom" class="col-12">
          <div class="row q-col-gutter-md">
            <new-selector-form
              v-model:option_id="startWeek"
              class="col-xs-12 col-md-6 col-lg-4"
              default-class="full-width"
              is-filterable
              :options="weekOptions"
              filter-key="label"
              option-label="label"
              option-val-key="weekRef"
              label="From Week"
            />
            <new-selector-form
              v-model:option_id="endWeek"
              class="col-xs-12 col-md-6 col-lg-4"
              default-class="full-width"
              is-filterable
              filter-key="label"
              option-label="label"
              option-val-key="weekRef"
              :options="endWeekOptions"
              label="To Week (inc)"
              :disabled="!startWeek"
            />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
    <div class="q-mt-sm text-center">
      <div>
        <span v-if="applied">Applied</span>
        <span v-else>Chosen</span>
        date range:
      </div>
      <div class="text-weight-bold q-ml-lg">
        {{ startDateDisplay }}
        <q-icon name="arrow_forward" />
        {{ endDateDisplay }}
      </div>
    </div>
    <div class="q-mt-sm text-center">
      <q-btn
        v-if="!applied && validDates"
        @click="applyDates"
        label="Apply"
        dense
        unelevated
        padding="xs md"
        class="q-ml-lg"
        color="primary"
        text-color="dark"
      />
    </div>
  </div>
</template>

<style scoped>
.remove-bottom-margin {
  margin-bottom: -20px;
}

.overflow-none,
.overflow-none * {
  overflow: hidden;
}

.q-tab-panel {
  padding-top: 0;
  padding-bottom: 0;
}

.fit-content {
  width: fit-content;
}
</style>
