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
    wrap-cells
    class="bordered"
    table-header-class="text-weight-bolder text-primary"
    color="primary"
  >
    <template #body-cell-notes="props">
      <q-td :props="props">
        <text-with-show-more :text="props.value" :show-more-words="10" />
      </q-td>
    </template>
    <template #body-cell-attachment="props">
      <q-td :props="props">
        <q-list v-if="props.value.length > 0" separator bordered>
          <q-item v-for="(_,index) of props.value"
                  :key="index">
            <q-item-section>
              <media-widget
                :allow-new-upload="false"
                :show-delete="false"
                v-model="props.value[index]"
              />
            </q-item-section>
          </q-item>
        </q-list>
        <span v-else class="dimmed text-caption">No Attachment</span>
      </q-td>
    </template>
    <template #body-cell-action="props">
      <q-td :props="props">
        <div>
          <q-btn color="green" label="VIEW / EDIT" size="sm" :to="props.value" icon="edit" />
        </div>
      </q-td>
    </template>
  </q-table>
</template>

<script>
export default {
  name: "CustomerRequestsCapabilitiesTable",
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup>
import { useQuasar } from "quasar"
import { computed, ref } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"
import MediaWidget from "components/MediaWidget.vue"
import TextWithShowMore from "components/common/text/TextWithShowMore.vue"

const $q = useQuasar()
const store = useStore()

const props = defineProps({
  request: { type: Object, default: () => ({}) },
  version: { type: Number, default: 0 }
})

const initialPagination = ref({ rowsPerPage: 0 })

const organisation = computed(() => store.getters["admin/getOrganisation"])
const columns = computed(() => {
  let columnList = [{ name: "capability", label: "Capability", field: "capability", align: "left" }]

  if (props.request?.service?.has_competency) {
    columnList.push({ name: "competency", label: "Competency", field: "competency", align: "left" })
  }

  return [
    ...columnList,
    { name: "units", label: "Units", field: "units", align: "center" },
    {
      name: "charge_rate",
      label: "Day Rate",
      field: "charge_rate",
      align: "right",
      format: val => CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, val)
    },
    {
      name: "budget",
      label: "Budget",
      field: "budget",
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
    { name: "notes", label: "Notes", field: "notes", align: "left" },
    { name: "attachment", label: "Attachments", field: "attachment", align: "left" }
  ]
})
const rows = computed(() => {
  const r = []
  if (props.request) {
    const capabilities = props.request.capabilities

    capabilities.forEach(c => {
      if (props.version && props.version !== c.version) {
        return
      }
      const row = {
        id: c.id,
        version: c.version,
        capability: c.capability?.name,
        competency: c.competency?.name,
        budget: Math.round(c.budget),
        units: c.units,
        charge_rate: c.charge_rate,
        start_date: c.start_date,
        end_date: c.end_date,
        notes: c.notes,
        attachment: c.attachment,
        action: "action"
      }
      r.push(row)
    })
  }
  return r
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
