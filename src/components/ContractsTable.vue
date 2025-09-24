<template>
  <q-table
    flat
    :grid="$q.screen.xs"
    selection="none"
    :rows="rows"
    :columns="columns"
    row-key="id"
    class="bordered"
    color="primary"
    table-header-class="text-weight-bolder text-primary"
    :hide-pagination="props.contracts.length <= maxRows"
    :pagination="{ rowsPerPage: maxRows }"
  >
    <template #body-cell-action="props">
      <q-td :props="props">
        <div>
          <q-btn
            color="primary"
            size="sm"
            label="VIEW / EDIT"
            :to="props.value"
            icon="edit"
            outline
          />
        </div>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { useQuasar } from "quasar"
import { computed, ref } from "vue"
import { useRoute } from "vue-router"
import { useStore } from "vuex"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"

const store = useStore()
const route = useRoute()

const props = defineProps({
  contracts: { type: Array, default: () => [] },
  view: { type: String, default: "vendor" }
})
const $q = useQuasar()
const maxRows = ref(15)

const organisation = computed(() => store.getters["admin/getOrganisation"])

const columns = computed(() => {
  if (props.view === "vendor") {
    return [
      { name: "reference", label: "Contract Reference", field: "reference", align: "left" },
      { name: "vendor", label: "Vendor", field: "vendor", align: "left" },
      { name: "customer", label: "Customer", field: "customer", align: "left" },
      {
        name: "value",
        label: "Value",
        field: "value",
        align: "right",
        format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
      },
      {
        name: "start_date",
        label: "Start Date",
        field: "start_date",
        align: "center",
        format: val => val || "-"
      },
      {
        name: "end_date",
        label: "End Date",
        field: "end_date",
        align: "center",
        format: val => val || "-"
      },
      { name: "action", label: "Actions", field: "action", align: "right" }
    ]
  } else {
    return [
      { name: "reference", label: "Contract Reference", field: "reference", align: "left" },
      { name: "customer", label: "Customer", field: "customer", align: "left" },
      { name: "vendor", label: "Vendor", field: "vendor", align: "left" },
      {
        name: "value",
        label: "Value",
        field: "value",
        align: "right",
        format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
      },
      {
        name: "start_date",
        label: "Start Date",
        field: "start_date",
        align: "center",
        format: val => val || "-"
      },
      {
        name: "end_date",
        label: "End Date",
        field: "end_date",
        align: "center",
        format: val => val || "-"
      },
      { name: "action", label: "Actions", field: "action", align: "right" }
    ]
  }
})
const rows = computed(() => {
  const r = []
  if (props.contracts.length) {
    for (let index = 0; index < props.contracts.length; index++) {
      const contract = props.contracts[index]
      const item = {
        id: contract.id,
        reference: contract.reference,
        vendor: contract.vendor.name,
        customer: contract.customer.name,
        value: contract.value,
        start_date: contract.start_date,
        end_date: contract.end_date,
        action: buildEditLink(contract)
      }
      r.push(item)
    }
  }
  return r
})

function buildEditLink(record) {
  return route.path + "/" + record.id
}
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
