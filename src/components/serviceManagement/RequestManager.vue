<template>
  <div>
    <div v-if="request.capabilities.length > 1" class="row items-center text-weight-bold q-mb-md">
      <q-icon name="info" class="q-mr-sm" />
      <div class="q-mr-xs">There are multiple capabilities on this request, listed below.</div>
      <div v-if="remainingBudget.amount >= 0">
        Remaining budget for this request
        {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, remainingBudget.amount) }}
      </div>
      <div v-else-if="remainingBudget.amount < 0" class="text-negative">
        Warning, this request is over budget by
        {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, -remainingBudget.amount) }}
      </div>
    </div>
    <div v-for="requestCapability in request.capabilities" :key="requestCapability.id" class="q-pa-md q-mb-lg">
      <div class="q-mb-md capability-header">
        <div class="text-weight-bold q-mb-sm">Requested Capability:</div>
        <div class="capability-name q-pb-md">
          {{ requestCapability.capability.name }}, {{ getCompetencyName(requestCapability.competency_id) }}
        </div>
      </div>
      <consultant-assignments-table
        mode="manage"
        :show-remaining-budget="request.capabilities.length < 2"
        :assignments="capabilityEngagements(requestCapability.id)"
        :request="props.request"
        :service-type-id="2"
        :projects="props.projects"
        :vendor-id="vendorId"
        @remove="deleteEngagement"
        @update="updateEngagement"
      />
      <consultant-assignment-form
        v-show="showAssigmentForm"
        :request="props.request"
        :request-capability="requestCapability"
        :consultants="consultants"
        :projects="projects"
        :service-type-id="2"
        @submit="createEngagement"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"
import ConsultantAssignmentForm from "src/components/common/ConsultantAssignmentForm.vue"
import ConsultantAssignmentsTable from "src/components/common/ConsultantAssignmentsTable.vue"

/* const emit = defineEmits(['cancel', 'refresh']) */
const store = useStore()

const props = defineProps({
  request: { type: Object, default: () => ({}) },
  consultants: { type: Array, default: () => [] },
  projects: { type: Array, default: () => [] },
  vendorId: { type: String }
})

const assignedEngagements = ref([])

const organisation = computed(() => store.getters["admin/getOrganisation"])
const vendorId = computed(() => props.vendorId)
const showAssigmentForm = computed(() => true)
const competencies = computed(() => {
  return store.getters["common/getCompetencies"]
})
const totalSpend = computed(() => {
  let budget = 0
  const assignments = []
  if (props.request.capabilities) {
    props.request.capabilities.forEach(capability => {
      assignments.push(...capabilityEngagements(capability.id))
    })
  }

  assignments.forEach(assignment => {
    budget += Number(assignment.budget)
  })
  return budget
})
const remainingBudget = computed(() => {
  let poTotal = Number(props.request.purchase_order?.amount)
  const v = poTotal - totalSpend.value
  const pc = parseInt((v / poTotal) * 100)
  return { amount: v, percent: pc }
})

function getCompetencyName(id) {
  let name = ""
  if (competencies.value.length) {
    const competency = competencies.value.find(competency => competency.id === id)
    name = competency?.name
  }
  return name
}

function getRequestCapabilityId(capability_id) {
  const requestCapability = props.request.capabilities.find(capability => capability.capability_id === capability_id)
  return requestCapability?.id
}

function createEngagement(obj) {
  const postData = obj
  postData.request_id = props.request.id
  //need to set the request_capability_id and remove capability_id
  postData.request_capability_id = getRequestCapabilityId(postData.capability_id)
  delete postData.capability_id
  delete postData.projects
  delete postData.consultant_name
  delete postData.capability_name

  const dataCallObj = {
    vendorID: props.vendorId,
    data: postData,
    method: "post"
  }
  store.dispatch("vendor/consultantEngagement", dataCallObj).then(response => {
    // add the local engagement
    assignedEngagements.value.push(response)
  }).catch(e => {
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
  const index = assignedEngagements.value.findIndex(el => el.id === obj.id)
  const item = assignedEngagements.value[index]
  for (const [key] of Object.entries(obj)) {
    if (key === "project_ids") {
      item.projects = []
      const projectIds = obj[key]
      projectIds.forEach(id => {
        const p = {
          project_id: id,
          project: props.projects.find(elem => elem.id === id)
        }
        item.projects.push(p)
      })
    } else {
      item[key] = obj[key]
    }
  }
}

function capabilityEngagements(requestCapabilityId) {
  const e = []
  if (assignedEngagements.value && assignedEngagements.value.length) {
    assignedEngagements.value.forEach(engagement => {
      if (engagement.request_capability_id === requestCapabilityId) {
        e.push(engagement)
      }
    })
  }
  return e
}

function decouple(object) {
  return JSON.parse(JSON.stringify(object))
}

onMounted(() => {
  assignedEngagements.value = decouple(props.request.engagements)
})
</script>

<style lang="scss" scoped>
.capability-name {
  font-size: 1.2em;
}

.capability-header {
  border-bottom: 1px solid $swlvd-yellow;
}
</style>
