<template>
  <div>
    <div v-if="assignedDeliverables.length">
      <service-line-deliverable
        v-for="deliverable in assignedDeliverables"
        :key="deliverable.id"
        :item="deliverable"
        :is-editable="props.isEditable"
        @update="value => $emit('update', value)"
        @delete="onDeleteDeliverable"
      />
    </div>
    <div v-else>No deliverables are assigned on this report</div>
    <add-service-line-deliverable
      v-if="serviceDeliverables.length && isEditable"
      :all-service-deliverables="serviceDeliverables"
      :assigned-deliverables="assignedDeliverables"
      @add="onAddDeliverable"
    />
  </div>
</template>

<script setup>
import { onMounted, reactive, watch } from "vue"
import { v4 as uuidv4 } from "uuid"
import ServiceLineDeliverable from "./ServiceLineDeliverable.vue"
import AddServiceLineDeliverable from "./AddServiceLineDeliverable.vue"

const props = defineProps({
  serviceDeliverables: { type: Array, default: () => [] },
  serviceLineDeliverables: { type: Array, default: () => [] },
  serviceLineId: { type: Number },
  spendReportId: { type: Number },
  isEditable: { type: Boolean }
})

const emit = defineEmits(["update", "add", "delete"])

let assignedDeliverables = reactive([])

watch(props.serviceLineDeliverables, () => {
  assignedDeliverables.length = 0
  props.serviceLineDeliverables.forEach(item => {
    assignedDeliverables.push(item)
  })
})

const onDeleteDeliverable = deliverable => {
  if (deliverable.id !== undefined) {
    const index = assignedDeliverables.findIndex(item => item.id === deliverable.id)
    assignedDeliverables.splice(index, 1)
    emit("delete", deliverable)
  } else {
    onDeleteTempDeliverable(deliverable)
  }
}
const onDeleteTempDeliverable = deliverable => {
  const index = assignedDeliverables.findIndex(item => item._tempid === deliverable._tempid)
  assignedDeliverables.splice(index, 1)
  emit("delete", deliverable)
}

const onAddDeliverable = output => {
  const deliverable = {
    _tempid: uuidv4(),
    spend_report_id: props.spendReportId,
    spend_report_service_line_id: props.serviceLineId,
    service_id: output.service_id,
    output_id: output.id,
    name: output.name,
    progress: 0,
    stage: "Not started",
    status: "Green",
    progress_summary: "",
    position: assignedDeliverables.length + 1
  }
  assignedDeliverables.push(deliverable)
  emit("add", deliverable)
}

onMounted(() => {
  props.serviceLineDeliverables.forEach(item => {
    assignedDeliverables.push(item)
  })
})
</script>
