<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Order Management</div>
      <BreadCrumb v-if="isAuthorised" :organisation="organisation" />
      <div v-if="isAuthorised" class="q-mt-md">
        <div class="text-h6 text-weight-bold text-white">New Request</div>
        <q-form ref="myForm">
          <div class="text-primary q-mb-md row items-center">
            <q-banner v-if="props.vendor_id && !bannerDismissed"
                      inline-actions rounded dense
                      class="bg-primary text-dark q-mt-md full-width">
              <template v-slot:avatar>
                <q-icon name="info" color="dark" />
              </template>
              As a vendor you can place an order on behalf of your customer
              <template v-slot:action>
                <q-btn flat label="Dismiss" @click="bannerDismissed = true" />
              </template>
            </q-banner>
          </div>
          <div class="q-col-gutter-md row">
            <div class="col-xs-12 col-sm-6 col-md-6">
              <new-selector-form
                v-model:option_id="selectedFormElements.organisation"
                :options="organisations"
                :label="formLabels.organisation"
                is-filterable
                filter-key="name"
                :is-emit-value="false"
                default-class="full-width"
                autofocus
              />
              <q-tooltip anchor="top end" self="top end">
                Which {{ otherOrganisationType }} does this order apply to?
              </q-tooltip>
            </div>
            <div v-if="selectedFormElements?.organisation?.id > 0" class="col-xs-12 col-sm-6 col-md-6">
              <new-selector-form
                v-model:option_id="selectedFormElements.contract"
                :options="contracts"
                :label="formLabels.contract"
                is-filterable
                filter-key="reference"
                option-label="reference"
                :is-emit-value="false"
                default-class="full-width"
              />
              <q-tooltip anchor="top end" self="top middle"> Which Contract does this order apply to?</q-tooltip>
            </div>

            <div v-if="selectedFormElements?.contract?.id > 0" class="col-xs-12 col-md-6">
              <new-selector-form
                v-model:option_id="selectedFormElements.service"
                :options="availableServices"
                is-filterable
                filter-key="name"
                :is-emit-value="false"
                :label="formLabels.service"
                default-class="full-width"
                is-option-customisable
                is-selected-option-customisable
              >
                <template v-slot:selected-item="{ option }">
                  <div class="row col">
                    <div class="q-mr-md">{{ option.name }}</div>
                    <div class="text-caption row">
                      <div class="q-mr-sm">{{ option.delivery_model.name }}</div>
                      <div>
                        ({{ option.start_date }} - {{ option.end_date }})
                      </div>
                    </div>
                  </div>
                </template>
                <template v-slot:option="{ option, events }">
                  <q-item v-bind="events" class="q-py-sm">
                    <q-item-section>
                      <q-item-label>{{ option.name }}</q-item-label>
                      <q-item-label caption>
                        {{ option.delivery_model.name }} ({{ option.start_date }} - {{ option.end_date }})
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </new-selector-form>
              <q-tooltip anchor="top end" self="top middle"> Which Service does this order apply to?</q-tooltip>
            </div>

            <div v-if="selectedFormElements?.service?.id > 0" class="col-xs-12 col-md-6">
              <new-selector-form
                v-model:option_id="selectedFormElements.service_line"
                :options="selectedFormElements.service?.service_lines"
                is-filterable
                filter-key="name"
                :label="formLabels.service_line"
                :is-emit-value="false"
                default-class="full-width"
              />
              <q-tooltip anchor="top end" self="top middle"> Which Service Line does this order apply to?</q-tooltip>
            </div>
          </div>

          <customer-requests-capability-form
            v-if="selectedFormElements.service_line?.id > 0"
            :capabilities="selectedFormElements.service.capabilities"
            :max-rows="maxRows"
            :request_capabilities="cachedCustomerRequestCapabilities"
            :service="service"
            order-status="New"
            @cancel="backToList"
          />

          <div v-if="cachedCustomerRequestCapabilities.length" class="q-pb-lg a-pa-lg col-12">
            <q-input
              v-model="selectedFormElements.notes"
              color="primary"
              borderless
              class="q-pa-md-s q-mt-lg"
              columns="80"
              label="Order Notes"
              label-color="white"
              outlined
              rows="2"
              type="textarea"
            />
            <div class="q-my-sm">
              <div v-if="remainingServiceBudget >= 0">
                Placing this order will reduce the remaining service budget to
                {{
                  CurrencyMethods.toCurrencyFormat(organisationDetail.currency.code, remainingServiceBudget)
                }}
                (Excluding pending orders)
              </div>
              <div v-else-if="remainingServiceBudget < 0" class="text-negative">
                Warning, placing this order will breach the service budget by
                {{
                  CurrencyMethods.toCurrencyFormat(organisationDetail.currency.code, -remainingServiceBudget)
                }}
                (Excluding pending orders)
              </div>
              <div v-if="remainingServiceBudgetIncPending >= 0">
                Placing this order will reduce the remaining service budget to
                {{
                  CurrencyMethods.toCurrencyFormat(organisationDetail.currency.code, remainingServiceBudgetIncPending)
                }} (Including pending orders)
              </div>
              <div v-else-if="remainingServiceBudgetIncPending < 0" class="text-negative">
                Warning, placing this order will breach the service budget by
                {{
                  CurrencyMethods.toCurrencyFormat(organisationDetail.currency.code, -remainingServiceBudgetIncPending)
                }} (Including pending orders)
              </div>
            </div>
            <br />
            <q-btn
              :disable="!allowSave"
              class="col-lg-12 col-xs-12 col-sm-12 col-md-12"
              color="primary"
              text-color="dark"
              label="Place Order"
              size="md"
              @click="saveRequest"
            />
          </div>
        </q-form>
      </div>
      <div v-else>You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "NewServiceRequest",
  inheritAttrs: false
}
</script>

