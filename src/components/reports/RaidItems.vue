<script setup>
import { computed, nextTick, ref, watch } from "vue"
import { useStore } from "vuex"
import { useRoute } from "vue-router"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import NewSelectorForm from "components/NewSelectorForm.vue"

const emit = defineEmits(["addItem", "removeItem", "reorderItems"])
const route = useRoute()
const store = useStore()

const props = defineProps({
  options: Array,
  items: Array,
  editable: Boolean
})

const selectedRaidItem = ref(null)
const columns = ref([
  { name: "position", label: "", field: "position", align: "left" },
  { name: "title", label: "Title", field: "title", align: "left" },
  { name: "type", label: "Type", field: "type", align: "left" },
  { name: "category", label: "Category", field: "category", align: "left" },
  { name: "impact", label: "Impact", field: "impact", align: "left" },
  { name: "status", label: "Status", field: "status", align: "left" },
  { name: "link", label: "", field: "link", align: "left" },
  { name: "trash", label: "", field: "trash", align: "right" }
])

const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const raidOptions = computed(() => {
  const options = []
  if (props.options && props.options.length) {
    props.options.forEach(option => {
      if (sortedItems.value.find(element => element.raid_log_id === option.id) === undefined) {
        options.push(option)
      }
    })
  }
  return options
})
const allOptionsAssigned = computed(() => !!(props.options.length && raidOptions.value.length === 0))

const sortedItems = computed(function() {
  let sorted = []
  if (props.items && Array.isArray(props.items) && props.items.length) {
    sorted = [...props.items].sort(function(a, b) {
      return a.position - b.position
    })
    // failsafe to ensure no position skipped, especially after a delete
    for (let index = 0; index < sorted.length; index++) {
      sorted[index].position = index + 1
    }
  }
  return sorted
})
const rows = computed(() => {
  const r = []
  sortedItems.value.forEach(item => {
    const row = {
      position: {
        item: item,
        old_position: item.position
      },
      title: item.title,
      type: item.type,
      category: item.category,
      impact: item.impact,
      status: item.status,
      link: item,
      trash: item
    }

    // patches for newly added items with slightly different data structure
    if (item.type_id !== undefined) {
      row.type = item.type.name
    }
    if (item.category_id !== undefined) {
      row.category = item.category.name
    }
    if (item.impact_id !== undefined) {
      row.impact = item.impact.name
    }
    if (item.status_id !== undefined) {
      row.status = item.status.name
    }

    r.push(row)
  })
  return r
})

watch(
  sortedItems,
  async function(newVal, oldVal) {
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      await nextTick()
      emit("reorderItems", newVal)
    }
  },
  { deep: true }
)

function addItem() {
  emit("addItem", selectedRaidItem.value)
  selectedRaidItem.value = null
}

function removeItem(id) {
  emit("removeItem", id)
}

function reorderItems(item, oldPosition) {
  const newPosition = item.position
  const items = sortedItems.value
  for (let index = 0; index < items.length; index++) {
    const i = items[index]
    if (i === item) {
      i.position = newPosition
    } else if (newPosition < oldPosition) {
      if (i.position >= newPosition && i.position < oldPosition) {
        i.position += 1
      }
    } else if (newPosition > oldPosition) {
      if (i.position <= newPosition && i.position > oldPosition) {
        i.position -= 1
      }
    }
  }
}

function getItemLink(item) {
  const urlArray = route.fullPath.split("/")
  const entity = urlArray[1]
  const id = urlArray[2]
  const basePath = `/${entity}/${id}`
  return basePath + "/service-management/raid/" + item.raid_log_id
}
</script>

<template>
  <q-table
    flat
    :rows="rows"
    :columns="columns"
    row-key="position"
    hide-pagination
    class="bordered q-mb-md"
    table-header-class="text-weight-bolder text-primary"
    color="primary"
  >
    <template #body-cell-position="props">
      <q-td :props="props">
        <select
          v-if="editable"
          v-model="props.value.item.position"
          class="raid-list-row__select"
          @update:model-value="() => reorderItems(props.value.item, props.value.old_position)"
        >
          <option v-for="(_, index) in sortedItems" :key="index" :value="index + 1">
            {{ index + 1 }}
          </option>
        </select>
        <div v-else>{{ props.value.item.position }}</div>
      </q-td>
    </template>
    <template #body-cell-link="props">
      <q-td :props="props">
        <router-link :to="getItemLink(props.value)">View Details</router-link>
      </q-td>
    </template>
    <template #body-cell-trash="props">
      <q-td :props="props">
        <q-icon
          v-if="editable"
          name="delete"
          color="negative"
          class="cursor-pointer"
          size="sm"
          @click="removeItem(props.value)"
        />
      </q-td>
    </template>
  </q-table>
  <div v-if="!allOptionsAssigned && editable" class="row">
    <new-selector-form
      v-model:option_id="selectedRaidItem"
      :label="'Add a '+OrganisationTypeMethods.changeRaid(isBuiltEnvironment)+' log item'"
      is-filterable
      classes="col-auto"
      default-class="full-width"
      is-clearable
      dense
      :options="raidOptions"
      filter-key="title"
      option-label="title"
      style="min-width: 370px"
      :no-option-label="'No '+OrganisationTypeMethods.changeRaid(isBuiltEnvironment)+' items applicable to this report'"
      :is-emit-value="false"
      is-option-customisable
    >
      <template v-slot:option="{option, events}">
        <q-item v-bind="events">
          <q-item-section avatar>
            <span v-if="option.type_id === 1">Risk:</span>
            <span v-if="option.type_id === 2">Issue:</span>
            <span v-if="option.type_id === 3">Assumption:</span>
            <span v-if="option.type_id === 4">Dependency:</span>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ option.title }}</q-item-label>
            <q-item-label caption>{{ option.description }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </new-selector-form>
    <q-btn
      v-if="selectedRaidItem"
      label="Add to report"
      unelevated
      size="sm"
      color="primary"
      text-color="dark"
      class="q-ml-sm"
      @click="addItem"
    />
  </div>
  <div v-if="editable && allOptionsAssigned">You have assigned all applicable
    {{ OrganisationTypeMethods.changeRaid(isBuiltEnvironment) }} items
  </div>
</template>

<style scoped>
.raid-list {
  padding-left: 0;
  margin-left: 0;
}

.raid-list-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
}

.raid-list-row__trash {
  flex: 0 0 20px;
  cursor: pointer;
}

.raid-list-row__select {
  flex: 0 0 40px;
}

.raid-list-row__details {
  flex: 1 1 auto;
}

.raid-list-row__input {
  flex: 1 1 auto;
}
</style>
