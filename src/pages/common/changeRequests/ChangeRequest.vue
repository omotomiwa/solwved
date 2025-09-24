<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Change Request</div>
      <BreadCrumb align="center" :organisation="organisation" v-if="organisation" />

      <div v-if="isAuthorised && contractOptions.length > 0" class="column q-mt-lg">
        <div class="row items-center">
          <q-form @submit="onSubmit" @reset="onReset" class="col q-col-gutter-sm">
            <q-splitter
              v-model="splitter.span"
              :limits="splitter.limit"
              :disable="splitter.disabled"
              :separator-class="splitter.disabled ? 'bg-transparent' : 'bg-primary'"
              separator-style="width: 3px">
              <template v-slot:before>
                <div class="q-pa-md">
                  <div v-if="allowEdit">
                    <div class="q-mb-md">What do you want to change?</div>
                    <div class="row q-col-gutter-sm q-mb-sm">
                      <new-selector-form
                        v-if="props.vendor_id"
                        v-model:option_id="selectedCustomer"
                        classes="col-12 col-md-6 col-lg-4"
                        :options="customers"
                        is-filterable
                        filter-key="name"
                        label="Customer"
                        default-class="full-width"
                        autofocus
                      />
                      <new-selector-form
                        v-if="props.customer_id"
                        v-model:option_id="selectedVendor"
                        classes="col-12 col-md-6 col-lg-4"
                        :options="vendors"
                        is-filterable
                        filter-key="name"
                        label="Vendor"
                        default-class="full-width"
                        autofocus
                      />
                      <new-selector-form
                        v-model:option_id="selectedContract"
                        classes="col-12 col-md-6 col-lg-4"
                        :options="contractOptions"
                        is-filterable
                        filter-key="reference"
                        option-label="reference"
                        label="Contract"
                        default-class="full-width"
                      />
                      <new-selector-form
                        v-if="changeRequestType === 'service'"
                        v-model:option_id="selectedService"
                        classes="col-12 col-md-6 col-lg-4"
                        :options="services"
                        is-filterable
                        filter-key="name"
                        label="Service"
                        default-class="full-width"
                        is-option-customisable
                      >
                        <template v-slot:option="{option, events}">
                          <q-item v-bind="events">
                            <q-item-section>
                              {{ option.name }}
                              <sub class="text-blue-grey">{{ option.delivery_model.name }}</sub>
                            </q-item-section>
                          </q-item>
                        </template>
                      </new-selector-form>
                      <new-selector-form
                        v-if="changeRequestType === 'service' && selectedCapabilityVisible"
                        v-model:option_id="selectedCapability"
                        classes="col-12 col-md-6 col-lg-4"
                        :options="capabilities"
                        is-filterable
                        filter-key="name"
                        label="Capability"
                        default-class="full-width"
                      />
                    </div>
                  </div>
                  <div v-if="allowEdit" class="row q-col-gutter-sm">
                    <q-input
                      v-model="changeRequest.title"
                      :disable="!allowEdit"
                      filled
                      label-color="white"
                      color="primary"
                      stack-label
                      type="textarea"
                      label="Title"
                      rows="1"
                      columns="80"
                      class="col-12"
                      autofocus
                    />
                    <q-input
                      v-model="changeRequest.description"
                      :disable="!allowEdit"
                      filled
                      type="textarea"
                      label="Description"
                      label-color="white"
                      color="primary"
                      stack-label
                      rows="4"
                      columns="80"
                      class="col-12"
                    />

                    <div>
                      <q-btn
                        label="Submit"
                        type="submit"
                        color="primary"
                        text-color="dark"
                        :loading="isSubmittingData"
                        :disable="!canSubmit"
                      >
                        <template v-slot:loading>
                          <q-spinner-pie />
                        </template>
                      </q-btn>
                      <q-btn
                        label="Back"
                        class="q-ml-sm"
                        color="white"
                        outline
                        :loading="isClosing"
                        @click.stop="close"
                      >
                        <template v-slot:loading>
                          <q-spinner-box />
                        </template>
                      </q-btn>
                    </div>
                  </div>
                  <div v-else>
                    <table style="width: 100%" class="table-info">
                      <tbody>
                      <tr v-if="organisationType === 'vendor'">
                        <td class="infos">Customer</td>
                        <td>{{ getLabels("customerName") }}</td>
                      </tr>
                      <tr v-if="organisationType === 'customer'">
                        <td class="infos">Vendor</td>
                        <td>{{ getLabels("vendorName") }}</td>
                      </tr>
                      <template v-if="changeRequestStore">
                        <tr>
                          <td class="infos">Contract</td>
                          <td>{{ getLabels("contractReference") }}</td>
                        </tr>
                        <template v-if="changeRequestType === 'service'">
                          <tr>
                            <td class="infos">Service</td>
                            <td>{{ changeRequestStore?.service?.name ?? "-" }}</td>
                          </tr>
                          <tr>
                            <td class="infos">Capability</td>
                            <td>{{ changeRequestStore?.capability?.name ?? "-" }}</td>
                          </tr>
                        </template>
                        <tr>
                          <td colspan="2">
                            <q-separator class="q-my-sm" />
                          </td>
                        </tr>
                        <tr>
                          <td class="infos">Title</td>
                          <td>
                            <text-with-show-more :text="changeRequestStore?.title ?? '-'" />
                          </td>
                        </tr>
                        <tr>
                          <td class="infos">Description</td>
                          <td>
                            <text-with-show-more :text="changeRequestStore?.description ?? '-'" />
                          </td>
                        </tr>
                        <tr>
                          <td class="infos">Status</td>
                          <td>
                            <q-chip square color="primary" text-color="dark">
                              {{
                                changeRequestStore?.status?.name ?
                                  StringMethods.ucfirst(changeRequestStore?.status?.name) :
                                  "-"
                              }}
                            </q-chip>
                          </td>
                        </tr>
                      </template>
                      </tbody>
                    </table>
                  </div>
                </div>
              </template>
              <template v-slot:separator v-if="!splitter.disabled">
                <q-avatar color="primary" text-color="dark" size="28px" title="Move to resize" icon="drag_indicator" />
              </template>
              <template v-slot:after>
                <div class="q-pa-md">
                  <div v-if="allowEditExtra || allowViewExtra">
                    <q-virtual-scroll
                      ref="virtualListRef"
                      style="max-height: 60vh"
                      :virtual-scroll-slice-size="10"
                      :virtual-scroll-slice-ratio-before="10"
                      :items="(changeRequestStore?.notes ?? [])"
                    >
                      <template v-slot:before>
                        <q-chat-message class="q-py-xl" v-if="(changeRequestStore?.notes ?? []).length === 0"
                                        label="No message found" />
                      </template>
                      <template v-slot="{ item: note, index }">
                        <message-with-skeleton
                          :key="note?.id"
                          class="q-ma-md"
                          :note="note"
                          :index="index"
                          :send="note?.is_from_vendor"
                        />
                      </template>
                      <template v-slot:after>
                        <div class="q-ma-none q-pa-md sticky-bottom">
                          <div class="scroll-to-bottom">
                            <q-btn
                              v-if="showScrollToBottomBtn"
                              rounded
                              no-caps
                              no-wrap
                              class="scroll-to-bottom-btn"
                              color="primary"
                              text-color="dark"
                              size="sm"
                              @click="scrollToChatBottom"
                            >
                              <q-icon name="keyboard_arrow_down" size="sm" />
                              Jump to bottom
                            </q-btn>
                          </div>
                          <q-input
                            v-if="!isNewChangeRequest"
                            v-model="changeRequest.note"
                            class="q-pt-sm"
                            label-color="white"
                            color="primary"
                            label="Type a new message"
                            type="textarea"
                            filled
                            autogrow
                            dense
                            stack-label
                            input-style="max-height: 100px"
                          />
                          <div v-if="!isNewChangeRequest && (allowEditExtra || allowViewExtra)"
                               class="q-my-xs q-py-sm rounded-borders"
                               :class="$q.dark.isActive ? 'field-bg-dark' : 'field-bg-light'"
                          >
                            <span class="q-mx-sm q-mb-xs text-caption">Status</span>
                            <q-btn-toggle
                              v-model="changeRequest.status_id"
                              :disable="!allowEditExtra"
                              :options="newstatuses"
                              class="q-mx-sm"
                              color="grey-5"
                              text-color="dark"
                              toggle-color="primary"
                              toggle-text-color="dark"
                              push glossy dense
                            />
                          </div>
                          <p v-if="!isNewChangeRequest" class="text-caption">
                            NB if you are updating the status, you must also include a note before submitting.
                          </p>
                          <div>
                            <div v-if="!isNewChangeRequest && (allowEditExtra || allowViewExtra)"
                                 class="row q-gutter-sm">
                              <q-btn
                                label="Submit"
                                :loading="isSubmittingData"
                                :disable="!canSubmit"
                                type="submit"
                                color="primary"
                                text-color="dark"
                              >
                                <template v-slot:loading>
                                  <q-spinner-pie />
                                </template>
                              </q-btn>
                              <q-btn
                                label="Back"
                                :loading="isClosing"
                                @click.stop="close"
                                color="white"
                                outline
                              >
                                <template v-slot:loading>
                                  <q-spinner-box />
                                </template>
                              </q-btn>
                            </div>
                          </div>
                        </div>
                        <q-scroll-observer @scroll="scrollHandler" />
                      </template>
                    </q-virtual-scroll>
                  </div>
                </div>
              </template>
            </q-splitter>
          </q-form>
        </div>
      </div>
      <div v-else class="text-blue-grey q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "ChangeRequest",
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup>
import { QChatMessage, useQuasar } from "quasar"
import { computed, onMounted, onUnmounted, watch, ref, nextTick } from "vue"
import { useStore } from "vuex"
import { useRoute, useRouter } from "vue-router"
import { ClassCombinations } from "src/modules/StaticData.js"
import { StringMethods } from "src/modules/GlobalMethods.js"
import { vendorAuth, customerAuth } from "src/modules/AuthLogic.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"
import MessageWithSkeleton from "components/common/chat/MessageWithSkeleton.vue"
import TextWithShowMore from "components/common/text/TextWithShowMore.vue"

