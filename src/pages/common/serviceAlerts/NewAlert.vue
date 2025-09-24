<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">New Service Alert</div>
      <BreadCrumb align="center" :organisation="organisation" v-if="isAuthorised" />
      <div v-if="isAuthorised && contracts.length > 0" class="column q-mt-lg">
        <q-form class="q-col-gutter-md row items-center" @reset="onResetForm" @submit="onSubmit">
          <div class="col-12">Select Service Alert Criteria</div>
          <new-selector-form
            v-if="props.vendor_id"
            v-model:option_id="selectedCustomer"
            :options="customers"
            classes="col-12 col-md-6 col-lg-4"
            label="Buyer"
            is-filterable
            filter-key="name"
            default-class="full-width"
            autofocus
          />
          <new-selector-form
            v-if="props.customer_id"
            v-model:option_id="selectedVendor"
            :options="vendors"
            classes="col-12 col-md-6 col-lg-4"
            label="Vendor"
            is-filterable
            filter-key="name"
            default-class="full-width"
            autofocus
          />
          <new-selector-form
            v-model:option_id="selectedContract"
            :options="contracts"
            classes="col-12 col-md-6 col-lg-4"
            label="Contract"
            is-filterable
            filter-key="reference"
            option-label="reference"
            default-class="full-width"
          />
          <new-selector-form
            v-model:option_id="selectedProject"
            :options="projects"
            classes="col-12 col-md-6 col-lg-4"
            label="Project"
            is-filterable
            filter-key="name"
            default-class="full-width"
          />
          <new-selector-form
            v-model:option_id="selectedService"
            :options="services"
            classes="col-12 col-md-6 col-lg-4"
            label="Service"
            is-filterable
            filter-key="name"
            default-class="full-width"
            is-option-customisable
          >
            <template v-slot:option="{ option, events }">
              <q-item v-bind="events">
                <q-item-section>
                  {{ option.name }}
                  <sub>{{ option.delivery_model.name }}</sub>
                </q-item-section>
              </q-item>
            </template>
          </new-selector-form>
          <new-selector-form
            v-if="selectedConsultantVisible"
            v-model:option_id="selectedConsultant"
            :options="consultants"
            classes="col-12 col-md-6 col-lg-4"
            :label="OrganisationTypeMethods.changeConsultant(isBuiltEnvironment)"
            is-filterable
            filter-key="name"
            default-class="full-width"
          />
          <new-selector-form
            v-if="selectedServiceLineVisible"
            v-model:option_id="selectedServiceLine"
            :options="serviceLines"
            classes="col-12 col-md-6 col-lg-4"
            label="Service Line"
            is-filterable
            filter-key="name"
            default-class="full-width"
          />
          <q-input
            v-model="serviceAlert.description"
            class="q-pb-sm col-12"
            columns="80"
            label-color="white"
            stack-label
            color="primary"
            filled
            label="Description"
            rows="4"
            type="textarea"
          />
          <div>
            <q-btn
              :disable="!canSubmit"
              :loading="submitting"
              color="primary"
              text-color="dark"
              label="Submit"
              type="submit"
            >
              <template v-slot:loading>
                <q-spinner-pie />
              </template>
            </q-btn>
            <q-btn :loading="closing" class="q-ml-sm" color="white" outline label="Return" @click.stop="close">
              <template v-slot:loading>
                <q-spinner-box />
              </template>
            </q-btn>
          </div>
        </q-form>
      </div>
      <div v-else class="hidden q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "NewServiceAlert",
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup>
import { useQuasar } from "quasar"
import { computed, onMounted, watch, ref } from "vue"
import { useStore } from "vuex"
import { useRoute, useRouter } from "vue-router"
import { ClassCombinations } from "src/modules/StaticData.js"
import { vendorAuth, customerAuth } from "src/modules/AuthLogic.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

const $q = useQuasar()
const store = useStore()
const route = useRoute()
const router = useRouter()

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null }
})

const organisationType = ref(null)
const organisationId = ref(null)
const otherOrganisationType = ref(null)
const otherOrganisationLabel = ref(null)
const submitting = ref(false)
const resetting = ref(false)
const closing = ref(false)
const loading = ref(["mount"])
const routeParams = ref({
  customerId: null,
  contractId: null,
  projectId: null,
  serviceId: null
})
const selectedCustomer = ref(false)
const selectedVendor = ref(false)
const selectedContract = ref(false)
const selectedProject = ref(false)
const selectedService = ref(false)
const selectedServiceLine = ref(0)
const selectedConsultant = ref(0)
const serviceAlert = ref({
  id: null,
  customer_id: null,
  vendor_id: null,
  contract_id: null,
  service_id: null,
  request_id: null,
  service_line_id: null,
  engagement_id: null,
  consultant_id: null,
  description: "",
  status_id: 1,
  organisation_id: 0
})

