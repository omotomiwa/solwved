<template>
  <div>
    <ConsultantAssignmentsTable
      mode="manage"
      :assignments="assignedEngagements"
      :request="props.request"
      :service-type-id="props.serviceTypeId"
      :request-capabilities="requestCapabilities"
      :competencies="competencies"
      :projects="props.projects"
      :vendor-id="vendorId"
      @remove="deleteEngagement"
      @update="updateEngagement"
    />
    <ConsultantAssignmentForm
      v-show="showAssigmentForm"
      :request="props.request"
      :consultants="consultants"
      :request-capabilities="requestCapabilities"
      :competencies="competencies"
      :projects="projects"
      :service-type-id="props.serviceTypeId"
      :milestone="props.milestone"
      @submit="createEngagement"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useStore } from "vuex"
import ConsultantAssignmentForm from "src/components/common/ConsultantAssignmentForm.vue"
import ConsultantAssignmentsTable from "src/components/common/ConsultantAssignmentsTable.vue"

/* const emit = defineEmits(['cancel', 'refresh']) */
const store = useStore()

const props = defineProps({
  request: { type: Object, default: () => ({}) },
  consultants: { type: Array, default: () => [] },
  projects: { type: Array, default: () => [] },
  vendorId: { type: String },
  serviceTypeId: { type: Number, default: 3 }
})

const assignedEngagements = ref([])

const requestCapabilities = computed(() => {
  const c = []
  props.request.capabilities.forEach(item => {
    const obj = {
      id: item.id,
      name: item.capability.name,
      capability: item.capability
    }
    c.push(obj)
  })
  return c
})
const competencies = computed(() => store.getters["common/getCompetencies"])
const vendorId = computed(() => props.vendorId)
const showAssigmentForm = computed(() => true)

function createEngagement(obj) {
  const postData = {}
  postData.request_id = props.request.id
  postData.budget = obj.budget
  postData.pay_rate = obj.pay_rate
  postData.charge_rate = obj.charge_rate
  postData.start_date = obj.start_date
  postData.end_date = obj.end_date
  postData.competency_id = obj.competency_id
  postData.capability_id = obj.capability_id
  postData.request_capability_id = obj.request_capability_id
  postData.consultant_id = obj.consultant_id
  postData.project_ids = obj.project_ids
  postData.units = parseInt(obj.units)

  const dataCallObj = {
    vendorID: props.vendorId,
    data: postData,
    method: "post"
  }
  store.dispatch("vendor/consultantEngagement", dataCallObj).then(response => {
    // add the local engagement
    assignedEngagements.value.push(response)

    // need to also push update to Vuex so totals can be calculated
    const dispatchObj = {
      service_id: props.request.service_id,
      request_id: props.request.id,
      engagement: response
    }
    store.dispatch("contract/addServiceEngagement", dispatchObj)
  }).catch(e => {
    console.log("delete error: " + e)
    store.dispatch(
      "auth/setDataCallNotice",
      { show: true, title: "Error creating engagement", message: e }
    )
  })
}

function deleteEngagement(obj) {
  const dataCallObj = {
    vendorID: props.vendorId,
    id: obj.id,
    method: "delete"
  }
  store.dispatch("vendor/consultantEngagement", dataCallObj).then(() => {
    // remove the local engagement
    const index = assignedEngagements.value.findIndex(el => el.id === obj.id)
    assignedEngagements.value.splice(index, 1)

    // need to also push update to Vuex so totals can be calculated
    const dispatchObj = {
      service_id: props.request.service_id,
      request_id: props.request.id,
      engagement_id: obj.id
    }
    store.dispatch("contract/removeServiceEngagement", dispatchObj)
  }).catch(e => {
    console.log("delete error: " + e)
    store.dispatch(
      "auth/setDataCallNotice",
      { show: true, title: "Error deleting engagement", message: e }
    )
  })
}

// Find relevant engegament and update with new data
// This will then flow down through the componenents
function updateEngagement(obj) {
  const index = assignedEngagements.value.findIndex(el => parseInt(el.id) === parseInt(obj.id))
  assignedEngagements.value[index] = obj //fresh data from database

  // TODO now also update Vuex so that the table calcs update
  const dispatchObj = {
    service_id: props.request.service_id,
    request_id: props.request.id,
    engagement: obj
  }
  store.dispatch("contract/updateServiceEngagement", dispatchObj)
}

function setEngagements() {
  assignedEngagements.value = decouple(props.request.consultant_engagements)
}

function decouple(object) {
  return JSON.parse(JSON.stringify(object))
}

onMounted(() => {
  setEngagements()
})
</script>
