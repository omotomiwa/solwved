<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Order Management</div>
      <BreadCrumb align="center" :organisation="organisation" v-if="organisation" />
      <div v-if="isAuthorised && contract" class="q-mt-lg full-width">
        <div class="text-h4 text-white q-pb-md">
          This order status:
          <span class="text-primary">{{ statuses[request.status] }}</span>
        </div>
        <table style="width: 100%">
          <tbody>
          <tr>
            <td class="infos">Customer</td>
            <td>{{ request.contract.customer.name }}</td>
          </tr>
          <tr>
            <td class="infos">Contract</td>
            <td v-if="contract.reference">{{ contract.reference }}</td>
          </tr>
          <tr>
            <td class="infos">Service</td>
            <td>{{ service.name }}</td>
          </tr>
          <tr>
            <td class="infos">Delivery Model</td>
            <td>{{ service.delivery_model.name }}</td>
          </tr>
          <tr>
            <td class="infos">
              Service Line
            </td>
            <td>{{ request.service_line?.name }}</td>
          </tr>
          <tr>
            <td class="infos">Vendor</td>
            <td>{{ contract.vendor.name }}</td>
          </tr>
          <tr>
            <td class="infos">Requester</td>
            <td>{{ request.requester.fullName }}</td>
          </tr>
          <tr>
            <td class="infos">Notes</td>
            <td>
              <text-with-show-more :text="request.notes ?? ''" :show-more-words="25" />
            </td>
          </tr>
          </tbody>
        </table>

        <div class="q-pa-md" v-if="versions.length > 0">
          <q-list bordered class="rounded-borders">
            <q-expansion-item
              v-for="version in versions"
              :key="version.key"
              expand-separator
              :icon="version.icon"
              :label="version.label"
              :caption="version.caption"
              :default-opened="version.key === latestVersion"
            >
              <q-card>
                <q-card-section>
                  <CustomerRequestsCapabilitiesTable :request="request" :version="version.key" />
                  <div v-if="(version.key === latestVersion) & !showNewCapabilityForm" class="q-ma-sm">
                    <q-btn
                      v-if="canAccept"
                      class="q-ml-sm"
                      label="Accept"
                      icon="thumb_up"
                      color="primary"
                      text-color="dark"
                      size="md"
                      @click="acceptRequest"
                    />
                    <q-btn
                      v-if="canNegotiate"
                      class="q-ml-sm"
                      label="Negotiate"
                      icon="apps"
                      color="accent"
                      size="md"
                      @click="negotiateRequest"
                    />
                    <q-btn
                      v-if="canReject"
                      class="q-ml-sm"
                      label="Reject"
                      color="negative"
                      icon="thumb_down"
                      size="md"
                      @click="rejectRequest"
                    />
                  </div>
                </q-card-section>
                <q-card-section v-if="version.key === latestVersion">
                  <div class="text-primary row items-center">
                    <q-icon :name="nextStepsIcon" size="sm" class="q-mr-sm" />
                    {{ nextStepsMessage }}
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
            <q-expansion-item
              v-if="showNewCapabilityForm === true"
              expand-separator
              default-opened
              label="Revised proposal"
              :caption="'Revision proposed by ' + court"
              class="q-mt-md"
            >
              <q-card>
                <q-card-section>
                  You can edit the existing capabilties, remove them entirely, or add new capabilities
                </q-card-section>
                <q-card-section>
                  <CustomerRequestsCapabilityForm
                    :service="service"
                    :capabilities="capabilities"
                    :request_capabilities="latestVersionCapabilities"
                    :order-status="statuses[request.status]"
                    class="q-mb-xl"
                    @cancel="showNewCapabilityForm = false"
                    @submit="submitNewCapabilities"
                  />
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </div>
        <div v-if="canDeploy" class="q-mt-md">
          <q-btn
            label="Deploy this Order"
            color="primary"
            text-color="dark"
            size="md"
            @click="showDeployDialogue = true"
          />
        </div>
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
    <q-dialog v-model="showDeployDialogue" no-backdrop-dismiss>
      <deploy-form
        :vendorId="vendor_id"
        :request="request"
        :capabilities="capabilities"
        :requestCapabilities="latestVersionCapabilities"
        @cancel="showDeployDialogue = false"
        @refresh="redirectToDashboard"
      />
    </q-dialog>
  </q-page>
</template>

<script>
export default {
  name: "ServiceRequest",
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup>
import { date, useQuasar } from "quasar"
import { computed, onMounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import { ClassCombinations, Config } from "src/modules/StaticData.js"
import { vendorAuth, customerAuth } from "src/modules/AuthLogic.js"
import { DateMethods } from "src/modules/GlobalMethods.js"
import CustomerRequestsCapabilitiesTable from "components/CustomerRequestsCapabilitiesTable.vue"
import CustomerRequestsCapabilityForm from "components/CustomerRequestsCapabilityForm.vue"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import DeployForm from "src/components/common/DeployForm.vue"
import TextWithShowMore from "components/common/text/TextWithShowMore.vue"

const $q = useQuasar()
const store = useStore()
const router = useRouter()

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null },
  customer_request_id: { type: String, default: null }
})

