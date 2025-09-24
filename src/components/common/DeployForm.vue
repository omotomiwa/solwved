<template>
  <q-card id="deploy-form" class="my-card no-shadow">
    <q-card-section>
      <div class="text-h4 text-primary">Deploy this order</div>
    </q-card-section>
    <q-card-section>
      <table>
        <tbody>
        <tr>
          <td>Customer</td>
          <td>{{ customerName }}</td>
        </tr>
        <tr>
          <td>Contract</td>
          <td>{{ contractReference }}</td>
        </tr>
        <tr>
          <td>Service Name</td>
          <td>{{ serviceName }}</td>
        </tr>
        <tr>
          <td>Service Line</td>
          <td>{{ serviceLine }}</td>
        </tr>
        </tbody>
      </table>
    </q-card-section>
    <q-card-section class="overflow-auto" style="max-height: 42vh;">
      <div v-if="service">
        <div v-if="service.delivery_model_id === 1" class="q-mb-md">This order is for <em>Contingent Labour</em></div>
        <div v-if="service.delivery_model_id === 2" class="q-mb-md">
          This order is for <em>Professional Services</em>
        </div>
        <div v-for="(capability, index) in props.requestCapabilities" :key="index" class="q-pa-md q-mb-lg">
          <div>Capability Requirement</div>
          <q-table
            flat
            :rows="getCapabilityRow(capability)"
            :columns="columns"
            row-key="position"
            hide-pagination
            class="bordered q-mb-md"
            table-header-class="text-weight-bolder text-primary"
            color="primary"
          >
          </q-table>
          <div class="q-pl-lg">
            <consultant-assignments-table
              :capability="capability"
              :assignments="capabilityAssignments[capability.capability_id]"
              :projects="projects"
              :service-type-id="service.delivery_model_id"
              @remove="removeAssignment"
              @update="updateAssignment"
              mode="assign"
            />
          </div>
          <consultant-assignment-form
            v-show="showAssigmentForm"
            class="q-pl-lg"
            :request="props.request"
            :request-capability="capability"
            :consultants="consultants"
            :projects="projects"
            :service-type-id="service.delivery_model_id"
            mode="deploy"
            @submit="assignConsultant"
          />
        </div>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="right" class="q-pa-md">
      <q-btn
        label="Cancel"
        color="white"
        outline
        class="q-ml-sm" @click="emit('cancel')"
      />
      <q-btn
        label="Deploy"
        :disable="!allowDeploy"
        color="primary"
        text-color="dark"
        @click="deployOrder"
      />
    </q-card-actions>
  </q-card>
  <q-dialog v-model="showDataCallMessage">
    <q-card class="no-shadow">
      <q-card-section>
        <div v-if="dataCallSuccess" class="text-h6 text-primary">Deployment Success</div>
        <div v-else class="text-h6 text-negative">Deployment Failed</div>
      </q-card-section>
      <q-card-section v-if="dataCallSuccess">
        Order Deployed successfully. Go to Service Management to manage the
        {{ OrganisationTypeMethods.changeConsultant(isBuiltEnvironment, { isPlural: true, isCamelCase: false }) }}
      </q-card-section>
      <q-card-section v-if="!dataCallSuccess">
        {{ dataCallMessage }}
      </q-card-section>
      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          color="primary"
          text-color="dark"
          label="OK"
          @click="closeAll"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useStore } from "vuex"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import ConsultantAssignmentForm from "src/components/common/ConsultantAssignmentForm.vue"
import ConsultantAssignmentsTable from "src/components/common/ConsultantAssignmentsTable.vue"

const emit = defineEmits(["cancel", "refresh"])
const store = useStore()

const props = defineProps({
  vendorId: { type: String, default: null },
  request: { type: Object, default: () => ({}) },
  capabilities: { type: Array, default: () => [] },
  requestCapabilities: { type: Array, default: () => [] },
  consultants: { type: Array, default: () => [] }
})

const assignedEngagements = ref([])
const showDataCallMessage = ref(false)
const dataCallSuccess = ref(false)
const dataCallMessage = ref("")

const organisation = computed(() => store.getters["admin/getOrganisation"])
const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])

const columns = computed(() => {
  let columnList = [{ name: "capability", label: "Capability", field: "capability", align: "left" }]

  if (props.request?.service?.has_competency) {
    columnList.push({ name: "competency", label: "Competency", field: "competency", align: "left" })
  }

  return [
    ...columnList,
    { name: "units", label: "Units", field: "units", align: "center" },
    {
      name: "max_charge_rate",
      label: "Max Charge Rate",
      field: "max_change_rate",
      align: "right",
      format: (val, row) => CurrencyMethods.toCurrencyFormat(
        organisation.value?.currency?.code,
        CurrencyMethods.toNumber(row.budget) / row.units
      )
    },
    { name: "budget", label: "Budget", field: "budget", align: "right" },
    { name: "start_date", label: "Ideal Start Date", field: "start_date", align: "center" },
    { name: "end_date", label: "Ideal End Date", field: "end_date", align: "center" }
  ]
})

