<template>
  <q-table
    flat
    :grid="$q.screen.xs"
    selection="none"
    :rows="rows"
    :columns="columns"
    row-key="id"
    :pagination="{ rowsPerPage: 0 }"
    hide-pagination
    class="bordered"
    table-header-class="text-weight-bolder text-primary"
    color="primary"
  >
    <template #body-cell-start_date="props">
      <q-td :props="props">
        <div :class="dateOutsideContractDates(props.value) ? 'text-negative text-weight-bold' : ''">
          <span class="vertical-middle leading-3">{{ props.value }}</span>
          <DateWarning v-if="dateOutsideContractDates(props.value)"
                       :message="dateWarningMessage"
                       class="vertical-middle" />
        </div>
      </q-td>
    </template>
    <template #body-cell-end_date="props">
      <q-td :props="props">
        <div :class="dateOutsideContractDates(props.value) ? 'text-negative text-weight-bold' : ''">
          <DateWarning v-if="dateOutsideContractDates(props.value)"
                       :message="dateWarningMessage"
                       class="vertical-middle" />
          <span class="vertical-middle leading-3">{{ props.value }}</span>
        </div>
      </q-td>
    </template>
    <template #body-cell-action="props">
      <q-td :props="props">
        <div class="row justify-end">
          <q-btn
            color="primary"
            size="sm"
            label="VIEW / EDIT"
            @click="editService(props.value)"
            icon="edit"
            outline
          />
        </div>
      </q-td>
    </template>
    <template v-slot:bottom-row>
      <q-tr class="text-weight-bold" :class="totalsColor">
        <q-td colspan="2"> Total:</q-td>
        <q-td class="text-right">
          {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, subTotalServices) }}
        </q-td>
        <q-td :colspan="columns.length - 3">{{ warningMessage }}</q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup>
import { useQuasar } from "quasar"
import { computed, ref } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods, DateMethods } from "src/modules/GlobalMethods.js"
import DateWarning from "src/components/common/DateWarning.vue"

const store = useStore()
const $q = useQuasar()

const props = defineProps({
  services: { type: Array, default: () => [] },
  contract: { type: Object, default: () => ({}) }
})

const emit = defineEmits(["edit"])

const organisation = computed(() => store.getters["admin/getOrganisation"])

const columns = computed(() => [
  { name: "name", label: "Name", field: "name", align: "left" },
  { name: "lot", label: "Lot", field: "lot", align: "center" },
  {
    name: "value",
    label: "Value",
    field: "value",
    align: "right",
    format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
  },
  { name: "delivery_model_name", label: "Delivery Model", field: "delivery_model_name", align: "left" },
  { name: "financial_model_name", label: "Financial Model", field: "financial_model_name", align: "left" },
  { name: "start_date", label: "Start Date", field: "start_date", align: "center" },
  { name: "end_date", label: "End Date", field: "end_date", align: "center" },
  { name: "action", label: "Actions", field: "action", align: "right" }
])
const dateWarningMessage = ref("This date is outside the range of the contract dates")

const rows = computed(() => {
  const r = []
  if (props.services.length) {
    for (let index = 0; index < props.services.length; index++) {
      const service = props.services[index]
      const item = {
        id: service.id,
        name: service.name,
        lot: service.lot === null ? "n/a" : service.lot,
        value: Math.round(service.value),
        delivery_model_name: service.delivery_model === null ? "- -" : service.delivery_model.name,
        financial_model_name: service.financial_model === null ? "- -" : service.financial_model.name,
        start_date: service.start_date,
        end_date: service.end_date,
        action: service
      }
      r.push(item)
    }
  }
  return r
})
const subTotalServices = computed(() => {
  let sub = 0
  if (Array.isArray(props.services) && props.services.length) {
    for (let index = 0; index < props.services.length; index++) {
      const service = props.services[index]
      sub += parseInt(service.value)
    }
  }
  return sub
})
const warningMessage = computed(() => {
  let m = ""
  if (subTotalServices.value > props.contract.value) {
    const overBudget = subTotalServices.value - props.contract.value
    m = "Warning, the services sub total has breached the contract value by " +
      CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, overBudget)
  }
  return m
})
const totalsColor = computed(() => {
  return subTotalServices.value > props.contract.value ? "text-negative" : ""
})

function dateOutsideContractDates(date) {
  const selectedDate = new Date(DateMethods.convertDateFormat(date)).getTime()
  const contractStartDate = new Date(DateMethods.convertDateFormat(props.contract.start_date)).getTime()
  const contractEndDate = new Date(DateMethods.convertDateFormat(props.contract.end_date)).getTime()

  return selectedDate < contractStartDate || selectedDate > contractEndDate
}

function editService(service) {
  emit("edit", service.id)
}

/*
function onDelete(service) {
  emit("delete", service)
}
*/
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