const statuses = ["Submitted", "Dialogue", "Accepted", "Active", "Rejected", "Archived"]
const localRecord = { customer_request_id: props.customer_request_id, notes: "" }

const showDeployDialogue = ref(false)
const showNewCapabilityForm = ref(false)
const canAccept = ref(false)
const canNegotiate = ref(false)
const canReject = ref(false)
const proposerOrgType = ref(null)
const localAcceptanceStatus = ref("dialogue")
let serviceId = ref(0)

let isAuthorised = false
if (props.vendor_id) {
  isAuthorised = vendorAuth(props.vendor_id).isAuthorised
}
if (props.customer_id) {
  isAuthorised = customerAuth(props.customer_id).isAuthorised
}

const contract = computed(() => request.value.contract)
const service = computed(() => request.value.service)
const request = computed(() => store.getters["contract/getCustomerrequest"])
const organisations = computed(() => store.getters["admin/getOrganisations"])
const organisation = computed(() => {
  let org = {}
  let orgId = 0
  if (props.vendor_id) {
    orgId = parseInt(props.vendor_id)
  }
  if (props.customer_id) {
    orgId = parseInt(props.customer_id)
  }
  if (organisations.value.length) {
    org = organisations.value.find(organisations => organisations.id === orgId)
  }
  return org
})
const capabilities = computed(() => {
  // return store.getters['contract/getCapabilities']
  if (!request.value.service) {
    return null
  }
  return request.value.service.capabilities
})
const versions = computed(() => {
  const v = []
  let currentVersion = -1
  let labelSuffix = ""
  let icon = "add_reaction"
  request.value.capabilities.forEach(c => {
    if (c.version !== currentVersion) {
      currentVersion = c.version
      if (c.proposed_by === "Customer") {
        labelSuffix = "Customer proposed"
        icon = "add_reaction"
      } else {
        labelSuffix = "Vendor proposed"
        icon = "history"
      }
      const node = {
        key: currentVersion,
        icon: icon,
        label: "Version " + currentVersion + ": " + labelSuffix,
        caption: "Submitted on " + date.formatDate(DateMethods.convertDateTimeFormat(c.created_at), Config.DATETIME_FORMAT_DMY_HM)
      }
      v.push(node)
    }
  })
  return v
})
const latestVersion = computed(() => {
  if (!request.value.capabilities) {
    return null
  }
  let lv = 0
  request.value.capabilities.forEach(c => {
    lv = Math.max(lv, c.version)
  })
  return lv
})
const nextStepsMessage = computed(() => {
  let m = ""
  if (props.vendor_id) {
    if (court.value === "vendor") {
      m = "Customer is waiting for your response"
      if (request.value.status === 2) {
        m = "You have accepted the customer's revision"
      } else if (request.value.status === 3) {
        m = "This order is now active"
      } else if (request.value.status === 4) {
        m = "You have rejected the customer's revision, and this order is closed"
      } else if (request.value.status === 5) {
        m = "This order is archived"
      }
    } else if (court.value === "customer") {
      m = "Awaiting response from customer"
      if (request.value.status === 2) {
        m = "The customer has accepted your revision. You can now deploy this order"
      } else if (request.value.status === 3) {
        m = "This request is active and the order has been deployed"
      } else if (request.value.status === 4) {
        m = "The customer has rejected your revision, and this order is closed"
      } else if (request.value.status === 5) {
        m = "This order is archived"
      }
    }
  } else if (props.customer_id) {
    if (request.value.status === 0) {
      m = "Waiting for Vendor response"
    }
    if (court.value === "customer") {
      m = "Vendor is waiting for your response"
      if (request.value.status === 2) {
        m = "You have accepted the vendor's revision. The Vendor may now deploy this order"
      } else if (request.value.status === 3) {
        m = "This request is active and the order has been deployed"
      } else if (request.value.status === 4) {
        m = "You have rejected the vendor's revision, and this order is closed"
      }
    } else if (court.value === "vendor") {
      m = "Awaiting response from vendor"
      if (request.value.status === 2) {
        m = "The vendor has accepted your revision, and may now deploy the order"
      } else if (request.value.status === 3) {
        m = "This request is active and the order has been deployed"
      } else if (request.value.status === 4) {
        m = "Your vendor has rejected your revision, and this order is closed"
      } else if (request.value.status === 5) {
        m = "This order is archived"
      }
    }
  }

  if (localAcceptanceStatus.value === "accepted") {
    m = "You have accepted this revision"
  } else if (localAcceptanceStatus.value === "rejected") {
    m = "You have rejected this proposal, and the order is now closed"
  }

  return m
})
const nextStepsIcon = computed(() => {
  if (localAcceptanceStatus.value === "accepted" || request.value.status === 2) {
    return "thumb_up"
  } else if (localAcceptanceStatus.value === "rejected" || request.value.status === 4) {
    return "thumb_down"
  } else if (request.value.status === 3) {
    return "check_circle"
  } else if (request.value.status === 5) {
    return "archive"
  }
  return "hourglass_top"
})
const canDeploy = computed(() => props.vendor_id && request.value?.status === 2)
const court = computed(() => latestVersion.value % 2 === 0 ? "customer" : "vendor")
const latestVersionCapabilities = computed(() => {
  const capabilities = []
  const currentVersion = latestVersion.value
  request.value.capabilities.forEach(c => {
    if (c.version === currentVersion) {
      capabilities.push(c)
    }
  })
  return capabilities
})
const cachedCustomerRequestCapabilities = computed(() => store.getters["contract/getCustomerRequestCapabilities"])