<script setup>
import { useQuasar } from "quasar"
import { computed, onMounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import { ClassCombinations } from "src/modules/StaticData.js"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"
import { vendorAuth, customerAuth } from "src/modules/AuthLogic.js"
import CustomerRequestsCapabilityForm from "components/CustomerRequestsCapabilityForm.vue"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

const $q = useQuasar()
const store = useStore()
const router = useRouter()

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null }
})

const bannerDismissed = ref(false)
const selectedFormElements = ref({
  organisation: null,
  contract: null,
  service: null,
  service_line: null,
  capabilities: [],
  notes: ""
})
const organisationType = ref(null)
const otherOrganisationType = ref(null)
const pendingBudget = ref(0)

let organisation
let isAuthorised
if (props.vendor_id) {
  organisation = vendorAuth(props.vendor_id).vendor
  isAuthorised = vendorAuth(props.vendor_id).isAuthorised
} else if (props.customer_id) {
  organisation = customerAuth(props.customer_id).customer
  isAuthorised = customerAuth(props.customer_id).isAuthorised
}

const organisationDetail = computed(() => store.getters["admin/getOrganisation"])
//restrict available services to CL or SP. SOW and WP do not require a Customer Request
const availableServices = computed(() => {
  const a = []
  if (selectedFormElements.value.contract && selectedFormElements.value.contract.services) {
    selectedFormElements.value.contract.services.forEach(service => {
      if (service.delivery_model_id === 1 || service.delivery_model_id === 2) {
        a.push(service)
      }
    })
  }
  return a
})
const maxRows = computed(() => {
  if (selectedFormElements.value.service && selectedFormElements.value.service.delivery_model_id === 1) {
    return 1
  }
  return 1000
})
const service = computed(() => {
  return selectedFormElements.value.service ? selectedFormElements.value.service : undefined
})
const existingRequestsBudget = computed(() => {
  let cost = 0
  if (service.value.requests && service.value.requests.length) {
    service.value.requests.forEach(request => {
      cost += Number(request.budget)
    })
  }
  return cost
})
const orderManagementLink = computed(() => {
  return "/" + organisationType.value + "/" + (props.vendor_id ?? props.customer_id) + "/order-management"
})
const cachedCustomerRequestBudget = computed(() => {
  let cost = 0
  if (cachedCustomerRequestCapabilities.value && cachedCustomerRequestCapabilities.value.length) {
    cachedCustomerRequestCapabilities.value.forEach(item => {
      cost += Number(item.budget)
    })
  }
  return cost
})
const remainingServiceBudget = computed(() => {
  let b = 0
  if (service.value) {
    b = Number(service.value.value)
    b -= existingRequestsBudget.value
    b -= cachedCustomerRequestBudget.value
  }
  return b
})
const remainingServiceBudgetIncPending = computed(() => {
  return remainingServiceBudget.value - pendingBudget.value
})
const cachedCustomerRequestCapabilities = computed(() => store.getters["contract/getCustomerRequestCapabilities"])
const organisations = computed(() => store.getters["common/getOrganisations"])
const allContracts = computed(() => store.getters["contract/getOrganisationContracts"](organisation.value.id))
const contracts = computed(() => {
  const c = []
  if (allContracts.value.length) {
    if (selectedFormElements.value.organisation) {
      allContracts.value.forEach(contract => {
        if (props.vendor_id && contract.customer_id === selectedFormElements.value.organisation.id) {
          c.push(contract)
        } else if (props.customer_id && contract.vendor_id === selectedFormElements.value.organisation.id) {
          c.push(contract)
        }
      })
    }
  }
  return c
})
const allowSave = computed(() => cachedCustomerRequestCapabilities.value.length > 0)
const formLabels = computed(() => {
  return {
    organisation:
      selectedFormElements.value.organisation === null
        ? "Select " + otherOrganisationType.value
        : otherOrganisationType.value,
    contract: selectedFormElements.value.contract === null ? "Select Contract" : "Contract",
    service: selectedFormElements.value.service === null ? "Select Service" : "Service",
    service_line: selectedFormElements.value.service_line === null ? "Select Service Line" : "Service Line"
  }
})

watch(service, val => {
  if (val && val.id) {
    getPendingOrders()
  }
})
watch(() => selectedFormElements.value.organisation, newVal => {
  organisationSelected(newVal)
})
watch(() => selectedFormElements.value.contract, () => {
  contractSelected()
})
watch(() => selectedFormElements.value.service, () => {
  serviceSelected()
})

