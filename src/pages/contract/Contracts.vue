<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Contracts</div>
      <BreadCrumb align="center" :organisation="organisation" v-if="organisation" />
      <div v-if="contracts && isAdminAuthorised" class="q-mt-lg">
        <div class="text-white q-mb-md">Listing all contracts owned by {{ organisation.name }}</div>
        <ContractsTable :contracts="contracts" :view="entityName" />
        <div class="q-mt-lg">
          <q-btn
            v-show="!showNewForm"
            label="Create new Contract"
            size="md"
            color="primary"
            text-color="dark"
            @click="showCreateNew"
          />
          <div v-if="showNewForm" class="row q-col-gutter-xs items-center">
            <q-input
              v-model="newContractData.reference"
              class="col-xs-12 col-sm-6 col-md"
              outlined
              label-color="white"
              color="primary"
              stack-label
              label="Reference"
              type="text"
              maxlength="255"
              autofocus
            />
            <new-selector-form
              v-model:option_id="selectedOrganisationId"
              classes="col-xs-12 col-sm-6 col-md"
              is-filterable
              filter-key="name"
              :options="linkedOrganisations"
              :label="entityName === 'vendor' ? 'Customer' : 'Vendor'"
              default-class="w-content"
            />
            <currency-input
              label="Value"
              v-model="newContractData.value"
              :prefix="currency_symbol"
            />
            <q-input
              v-model="newContractData.start_date"
              class="col-2"
              outlined
              type="text"
              label="Start Date"
              :mask="Config.DATE_MASK"
              hide-bottom-space
              stack-label
              :rules="[checkDate, startDateRule]"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                    ref="startDatePopup"
                  >
                    <q-date
                      first-day-of-week="1"
                      v-model="newContractData.start_date"
                      text-color="dark"
                      :mask="Config.DATE_FORMAT_DMY"
                      today-btn
                      no-unset
                      @update:model-value="closeStartDatePopup"
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          text-color="dark"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              v-model="newContractData.end_date"
              class="col-2"
              outlined
              type="text"
              label="End Date"
              :mask="Config.DATE_MASK"
              hide-bottom-space
              stack-label
              :rules="[checkDate, endDateRule]"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                    ref="endDatePopup"
                  >
                    <q-date
                      first-day-of-week="1"
                      v-model="newContractData.end_date"
                      text-color="dark"
                      :mask="Config.DATE_FORMAT_DMY"
                      today-btn
                      no-unset
                      @update:model-value="closeEndDatePopup"
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          text-color="dark"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <div class="col-xs-auto">
              <q-btn
                label="Save"
                :disable="!allowSave"
                class="q-ml-xs-none q-ml-sm-sm"
                color="primary"
                text-color="dark"
                @click="saveNew"
              />
              <q-btn
                label="Cancel"
                color="white"
                outline
                class="q-ml-sm"
                @click="cancelNew"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue"
import { useStore } from "vuex"
import { RulesRegex, ClassCombinations, Config } from "src/modules/StaticData.js"
import { DateMethods, ObjectMethods } from "src/modules/GlobalMethods.js"
import { customerAuth, vendorAuth } from "src/modules/AuthLogic.js"
import ContractsTable from "components/ContractsTable.vue"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import CurrencyInput from "src/components/CurrencyInput.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

const store = useStore()

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null }
})

let organisation
let isAdminAuthorised

if (props.vendor_id) {
  organisation = vendorAuth(props.vendor_id).vendor
  isAdminAuthorised = vendorAuth(props.vendor_id).isAdminAuthorised
} else if (props.customer_id) {
  organisation = customerAuth(props.customer_id).customer
  isAdminAuthorised = customerAuth(props.customer_id).isAdminAuthorised
}

const showNewForm = ref(false)
const selectedOrganisationId = ref(null)
const newContractData = reactive({
  reference: "",
  vendor_id: null,
  customer_id: null,
  contract_owner_organisation_id: null,
  start_date: null,
  end_date: null,
  value: 0
})
const startDatePopup = ref(null)
const endDatePopup = ref(null)

