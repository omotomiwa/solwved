<template>
  <div v-if="contracts && contracts.length > 0" class="q-mt-md">
    <div v-for="contract in contracts" :key="contract.id">{{ contract.reference }}</div>
  </div>
  <div v-else>There are no contracts to display</div>
  <div v-if="showNewForm" class="row q-col-gutter-xs items-center q-mt-sm q-pb-md">
    <q-input
      v-model="newContractData.reference"
      class="col-xs-12 col-sm-6 col-md"
      dense
      outlined
      stack-label
      label="Reference"
      color="primary"
      label-color="white"
      type="text"
      maxlength="255"
      autofocus
    />
    <new-selector-form
      v-model:option_id="selectedOrganisationId"
      classes="col-xs-12 col-sm-6 col-md"
      dense
      :options="linkedOrganisations"
      is-filterable
      filter-key="name"
      :label="view === 'vendor' ? 'Customer' : 'Vendor'"
      default-class="full-width"
    />
    <new-selector-form
      v-model:option_id="contractOwnerId"
      classes="col-xs-12 col-sm-6 col-md"
      dense
      :options="contractParties"
      is-filterable
      filter-key="name"
      label="Contract Owner"
      default-class="full-width"
      :disabled="!selectedOrganisationId"
    />
    <div class="col-xs-auto">
      <q-btn
        label="Save"
        :disable="!allowSave"
        color="primary"
        text-color="dark"
        size="sm"
        class="q-ml-xs-none q-ml-sm-sm"
        @click="saveNew"
      />
      <q-btn
        label="Cancel"
        color="white"
        outline
        size="sm"
        class="q-ml-sm"
        @click="cancelNew"
      />
    </div>
  </div>
  <q-btn
    v-if="!showNewForm"
    label="Create new contract"
    @click="showNewForm = true"
    color="primary"
    text-color="dark"
    size="sm"
    class="q-mt-sm q-mb-lg"
  />
  <div v-if="showNewForm" class="q-pb-lg">
    N.B If you don't see the organisation you require in the options, you might need to create a link between the two
    first. See
    <RouterLink to="/admin/organisation-relationships">Organisation Relationships</RouterLink>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue"
import { useStore } from "vuex"
import { ObjectMethods } from "src/modules/GlobalMethods.js"
import NewSelectorForm from "components/NewSelectorForm.vue"

const store = useStore()

const props = defineProps({
  organisations: { type: Array, default: () => [] },
  linkedOrganisations: { type: Array, default: () => [] },
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null }
})

const selectedOrganisationId = ref(null)
const contractOwnerId = ref(null)
const showNewForm = ref(false)
const newContractData = reactive({
  reference: "",
  vendor_id: null,
  customer_id: null,
  contract_owner_organisation_id: null
})

const view = computed(() => props.vendor_id ? "vendor" : "customer")
const organisationId = computed(() => {
  if (props.vendor_id) {
    return parseInt(props.vendor_id)
  } else if (props.customer_id) {
    return parseInt(props.customer_id)
  }
  return null
})
const contractParties = computed(() => {
  const principal = props.organisations.find(organisation => organisation.id === organisationId.value)
  const second = props.organisations.find(organisation => organisation.id === selectedOrganisationId.value)
  return [principal, second]
})
const contracts = computed(() => {
  const c = []
  const allContracts = store.getters["admin/getContractsByOrganisationId"](organisationId.value)
  allContracts.forEach(contract => {
    if (view.value === "vendor" && contract.vendor_id === organisationId.value) {
      c.push(contract)
    } else if (view.value === "customer" && contract.customer_id === organisationId.value) {
      c.push(contract)
    }
  })
  return c
})
const allowSave = computed(() => {
  return selectedOrganisationId.value !== null &&
    contractOwnerId.value !== null &&
    newContractData.reference.trim() !== ""
})

watch(selectedOrganisationId, () => {
  contractOwnerId.value = null
})

function cancelNew() {
  showNewForm.value = false
  newContractData.reference = ""
  selectedOrganisationId.value = null
  contractOwnerId.value = null
}

function setFormFields() {
  if (props.vendor_id) {
    newContractData.vendor_id = props.vendor_id
  } else if (props.customer_id) {
    newContractData.customer_id = props.customer_id
  }
}

function saveNew() {
  if (allowSave.value) {
    if (props.vendor_id) {
      newContractData.vendor_id = props.vendor_id
      newContractData.customer_id = selectedOrganisationId.value
    } else if (props.customer_id) {
      newContractData.vendor_id = selectedOrganisationId.value
      newContractData.customer_id = props.customer_id
    }
    newContractData.contract_owner_organisation_id = contractOwnerId.value

    const formData = ObjectMethods.decouple(newContractData)
    formData.reference = formData.reference.trim()
    const obj = {
      call: "contracts",
      method: "post",
      data: formData
    }

    store.dispatch("admin/datacallDt", obj).then(response => {
      const obj = { organisationId: organisationId.value, contract: response.data }
      store.dispatch("admin/addOrganisationContract", obj)
      cancelNew()
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

onMounted(() => {
  setFormFields()
})
</script>