onMounted(() => {
  store.commit("auth/setBadge", props.vendor_id ? "vendor" : "customer")
  // store.dispatch("vendor/getServiceAlertStatuses")
  getOrganisations()
  organisationType.value = props.customer_id ? "customer" : "vendor"
  otherOrganisationType.value = !props.customer_id ? "Customer" : "Vendor"
})

//Budget for orders not yet deployed

function getPendingOrders() {
  store.dispatch("common/pendingCustomerRequestsByService", service.value.id).then(res => {
    let budget = 0
    if (res && res.length > 0) {
      res.forEach(order => {
        if (order.capabilities && order.capabilities.length) {
          order.capabilities.forEach(capability => {
            budget += capability.budget
          })
        }
      })
    }
    pendingBudget.value = budget
  })
}

//TODO need to update so it gets all contracts for that Vendor
/*
const contracts = computed(() => {
  return store.getters["contract/getContracts"]
})
*/

function getOrganisations() {
  const querystring = props.vendor_id
    ? "filter[customersOf]=" + props.vendor_id
    : "filter[vendorsOf]=" + props.customer_id
  store.dispatch("common/getOrganisations", querystring)
}

//NOTE THIS API CALL ONLY GETS CONTRACTS THAT THE USER HAS ACCESS TO AND THAT THE ORGANISATION OWNS
//FOR THE PURPOSE OF REQUESTING AN ORDER, IT DOESN'T MATTER IF THE ORG OWNS THE CONTRACT
/*
function getContracts() {
  const obj = {}
  if (organisationType.value === "vendor") {
    obj.vendorId = props.vendor_id
    obj.filter = "filter[customer_id]=" + selectedFormElements.value.organisation.id
  } else {
    obj.customerId = props.customer_id
    obj.filter = "filter[vendor_id]=" + selectedFormElements.value.organisation.id
  }
  obj.include =
    "services.requests.consultant_engagements.consultant,vendor,customer,services.delivery_model,services.requests,services.service_lines,customer_contract_owner,vendor_contract_owner,services.capabilities"
  store.dispatch("contract/viewContracts", obj)
}
*/

function getContracts() {
  const obj = {}
  if (props.vendor_id) {
    obj.vendorId = props.vendor_id
  } else if (props.customer_id) {
    obj.customerId = props.customer_id
  }
  store.dispatch("contract/organisationContracts", obj).then(() => {
    $q.loading.hide()
  })
}

function organisationSelected() {
  selectedFormElements.value.contract = null
  selectedFormElements.value.service = null
  selectedFormElements.value.service_line = null
  getContracts()
}

function contractSelected() {
  selectedFormElements.value.service = null
  selectedFormElements.value.service_line = null
}

function serviceSelected() {
  resetCapabilities()
}

function resetCapabilities() {
  store.commit("contract/setCustomerRequestCapabilities", [])
}

function objectToFormData(obj, formData = new FormData(), parentKey = "") {
  if (obj && typeof obj === "object" && !(obj instanceof File)) {
    Object.keys(obj).forEach(key => {
      const value = obj[key]
      const fullKey = parentKey ? `${parentKey}[${key}]` : key

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          objectToFormData(item, formData, `${fullKey}[${index}]`)
        })
      } else {
        objectToFormData(value, formData, fullKey)
      }
    })
  } else {
    formData.append(parentKey, obj ?? "")
  }
  return formData
}

function saveRequest() {

  let formData = new FormData()
  formData.append("contract_id", selectedFormElements.value.contract?.id)
  formData.append("service_id", selectedFormElements.value.service?.id)
  formData.append("service_line_id", selectedFormElements.value.service_line?.id)
  formData.append("notes", selectedFormElements.value.notes)
  formData.append("start_date", "")
  formData.append("end_date", "")
  formData.append("organisation_id", organisation.value.id);
  // formData.append("capabilities", cachedCustomerRequestCapabilities.value)

  (cachedCustomerRequestCapabilities.value ?? []).forEach((customerRequestCapabilities, index) => {
    formData = objectToFormData(customerRequestCapabilities, formData, `capabilities[${index}]`);
  });

  const obj = {
    data: formData,
    call: "customerrequests"
  }
  obj.method = "post"

  store.dispatch("admin/datacallDt", obj).then(() => {
    if (props.customer_id) {
      $q.notify({
        message: "Thank you, your new order has been created",
        position: "top"
      })
      router.push({ path: "/customer/" + props.customer_id + "/order-management/open" })
    }
    if (props.vendor_id) {
      $q.notify({
        message: "Thank you, you have created a new order on behalf of your customer",
        position: "top"
      })
      router.push({ path: "/vendor/" + props.vendor_id + "/order-management/open" })
    }
  }).catch(e => {
    alert(e.data.message || e.statusText)
  })
}

function onRequestNewService() {
  alert("onward router to a new service request page!")
}

function backToList() {
  router.push({ path: orderManagementLink.value })
}
</script>

<style scoped>
table {
  border: 1px solid #1c6eaa;
  background-color: white;
  border-collapse: collapse;
  padding: 100px;
}
</style>