//NOTE: Optimised snippet of code
let organisation
let isAuthorised
if (props.vendor_id) {
  const obj = vendorAuth(props.vendor_id)
  organisation = obj.vendor
  isAuthorised = obj.isAuthorised
} else if (props.customer_id) {
  const obj = customerAuth(props.customer_id)
  organisation = obj.customer
  isAuthorised = obj.isAuthorised
}

onMounted(() => {
  if (props.vendor_id) {
    organisationType.value = "vendor"
    otherOrganisationType.value = "Customer"
    organisationId.value = props.vendor_id
  } else if (props.customer_id) {
    organisationType.value = "customer"
    otherOrganisationType.value = "Vendor"
    organisationId.value = props.customer_id
  }
  otherOrganisationLabel.value = "Select " + otherOrganisationType.value

  // If there is a service_id param use it to init the selects
  routeParams.value = {
    customerId: route.query.customer_id ? parseInt(route.query.customer_id) : null,
    contractId: route.query.contract_id ? parseInt(route.query.contract_id) : null,
    projectId: route.query.project_id ? parseInt(route.query.project_id) : null,
    serviceId: route.query.service_id ? parseInt(route.query.service_id) : null
  }

  onResetForm()
  getOrganisationContracts()
  loader("mount", "remove")
})

const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const consultants = computed(() => {
  const d = { id: 0, name: "n/a" }
  const c = store.getters["common/getServiceConsultantEngagements"]
  return [d, ...c]
})
const projects = computed(() => {
  const contract = contracts.value.find(contract => contract.id === selectedContract.value)
  const p = []
  p.push({ id: null, request_id: null, name: "No Specified Project" })
  if (contract && contract.projects && contract.projects.length) {
    contract.projects.forEach(project => {
      p.push({ id: project.id, name: project.name })
    })
  }

  return p
})
const customers = computed(() => {
  const c = []
  const ids = []
  allOrganisationContracts.value.forEach(contract => {
    const customer = contract.customer
    if (!ids[customer.id]) {
      c.push({ id: customer.id, name: customer.name })
    }
    ids[customer.id] = 1
  })
  return c
})
const vendors = computed(() => {
  const c = []
  const ids = []
  allOrganisationContracts.value.forEach(contract => {
    const vendor = contract.vendor
    if (!ids[vendor.id]) {
      c.push({ id: vendor.id, name: vendor.name })
    }
    ids[vendor.id] = 1
  })
  return c
})
const allOrganisationContracts = computed(() => {
  return store.getters["contract/getOrganisationContracts"](parseInt(organisationId.value))
})
const contracts = computed(() => {
  let cs = []
  if (props.customer_id) {
    if (selectedVendor.value !== false) {
      cs = allOrganisationContracts.value.filter(contract => parseInt(contract.vendor_id) === parseInt(selectedVendor.value))
    }
  }
  if (props.vendor_id) {
    if (selectedCustomer.value !== false) {
      cs = allOrganisationContracts.value.filter(contract => parseInt(contract.customer_id) === parseInt(selectedCustomer.value))
    }
  }
  return cs
})
const services = computed(() => {
  let cs = []
  if (selectedContract.value !== false) {
    const s = contracts.value.find(contract => contract.id === selectedContract.value)
    cs = s?.services ?? []
  }
  return cs
})
const serviceLines = computed(() => {
  let sl = []
  if (selectedService.value !== false) {
    if (services.value.length) {
      const s = services.value.find(service => service.id === selectedService.value)
      if (s.delivery_model_id === 2) {
        sl = s.service_lines ? s.service_lines : []
      }
    }
  }
  return sl
})
const selectedServiceRecord = computed(() => {
  let ss = {}
  if (selectedService.value !== false) {
    ss = services.value.find(service => service.id === selectedService.value)
  }
  return ss
})
const selectedConsultantRecord = computed(() => {
  let c = {}
  if (selectedConsultant.value !== false) {
    c = consultants.value.find(consultant => consultant.id === selectedConsultant.value)
  }
  return c
})
const serviceAlertLink = computed(() => {
  return "/" + organisationType.value + "/" + organisationId.value + "/service-management/service-alerts"
})
const selectedServiceLineVisible = computed(() => {
  return (
    selectedServiceRecord.value &&
    selectedServiceRecord.value.delivery_model &&
    selectedServiceRecord.value.delivery_model.name === "Professional Services"
  )
})
const selectedConsultantVisible = computed(() => {
  return (
    selectedServiceRecord.value &&
    selectedServiceRecord.value.delivery_model &&
    selectedServiceRecord.value.delivery_model.name === "Contingent Labour"
  )
})
const canSubmit = computed(() => !!serviceAlert.value.description)