watch(request, () => {
  setLocalData()
})

onMounted(() => {
  $q.loading.show()
  getOrganisations(true)
  getRequest()
  setLocalData()
  proposerOrgType.value = props.customer_id ? "Customer" : "Vendor"
})

function getRequest() {
  store.dispatch("contract/customerrequest", props.customer_request_id)
  $q.loading.hide()
}

function getOrganisations(force) {
  if (organisations.value.length < 1 || force) {
    const obj = {
      call: "organisations",
      method: "get"
    }
    store.dispatch("admin/datacallDt", obj)
    $q.loading.hide()
  }
}

function getCapabilities(serviceId) {
  if (!serviceId) return
  store.dispatch("contract/capabilities", serviceId)
  setFirstItem("selectedCapability", capabilities)
  $q.loading.hide()
}

function setFirstItem(prop, a) {
  if (Array.isArray(a) && a.length) {
    this[prop] = a[0].id
  }
}

function setLocalData() {
  localRecord.notes = request.value.notes
  serviceId.value = request.value.service_id
  getCapabilities(serviceId.value)
  if (props.customer_id) {
    canAccept.value = court.value === "customer"
    canNegotiate.value = court.value === "customer"
    canReject.value = request.value.status > 0 && court.value === "customer"
  }
  if (props.vendor_id) {
    if (latestVersion.value % 2 === 0) {
      canAccept.value = false
      canNegotiate.value = false
      canReject.value = false
    } else {
      canAccept.value = true
      canNegotiate.value = true
      canReject.value = true
    }
  }
  if (request.value.status > 1) {
    canAccept.value = false
    canNegotiate.value = false
    canReject.value = false
  }
}

function dispatchCapabilities(data) {
  const obj = {}
  obj.data = data
  obj.data.customer_request_id = props.customer_request_id
  obj.data.notes = localRecord.notes
  obj.data.organisation_id = organisation.value.id
  obj.data.contract_id = contract.value.id
  obj.method = "post"
  obj.call = "customerrequests"
  store.dispatch("admin/datacallDt", obj).then(() => {
    $q.notify({
      message: "Order updated. Status is now " + statuses[obj.data.status],
      position: "top"
    })
    if (obj.data.status === 2) {
      localAcceptanceStatus.value = "accepted"
    } else if (obj.data.status === 3) {
      localAcceptanceStatus.value = "rejected"
    }
    showNewCapabilityForm.value = false
    getRequest()
  }).catch(e => {
    alert(e.data.message || e.statusText)
  })
}

function submitNewCapabilities() {
  const capabilities = JSON.parse(JSON.stringify(cachedCustomerRequestCapabilities.value))

  let proposedByType = "Customer"
  if (props.vendor_id) {
    proposedByType = "Vendor"
  }
  //make sure the capabilities have an incremented version number
  capabilities.forEach(c => {
    c.version = latestVersion.value + 1
    c.proposed_by = proposedByType
  })

  const data = {
    status: 1,
    capabilities: capabilities
  }
  dispatchCapabilities(data)
}

function acceptRequest() {
  const data = {
    status: 2
  }
  dispatchCapabilities(data)
  $q.notify({
    message: "Service Request accepted.",
    position: "top"
  })
}

function negotiateRequest() {
  showNewCapabilityForm.value = true
}

function rejectRequest() {
  const data = {
    status: 4
  }
  dispatchCapabilities(data)
  $q.notify({
    message: "Service Request rejected.",
    position: "top"
  })
}

// only applies to Vendor UI
function redirectToDashboard() {
  showDeployDialogue.value = false
  const path = "/vendor/" + props.vendor_id + "/order-management"
  router.push(path)
}
</script>

<style>
table {
  background-color: white;
  border-collapse: collapse;
}

.infos {
  padding: 2px;
  width: 200px;
  /*background: rgb(2, 0, 36);*/
  /*background: linear-gradient(270deg, rgba(2, 0, 36, 1) 0%, rgba(9, 121, 86, 0.14936396922050066) 0%, rgba(0, 212, 255, 1) 100%);*/
}
</style>
