<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { DateTime } from "luxon"
import { DateMethods, CurrencyMethods } from "src/modules/GlobalMethods.js"

const store = useStore()

const props = defineProps({
  dates: Object,
  reportsData: Array
})

const startedServices = ref([])
const stoppedServices = ref([])

const organisation = computed(() => store.getters["admin/getOrganisation"])

watch(props.dates, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    buildData()
  }
})

function buildData() {
  startedServices.value = []
  stoppedServices.value = []
  const servicesObj = {}
  (props.reportsData ?? []).forEach(report => {
    const service = report.service
    if (servicesObj[service.id] === undefined) {
      servicesObj[service.id] = service
      if (DateMethods.dateWithinRange(service.start_date, props.dates.startDate, props.dates.endDate)) {
        startedServices.value.push(service)
      }
      if (DateMethods.dateWithinRange(service.end_date, props.dates.startDate, props.dates.endDate)) {
        stoppedServices.value.push(service)
      }
    }
  })
}

onMounted(() => {
  buildData()
})
</script>

<template>
  <div class="q-mb-lg">
    <div>Services Started</div>
    <q-list bordered separator>
      <q-item v-for="service in startedServices" :key="service.id">
        <q-item-section>
          <q-item-label>{{ service.name }}</q-item-label>
          <q-item-label caption>
            Started: {{ DateTime.fromISO(service.start_date).setLocale("en-gb").toLocaleString(DateTime.DATE_FULL) }}
            <br />
            Value: {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, service.value) }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
  <div>
    <div>Services Stopped</div>
    <q-list bordered separator>
      <q-item v-for="service in stoppedServices" :key="service.id">
        <q-item-section>
          <q-item-label>{{ service.name }}</q-item-label>
          <q-item-label caption>
            Stopped: {{ DateTime.fromISO(service.end_date).setLocale("en-gb").toLocaleString(DateTime.DATE_FULL) }}
            <br />
            Value: {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, service.value) }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