watch(customers, newVal => {
  if (routeParams.value?.customerId && newVal.filter(val => val.id === routeParams.value?.customerId).length > 0) {
    selectedCustomer.value = routeParams.value?.customerId || false
  } else {
    setFirstItem(selectedCustomer, newVal)
  }
})
watch(vendors, newVal => {
  setFirstItem(selectedVendor, newVal)
})
watch(contracts, newVal => {
  if (routeParams.value?.contractId && newVal.filter(val => val.id === routeParams.value?.contractId).length > 0) {
    selectedContract.value = routeParams.value?.contractId || false
  } else {
    setFirstItem(selectedContract, newVal)
  }
})
watch(services, newVal => {
  if (routeParams.value?.serviceId && newVal.filter(val => val.id === routeParams.value?.serviceId).length > 0) {
    selectedService.value = routeParams.value?.serviceId || false
  } else {
    setFirstItem(selectedService, newVal)
  }
})
watch(consultants, newVal => {
  setFirstItem(selectedConsultant, newVal)
})
watch(serviceLines, newVal => {
  setFirstItem(selectedServiceLine, newVal)
})
watch(projects, newVal => {
  if (routeParams.value?.projectId && newVal.filter(val => val.id === routeParams.value?.projectId).length > 0) {
    selectedProject.value = routeParams.value?.projectId || false
  } else {
    setFirstItem(selectedProject, newVal)
  }
})
watch(selectedConsultantVisible, newVal => {
  if (newVal) {
    //we need to load the consultants engaged on this service
    store.dispatch("common/getServiceConsultantEngagements", selectedService.value)
  }
})

watch(loading, newVal => {
  if (newVal.length > 0) {
    $q.loading.show()
  } else {
    $q.loading.hide()
  }
})

function loader(module, type = "add") {
  if (type === "add") {
    loading.value.push(module)
    loading.value = [...new Set(loading.value)]
  } else {
    loading.value = loading.value.filter(val => val !== module)
  }
}

function setFirstItem(dataVar, a) {
  if (a.length) {
    dataVar.value = a[0].id
  } else {
    dataVar.value = undefined
  }
}

function getOrganisationContracts() {
  loader("orgContract")
  const obj = {}
  if (organisationType.value === "vendor") {
    obj.vendorId = props.vendor_id
  } else {
    obj.customerId = props.customer_id
  }
  obj.include = "services,vendor,customer,services.delivery_model,services.service_lines,customer_contract_owner,vendor_contract_owner"
  store.dispatch("contract/organisationContracts", obj).then(() => {
    //store.dispatch("common/getServiceContractView")
    loader("orgContract", "remove")
  }).catch(e => {
    $q.notify({
      color: "red-4",
      textColor: "white",
      icon: "cloud_done",
      message: e
    })
    loader("orgContract", "remove")
  })
}

function setValuesForSubmit() {
  // all are q-selects - other values are directly linked to serviceAlert
  serviceAlert.value.service_id = selectedService.value
  serviceAlert.value.project_id = selectedProject.value
  serviceAlert.value.request_id = selectedConsultantRecord.value?.request_id
    ? selectedConsultantRecord.value.request_id
    : null
  serviceAlert.value.service_line_id = selectedServiceLineVisible.value ? selectedServiceLine.value : null
  serviceAlert.value.engagement_id = selectedConsultantRecord.value?.id ? selectedConsultant.value : null
  serviceAlert.value.organisation_id = organisationId.value
}

function onSubmit() {
  submitting.value = true
  setValuesForSubmit()
  store.dispatch("common/createServiceAlert", serviceAlert.value).then(() => {
    $q.notify({
      color: "green-4",
      textColor: "white",
      icon: "cloud_done",
      message: "Submitted"
    })
    setTimeout(() => {
      submitting.value = false
      router.go(-1)
    }, 1000)
  }).catch(e => {
    $q.notify({
      color: "red-4",
      textColor: "white",
      icon: "cloud_done",
      message: e
    })
  })
}

function onResetForm() {
  resetting.value = true
  serviceAlert.value = {
    id: null,
    customer_id: null,
    vendor_id: null,
    contract_id: null,
    service_id: null,
    request_id: null,
    service_line_id: null,
    engagement_id: null,
    consultant_id: null,
    description: "",
    status_id: 1,
    organisation_id: organisationId.value
  }
  setTimeout(() => {
    resetting.value = false
  }, 500)
}

function close() {
  closing.value = true
  setTimeout(() => {
    closing.value = false
    router.push({ path: serviceAlertLink.value })
  }, 400)
}
</script>
