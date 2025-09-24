<template>
  <div class="row">
    <new-selector-form
      v-model:option_id="selectedDeliverable"
      :options="remainingDeliverables"
      label="Add Deliverable"
      dense
      is-filterable
      filter-key="name"
      option-label="name"
      classes="q-mr-sm"
      default-class="full-width"
      style="min-width: 300px"
      :is-emit-value="false"
    />
    <q-btn
      label="Add to report"
      color="primary"
      text-color="dark"
      @click="addDeliverable"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

const props = defineProps({
  allServiceDeliverables: { type: Array, default: () => [] },
  assignedDeliverables: { type: Array, default: () => [] }
})

const emit = defineEmits(["add"])

const selectedDeliverable = ref(null)

const topLevelServiceDeliverables = computed(() => props.allServiceDeliverables.filter(item => item.parent_id === 0))

const remainingDeliverables = computed(() => {
  const a = [...topLevelServiceDeliverables.value]
  props.assignedDeliverables.forEach(item => {
    const index = a.findIndex(elem => elem.id === item.output_id)
    if (index > -1) {
      a.splice(index, 1)
    }
  })
  return a
})

const addDeliverable = () => {
  if (selectedDeliverable.value) {
    emit("add", selectedDeliverable.value)
    selectedDeliverable.value = null
  }
}
</script>