//return an object keyed by capability_id
const capabilityAssignments = computed(() => {
  const obj = {}
  assignedEngagements.value.forEach(item => {
    if (obj[item.capability_id] === undefined) {
      obj[item.capability_id] = []
    }
    obj[item.capability_id].push(item)
  })
  return obj
})
const showAssigmentForm = computed(() => !(assignedEngagements.value.length && service.value.delivery_model_id === 1))
const customerName = computed(() => props?.request?.contract?.customer?.name ?? "")
const projects = computed(() => props?.request?.contract?.projects ?? [])
const contractReference = computed(() => props?.request?.contract?.reference ?? "")
const serviceName = computed(() => props?.request?.service?.name ?? "")
const serviceLine = computed(() => props?.request?.service_line?.name ?? "")
const service = computed(() => props?.request?.service ?? null)
const consultants = computed(() => {
  let c = store.getters["vendor/getConsultantsByVendor"](props.vendorId)
  c = JSON.parse(JSON.stringify(c))
  if (Array.isArray(c) && c.length > 0) {
    c.sort((a, b) => (a.user.last_name > b.user.last_name ? 1 : b.user.last_name > a.user.last_name ? -1 : 0))
  }
  return c.map(item => {
    return {
      id: item.id,
      name: item.user.fullName
    }
  })
})
const allowDeploy = computed(() => assignedEngagements.value.length > 0)

function getCapabilityRow(capability) {
  const row = {
    capability: capability.capability?.name,
    competency: capability.competency?.name,
    units: capability.units,
    budget: CurrencyMethods.toCurrencyFormat(organisation.value?.currency?.code, capability.budget),
    start_date: capability.start_date,
    end_date: capability.end_date
  }
  return [row]
}

function getConsultants(force) {
  if (consultants.value.length < 1 || force) {
    store.dispatch("vendor/getVendorConsultants", props.vendorId)
  }
}

function assignConsultant(obj) {
  obj.projects = []
  const projectIds = obj.project_ids
  projectIds.forEach(id => {
    const projectObj = decouple(projects.value.find(elem => elem.id === id))
    const p = {
      project_id: id,
      project: projectObj
    }
    obj.projects.push(p)
  })
  assignedEngagements.value.push(obj)
}

function removeAssignment(obj) {
  const itemToRemove = assignedEngagements.value[obj._id]
  assignedEngagements.value = assignedEngagements.value.filter(function(item) {
    return item !== itemToRemove
  })
}

async function updateAssignment(obj) {
  const index = obj._id
  const item = assignedEngagements.value[index]
  for (const [key] of Object.entries(obj)) {
    if (key === "project_ids") {
      item.projects = []
      const projectIds = obj[key]
      projectIds.forEach(id => {
        const p = {
          project_id: id,
          project: projects.value.find(elem => elem.id === id)
        }
        item.projects.push(p)
      })
    } else {
      item[key] = obj[key]
    }
  }
}

function deployOrder() {
  const customerRequestID = props.request.id
  const obj = {
    customerRequestID: customerRequestID,
    engagements: buildPost(),
    organisation_id: organisation.value?.id
  }
  store.dispatch("vendor/deployOrder", obj).then(() => {
    dataCallSuccess.value = true
    dataCallMessage.value = ""
    showDataCallMessage.value = true
  }).catch(e => {
    dataCallSuccess.value = false
    showDataCallMessage.value = true
    dataCallMessage.value = e?.data?.message || e?.data || e
  })
}

function buildPost() {
  return assignedEngagements.value.map(item => {
    return {
      consultant_id: item.consultant_id,
      capability_id: item.capability_id,
      competency_id: item.competency_id,
      project_ids: item.project_ids,
      charge_rate: item.charge_rate,
      pay_rate: item.pay_rate,
      budget: item.budget,
      units: item.units,
      start_date: item.start_date,
      end_date: item.end_date
    }
  })
}

function closeAll() {
  showDataCallMessage.value = false
  emit("refresh")
}

function decouple(object) {
  return JSON.parse(JSON.stringify(object))
}

onMounted(() => {
  getConsultants(true)
})
</script>

<style lang="scss" scoped>
#deploy-form {
  width: 90vw;
  max-width: 1200px;
}

table {
  border-collapse: collapse;
}

td {
  padding-left: 1rem;
}

td:first-child {
  padding-right: 1rem;
  padding-left: 0;
  border-right: 1px solid $swlvd-yellow
}
</style>
