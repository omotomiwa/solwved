<template>
  <div class="row items-center">
    <new-selector-form
      v-model:option_id="selectedContract"
      classes="col-12 col-md-4"
      :options="contracts"
      is-filterable
      filter-key="reference"
      option-label="reference"
      label="Contract"
      default-class="full-width"
    />
    <div class="row col-md-12 q-mt-lg">
      <q-btn
        v-show="admin && !showNewForm"
        label="Create new Contract"
        color="positive"
        size="sm"
        @click="showCreateNew"
      />
      <div
        v-show="showNewForm"
        class="row q-col-gutter-xs items-center"
      >
        <new-selector-form
          v-model:option_id="newContractData.vendor_id"
          classes="col-12 col-md-4"
          :options="organisations"
          is-filterable
          filter-key="name"
          label="Vendor"
          default-class="full-width"
        />
        <q-input
          v-model="newContractData.reference"
          class="col-md-6"
          outlined
          clearable
          stack-label
          label="Reference"
          label-color="white"
          type="text"
          maxlength="255"
        />
        <div class="col-xs-auto">
          <q-btn
            label="Save"
            :disable="!allowSave"
            color="positive"
            size="sm"
            class="q-ml-xs-none q-ml-sm-sm"
            @click="saveNew"
          />
          <q-btn
            label="Cancel"
            color="primary"
            text-color="dark"
            size="sm"
            class="q-ml-sm"
            @click="hideCreateNew"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from "vuex"
import { computed, onMounted, ref, watch } from "vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

const store = useStore()

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null },
  admin: { type: Boolean, default: false }
})

const emit = defineEmits(["contractSelect"])

const localRecord = ref({
  service_id: null,
  status: null,
  alerter_id: null,
  alert_date: "",
  start_date: "",
  end_date: "",
  notes: ""
})
const newContractData = ref({
  reference: "",
  vendor_id: props.vendor_id,
  customer_id: props.customer_id
})
const showNewForm = ref(false)
const banner = ref(null)
const selectedContract = ref()

const allowSave = computed(() => newContractData.value.vendor_id && newContractData.value.reference)
const contractId = computed(() => {
  return contracts.value.find(obj => {
    return parseInt(obj.id) === parseInt(selectedContract.value)
  })
})
const contract = computed(() => store.getters["contract/getContract"])
const contracts = computed(() => store.getters["contract/getContracts"])
const organisations = computed(() => store.getters["admin/getOrganisations"])

watch(contracts, () => {
  // selectedContract.value = currentValue[0]
  getContract()
})

watch(selectedContract, (newVal) => {
  emit("contractSelect", newVal)
})

function getContract() {
  if (!contractId.value) {
    return
  }
  store.dispatch("contract/viewContract", contractId)
}

function getContracts() {
  const obj = {
    vendorId: (props.vendor_id) ? props.vendor_id : null,
    customerId: (props.customer_id) ? props.customer_id : null
  }
  store.dispatch("contract/viewContracts", obj)
}

function getOrganisations() {
  const obj = { call: "organisations", method: "get" }
  store.dispatch("admin/datacallDt", obj)
}

function saveNew() {
  if (allowSave.value) {
    const obj = {
      call: "contracts",
      method: "post",
      data: {
        reference: newContractData.value.reference.trim(),
        customer_id: newContractData.value.customer_id,
        vendor_id: newContractData.value.vendor_id
      }
    }
    store.dispatch("admin/datacallDt", obj).then(() => {
      // redirect to list
      hideCreateNew()
      getContracts()
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

function setBanner(msg) {
  banner.value = msg
}

function showCreateNew() {
  // this.resetNewContractData()
  showNewForm.value = true
  setBanner("Select a vendor and enter a reference...")
}

function hideCreateNew() {
  // this.resetNewContractData()
  showNewForm.value = false
  setBanner(null)
}

onMounted(() => {
  getContracts()
  getOrganisations()
  setBanner("Select a contract")
})
</script>

<style lang="scss" scoped>
table {
  border: 1px solid #1C6EAA;
  background-color: white;
  border-collapse: collapse;
  padding: 100px;
}

.infos {
  padding: 2px;
  background: rgb(2, 0, 36);
  background: linear-gradient(270deg, rgba(2, 0, 36, 1) 0%, rgba(9, 121, 86, 0.14936396922050066) 0%, rgba(0, 212, 255, 1) 100%);
}

.infosdata {
  padding-left: 10px
}

.alternate-color .q-item {
  background-color: rgba(54, 76, 102, 0.2);
}

.alternate-color .q-item:nth-of-type(2n) {
  background-color: rgba(54, 76, 102, 0.1);
}
</style>
