<template>
  <div>
    <milestone-assignments-table
      :assignments="assignedEngagements"
      :milestone="props.milestone"
      :sevice="props.request?.service"
      @update="updateAssignment"
      @remove="removeAssignment"
    />
    <consultant-milestone-assignment-form
      :request="props.request"
      :engagements="remainingEngagements"
      :milestone="props.milestone"
      :sevice="props.request?.service"
      @submit="assignEngagement"
    />
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useStore } from "vuex"
import ConsultantMilestoneAssignmentForm from "src/components/serviceManagement/ConsultantMilestoneAssignmentForm.vue"
import MilestoneAssignmentsTable from "src/components/serviceManagement/MilestoneAssignmentsTable.vue"

/* const emit = defineEmits(['cancel', 'refresh']) */
const store = useStore()

const props = defineProps({
  milestone: { type: Object, default: () => ({}) },
  milestones: { type: Array, default: () => [] },
  request: { type: Object, default: () => ({}) },
  vendorId: { type: String },
  purchaseOrder: { type: Object, default: () => ({}) }
})

const allEngagements = computed(() => {
  return props.request.consultant_engagements
})
const assignedEngagements = computed(() => {
  const e = []
  props.milestone.engagements.forEach(consultantEngagementMilestone => {
    const ce = allEngagements.value.find(item => item.id === consultantEngagementMilestone.consultant_engagement_id)
    const decoupledEngagement = decouple(ce)
    //set specific units for this milestone rather than the overall engagement
    if (decoupledEngagement) {
      decoupledEngagement.units = consultantEngagementMilestone.units
      const totalUnitsAllocated = getCumulativeAllocation(consultantEngagementMilestone.consultant_engagement_id)
      decoupledEngagement.unitsAllocationTotal = totalUnitsAllocated
      const totalEngagementUnits = getTotalEngagementUnits(consultantEngagementMilestone.consultant_engagement_id)
      decoupledEngagement.remainingAllocation = totalEngagementUnits - totalUnitsAllocated
      decoupledEngagement.consultant_engagement_milestone_id = consultantEngagementMilestone.id
      e.push(decoupledEngagement)
    }
  })
  return e
})
const remainingEngagements = computed(() => {
  const e = []
  allEngagements.value.forEach(engagement => {
    const ce = assignedEngagements.value.find(item => item.id === engagement.id)
    if (ce === undefined) {
      e.push(engagement)
    }
  })
  return e
})
const showAssigmentForm = computed(() => true)

function getCumulativeAllocation(consultantEngagementId) {
  let units = 0
  if (props.milestones && props.milestones.length) {
    for (const milestone of props.milestones) {
      if (milestone.engagements && milestone.engagements.length) {
        for (const engagement of milestone.engagements) {
          if (engagement.consultant_engagement_id === consultantEngagementId) {
            units += engagement.units
          }
        }
      }
    }
  }
  return units
}

function getTotalEngagementUnits(consultantEngagementId) {
  let units = 0

  if (props.request && props.request.consultant_engagements && props.request.consultant_engagements.length) {
    const engagement = props.request.consultant_engagements.find(e => e.id === consultantEngagementId)
    if (engagement) {
      units = engagement.units
    }
  }

  return units
}

function assignEngagement(obj) {
  const postData = {
    consultant_engagement_id: obj.engagement_id,
    purchase_order_milestone_id: obj.milestone_id,
    units: obj.units
  }
  const dataCallObj = {
    vendorID: props.vendorId,
    organisation_id: props.vendorId,
    data: postData,
    method: "post"
  }
  store.dispatch("vendor/consultantEngagementMilestones", dataCallObj).then(response => {
    const dispatchObj = {
      id: response.id,
      service_id: props.request.service_id,
      purchase_order_id: props.purchaseOrder.id,
      purchase_order_milestone_id: response.purchase_order_milestone_id,
      consultant_engagement_id: response.consultant_engagement_id,
      units: Number(response.units)
    }
    store.dispatch("contract/addMilestoneAssignment", dispatchObj)
  }).catch(e => {
    console.log("delete error: " + e)
    store.dispatch(
      "auth/setDataCallNotice",
      { show: true, title: "Error creating engagement", message: e }
    )
  })
}

function updateAssignment(obj) {
  const patch = {
    id: obj.id,
    method: "patch",
    data: {
      units: obj.units,
      organisation_id: props.vendorId
    }
  }
  store.dispatch("vendor/consultantEngagementMilestones", patch).then(response => {
    //now update Vuex
    const dispatchObj = {
      id: response.id,
      service_id: props.request.service_id,
      purchase_order_id: props.purchaseOrder.id,
      milestone_id: response.purchase_order_milestone_id,
      units: Number(response.units)
    }
    store.dispatch("contract/updateMilestoneAssignment", dispatchObj)
  }).catch(e => {
    console.log("patch error: " + e)
  })
}

function removeAssignment(id) {
  const dataCallObj = {
    id: id,
    method: "delete"
  }
  store.dispatch("vendor/consultantEngagementMilestones", dataCallObj).then(response => {
    //now update vuex
    const dispatchObj = {
      id: response.id,
      service_id: props.request.service_id,
      purchase_order_id: props.purchaseOrder.id,
      milestone_id: response.purchase_order_milestone_id
    }
    store.dispatch("contract/removeMilestoneAssignment", dispatchObj)
  }).catch(e => {
    store.dispatch(
      "auth/setDataCallNotice",
      { show: true, title: "Error deleting item", message: e }
    )
  })
}

function decouple(object) {
  if (object === undefined) {
    return undefined
  }
  return JSON.parse(JSON.stringify(object))
}
</script>