const $q = useQuasar()
const store = useStore()
const route = useRoute()
const router = useRouter()

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null },
  change_request_id: { type: String, default: null },
  changeRequestType: { type: String, default: "service" }
})

const emit = defineEmits(["update", "close"])

let files = []
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

const isSubmittingData = ref(false)
const isResetting = ref(false)
const isClosing = ref(false)
const virtualListRef = ref(null)
const showScrollToBottomBtn = ref(false)
const splitter = ref({
  span: 50,
  disabled: false,
  limit: [40, 60]
})
const selectedCustomer = ref(null)
const selectedVendor = ref(null)
const selectedContract = ref(null)
const selectedService = ref(null)
const selectedCapability = ref(null)
const allowEdit = ref(true)
const allowEditExtra = ref(false)
const allowViewExtra = ref(true)
const changeType = ref("Change Request")
const syncStatus = ref(false)
const changeRequest = ref({
  change_request_id: null,
  model_id: null,
  model: "",
  title: "",
  description: "",
  json: "",
  status_id: 1,
  capability_id: null,
  note: ""
})
const routeParams = ref({
  customerId: null,
  contractId: null,
  projectId: null,
  serviceId: null
})
const loading = ref(["mount"])

const organisationType = computed(() => props.customer_id ? "customer" : "vendor")
const organisationId = computed(() => props.customer_id ? props.customer_id : props.vendor_id)
const isNewChangeRequest = computed(() => props.change_request_id === "new")
const selectors = computed(() => store.getters["common/getSelectors"])
const changeRequestStore = computed(() => store.getters["common/getChangeRequest"])
const serviceContractView = computed(() => store.getters["common/getServiceContractView"])
const statuses = computed(() => selectors.value.statuses)
const newstatuses = computed(() => {
  const ns = []
  if (statuses.value && statuses.value.length) {
    statuses.value.forEach(s => {
      ns.push({ value: s.id, label: s.name })
    })
  }
  return ns
})
const canSubmit = computed(() => {
  if (!isNewChangeRequest.value) {
    return !!changeRequest.value.note
  }
  return !!(changeRequest.value.title && changeRequest.value.description)
})
const capabilities = computed(() => {
  const service = services.value.find(service => service.id === selectedService.value)
  const cappa = []
  cappa.push({ id: null, name: "No Specified Capability" })
  service.capabilities?.forEach(cev => {
    cappa.push({ id: cev.id, name: cev.name })
  })
  return cappa
})
const allOrganisationContracts = computed(() => {
  return store.getters["contract/getOrganisationContracts"](parseInt(organisationId.value))
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
const contractOptions = computed(() => {
  const cs = []
  if (props.customer_id) {
    if (selectedVendor.value) {
      const c = allOrganisationContracts.value.find(contract => contract.vendor_id === selectedVendor.value)
      cs.push(c)
    }
  }
  if (props.vendor_id) {
    if (selectedCustomer.value) {
      const c = allOrganisationContracts.value.find(contract => contract.customer_id === selectedCustomer.value)
      cs.push(c)
    }
  }
  return cs
})
const services = computed(() => {
  let cs = []

  if (selectedContract.value) {
    const s = contractOptions.value.find(contract => contract.id === selectedContract.value)
    cs = s.services
  }
  return cs
})
const selectedServiceRecord = computed(() => {
  let ss = {}
  if (selectedService.value) {
    ss = services.value.find(service => service.id === selectedService.value)
  }
  return ss
})
const changeRequestLink = computed(() => {
  return props.changeRequestType === "service"
    ? "/" + organisationType.value + "/" + organisation.value.id + "/service-management/change-requests"
    : "/" + organisationType.value + "/" + organisation.value.id + "/service-management/contract-change-requests"
})
const selectedCapabilityVisible = computed(() => {
  return selectedServiceRecord.value && selectedServiceRecord.value?.delivery_model?.name === "Contingent Labour"
})

onMounted(() => {
  store.dispatch(
    "common/getSelectors",
    { model: "changerequests" }
  )

  // The type is either service or contract
  if (props.changeRequestType === "contract") {
    changeType.value = "Contract " + changeType.value
  }

  // If there is a service_id param use it to init the selects
  routeParams.value = {
    customerId: route.query.customer_id ? parseInt(route.query.customer_id) : null,
    contractId: route.query.contract_id ? parseInt(route.query.contract_id) : null,
    projectId: route.query.project_id ? parseInt(route.query.project_id) : null,
    serviceId: route.query.service_id ? parseInt(route.query.service_id) : null
  }

  if (props.change_request_id === "new") {
    splitter.value = {
      span: 100,
      disabled: true,
      limit: [40, 100]
    }
    allowEdit.value = true
    onReset()
  } else {
    changeRequest.value.change_request_id = props.change_request_id
    store.dispatch("common/getChangeRequest", props.change_request_id)
    allowEdit.value = false
    allowEditExtra.value = true
  }
  getOrganisationContracts()
  changeRequest.value.organisation_id = organisationId.value
  loader("mount", "remove")
})

onUnmounted(() => {
  store.commit("common/setChangeRequest", null)
})

watch(customers, newVal => {
  if (routeParams.value?.customerId && newVal.filter(val => val.id === routeParams.value?.customerId).length > 0) {
    selectedCustomer.value = routeParams.value?.customerId
  } else {
    setFirstItem(selectedCustomer, newVal)
  }
})

watch(vendors, newVal => {
  setFirstItem(selectedVendor, newVal)
})

watch(contractOptions, newVal => {
  if (routeParams.value?.contractId && newVal.filter(val => val.id === routeParams.value?.contractId).length > 0) {
    selectedContract.value = routeParams.value?.contractId
  } else {
    setFirstItem(selectedContract, newVal)
  }
})

watch(services, newVal => {
  if (routeParams.value?.serviceId && newVal.filter(val => val.id === routeParams.value?.serviceId).length > 0) {
    selectedService.value = routeParams.value?.serviceId
  } else {
    setFirstItem(selectedService, newVal)
    selectedCapability.value = null
  }
})

watch(serviceContractView, scView => {
  const scv = scView.find(serviceService => serviceService.service_id === routeParams.value?.serviceId)
  if (scv) {
    selectedCustomer.value = scv.customer_id
    selectedContract.value = scv.contract_id
    selectedService.value = scv.service_id
  }
})

watch(selectedCustomer, () => {
  selectedContract.value = null
})

watch(selectedContract, newVal => {
  selectedService.value = routeParams.value?.serviceId || null
  if (newVal) {
    store.dispatch("contract/viewContract", newVal)
  } else {
    store.commit(
      "contract/setContracts",
      { data: [] }
    )
  }
})

watch(changeRequestStore, newVal => {
  if (!newVal) {
    return
  }
  // copy all the values from the store to a local record for editing
  // changeRequest.value.id = changeRequestStore.value.id
  changeRequest.value.model_id = changeRequestStore.value.model_id
  changeRequest.value.model = changeRequestStore.value.model
  changeRequest.value.title = changeRequestStore.value.title
  changeRequest.value.description = changeRequestStore.value.description
  changeRequest.value.json = changeRequestStore.value.json
  changeRequest.value.status_id = changeRequestStore.value.status_id
  changeRequest.value.capability_id = changeRequestStore.value.capability_id

  // todo
  /*
  if (changeRequestStore.value.status.name === 'Closed') {
    allowEditExtra.value = false
    allowViewExtra.value = true
  }
  */
})

watch(loading, newVal => {
  if (newVal.length > 0) {
    $q.loading.show()
  } else {
    $q.loading.hide()
  }
})


watch(() => changeRequestStore.value?.notes,
  (val, oldVal) => {
    setTimeout(() => {
      nextTick(scrollToChatBottom)
    }, 2000 + (80 * Math.abs((val ?? []).length - (oldVal ?? []).length)))
  },
  { deep: true }
)

function scrollToChatBottom() {
  nextTick(() => {
    if (virtualListRef.value?.$el) {
      const container = virtualListRef.value.$el
      const startPosition = container.scrollTop
      const targetPosition = container.scrollHeight - container.clientHeight
      const duration = 500 // Adjust for smoother effect

      let startTime = null

      const animation = currentTime => {
        if (!startTime) startTime = currentTime
        const timeElapsed = currentTime - startTime
        const progress = Math.min(timeElapsed / duration, 1)

        container.scrollTop = startPosition + (targetPosition - startPosition) * progress

        if (timeElapsed < duration) {
          requestAnimationFrame(animation)
        }
      }
      showScrollToBottomBtn.value = false
      requestAnimationFrame(animation)
    }
  })
}

function scrollHandler(details) {
  if (details.direction === "up") showScrollToBottomBtn.value = true
}

function loader(module, type = "add") {
  if (type === "add") {
    loading.value.push(module)
    loading.value = [...new Set(loading.value)]
  } else {
    loading.value = loading.value.filter(val => val !== module)
  }
}

window.setInterval(() => {
  if (syncStatus.value === true) {
    getChangeRequest()
  }
}, 5000)

function getLabels(labelName) {
  //contractReference
  //vendorName
  //customerName

  let contract = props.changeRequestType === "contract" ?
    changeRequestStore.value?.contract :
    changeRequestStore.value?.service?.contract

  let label = ""
  switch (labelName) {
    case "contractReference":
      label = contract?.reference
      break
    case "vendorName":
      label = contract?.vendor?.name
      break
    case "customerName":
      label = contract?.customer?.name
      break
  }
  return label
}

function setFirstItem(dataVar, a) {
  if (a.length) {
    dataVar.value = a[0].id
  }
}

function getOrganisationContracts() {
  loader("orgContract")
  if (contractOptions.value.length < 1) {
    const obj = {}
    if (organisationType.value === "vendor") {
      obj.vendorId = props.vendor_id
    } else {
      obj.customerId = props.customer_id
    }
    obj.include = "services,vendor,customer,services.delivery_model,services.service_lines,customer_contract_owner,vendor_contract_owner"
    store.dispatch("contract/organisationContracts", obj).then(() => {
      loader("orgContract", "remove")
      loader("serviceContract")
      store.dispatch("common/getServiceContractView").then(() => {
        loader("serviceContract", "remove")
      }).catch(() => {
        loader("serviceContract", "remove")
      })
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
}

function getChangeRequest() {
  store.dispatch("common/getChangeRequest", props.change_request_id)
}

async function saveNote() {
  let routePath = route.path.split("/").filter(v => v)
  const obj = {
    data: {
      change_request_id: changeRequestStore.value.id,
      model_id: changeRequest.value.model_id,
      model: changeRequest.value.model,
      title: changeRequest.value.title,
      description: changeRequest.value.description,
      json: changeRequest.value.json,
      status_id: changeRequest.value.status_id,
      capability_id: changeRequest.value.capability_id,
      organisation_id: organisationId.value,
      note: {
        organisation_id: organisationId.value,
        content: changeRequest.value.note,
        is_from_vendor: routePath[0] === "vendor"
      }
    },
    call: "changerequests",
    method: "post"
  }
  isSubmittingData.value = true
  await store.dispatch("admin/datacallDt", obj).then(() => {
    $q.notify({
      color: "green-4",
      textColor: "white",
      icon: "cloud_done",
      message: "Change Request has been updated"
    })
    isSubmittingData.value = false
    getChangeRequest()
    onReset()
  }).catch(e => {
    isSubmittingData.value = false
    console.log(`error: ${e}`)
    $q.notify({
      color: "red-4",
      textColor: "white",
      icon: "cloud_done",
      message: e.data.message || e
    })
  })
}

function setValuesForSubmit() {
  // all are q-selects - other values are directly linked to changeRequest

  if (props.changeRequestType === "contract") {
    changeRequest.value.model_id = selectedContract.value ?? changeRequest.value.model_id
  } else {
    changeRequest.value.model_id = selectedService.value ?? changeRequest.value.model_id
  }
  changeRequest.value.model = props.changeRequestType
  changeRequest.value.json = "" // { capability_id: selectedCapability.value.id }
  if (isNewChangeRequest.value) {
    changeRequest.value.capability_id = selectedCapability.value
    delete changeRequest.value.note
  }
}

function onSubmit() {
  setValuesForSubmit()

  if (isNewChangeRequest.value && !files.length) {
    isSubmittingData.value = true
    store.dispatch("common/createChangeRequest", changeRequest.value).then(() => {
      emit("update")
      $q.notify({
        color: "green-4",
        textColor: "white",
        icon: "cloud_done",
        message: "Change Request Submitted"
      })
      setTimeout(() => {
        isSubmittingData.value = false
        router.push({ path: changeRequestLink.value })
        getChangeRequest()
      }, 1000)
    }).catch(e => {
      $q.notify({
        color: "red-4",
        textColor: "white",
        icon: "cloud_done",
        message: e.data.message || e
      })
      isSubmittingData.value = false
    })

    return
  } else {
    saveNote()
  }
  //uploader.value.upload()
  if (isNewChangeRequest.value) {
    router.push({ path: changeRequestLink.value })
  }
}

function onReset() {
  isResetting.value = true
  if (allowEdit.value) {
    changeRequest.value.id = null
    changeRequest.value.title = ""
    changeRequest.value.description = ""
    changeRequest.value.status_id = 1
  }
  if (allowEditExtra.value) {
    changeRequest.value.note = ""
    //uploader.value.reset()
  }
  files = []
  setTimeout(() => {
    isResetting.value = false
  }, 500)
}

function close() {
  isClosing.value = true
  setTimeout(() => {
    isClosing.value = false
    router.push({ path: changeRequestLink.value })
  }, 400)
}
</script>

<style scoped lang="scss">

.table-info {
  border-collapse: separate;
  border-spacing: 0 0.7em;
}

.infos {
  padding: 2px;
  width: 200px;
  font-weight: bold;
  align-content: start;
}

.sticky-bottom {
  position: sticky;
  opacity: 1;
  z-index: 1;
  bottom: 0;
  background: #161616;
}
</style>