const entityName = computed(() => {
  return props.vendor_id ? "vendor" : (props.customer_id ? "customer" : "invalid")
})
const dashboardLink = computed(() => {
  switch (entityName.value) {
    case "vendor":
      return "/" + entityName.value + "/" + props.vendor_id
    case "customer":
      return "/" + entityName.value + "/" + props.customer_id
  }
  return "nada"
})
const organisationId = computed(() => {
  if (props.vendor_id) {
    return props.vendor_id
  } else if (props.customer_id) {
    return props.customer_id
  }
  return false
})
const user = computed(() => store.getters["auth/getUser"])
const contracts = computed(() => store.getters["contract/getContracts"])
const linkedOrganisations = computed(() => store.getters["contract/getLinkedOrganisations"](organisationId.value))
const allowSave = computed(() => {
  return newContractData.reference.trim() !== "" &&
    selectedOrganisationId.value !== null &&
    newContractData.start_date !== null &&
    newContractData.end_date !== null &&
    newContractData.value > 0
})
const badge = computed(() => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get("badge") ?? store.getters["auth/getBadge"]
})
const organisationDetail = computed(() => store.getters["admin/getOrganisation"])
const currency_symbol = computed(() => organisationDetail.value?.currency?.symbol ?? Config.CURRENCY_SYMBOL)

function closeStartDatePopup() {
  startDatePopup.value.hide()
}

function closeEndDatePopup() {
  endDatePopup.value.hide()
}

function checkDate(val) {
  if ((val ?? "").trim().length > 0 && !RulesRegex.date.test(DateMethods.convertDateFormat(val))) {
    return "Please enter the valid date"
  }
  return true
}

function startDateRule(val) {
  if (newContractData.end_date && val) {
    const d1 = new Date(DateMethods.convertDateFormat(val)).getTime()
    const d2 = new Date(DateMethods.convertDateFormat(newContractData.end_date)).getTime()
    return d1 <= d2 ? true : "Start date must not be smaller than end date"
  }
  return !!val
}

function endDateRule(val) {
  if (newContractData.start_date && val) {
    const d1 = new Date(DateMethods.convertDateFormat(newContractData.start_date)).getTime()
    const d2 = new Date(DateMethods.convertDateFormat(val)).getTime()
    return d2 >= d1 ? true : "End date must not be grater than start date"
  }
  return !!val
}

function getContracts() {
  const obj = {
    include: "vendor,customer,services.delivery_model,services.requests,services.service_lines,customer_contract_owner,vendor_contract_owner"
  }
  if (props.vendor_id) {
    obj.vendorId = props.vendor_id
  } else if (props.customer_id) {
    obj.customerId = props.customer_id
  }
  store.dispatch("contract/viewContracts", obj)
}

function getLinkedOrganisations(force) {
  if (force) {
    store.dispatch("contract/getLinkedOrganisations", organisationId.value)
  }
}

function showCreateNew() {
  resetNewContractData()
  showNewForm.value = true
}

function hideCreateNew() {
  resetNewContractData()
  showNewForm.value = false
}

function resetNewContractData() {
  selectedOrganisationId.value = null
  newContractData.reference = ""
  newContractData.customer_id = null
  newContractData.vendor_id = null
  newContractData.contract_owner_organisation_id = null
  newContractData.start_date = null
  newContractData.end_date = null
  setFormFields()
}

function setFormFields() {
  if (props.vendor_id) {
    newContractData.vendor_id = props.vendor_id
    newContractData.contract_owner_organisation_id = props.vendor_id
  } else if (props.customer_id) {
    newContractData.customer_id = props.customer_id
    newContractData.contract_owner_organisation_id = props.customer_id
  }
}

function saveNew() {
  if (allowSave.value) {
    if (props.vendor_id) {
      newContractData.vendor_id = props.vendor_id
      newContractData.customer_id = selectedOrganisationId.value
      newContractData.contract_owner_organisation_id = props.vendor_id
    } else if (props.customer_id) {
      newContractData.vendor_id = selectedOrganisationId.value
      newContractData.customer_id = props.customer_id
      newContractData.contract_owner_organisation_id = props.customer_id
    }
    const formData = ObjectMethods.decouple(newContractData)
    formData.reference = formData.reference.trim()
    const obj = {
      call: "contracts",
      method: "post",
      data: formData
    }

    store.dispatch("contract/datacallDt", obj).then(() => {
      // redirect to list
      hideCreateNew()
      getContracts(true)
    }).catch(e => {
      if (e.response && e.response.data && e.response.data.error) {
        store.dispatch(
          "auth/setDataCallNotice",
          { show: true, title: "Data call error", message: e.response.data.error }
        )
      } else {
        store.dispatch(
          "auth/setDataCallNotice",
          { show: true, title: "Data call error", message: e }
        )
      }
    })
  }
}

function cancelNew() {
  hideCreateNew()
}

onMounted(() => {
  getContracts(true)
  getLinkedOrganisations(true) // required for list of Organisations when creating a new contract
  setFormFields()
})
</script>
