<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Active Services</div>
      <BreadCrumb align="center" :organisation="organisation" v-if="organisation" />
      <div v-if="isAuthorised">
        <q-banner
          v-if="!bannerDismissed"
          inline-actions
          rounded
          dense
          class="q-my-md bg-primary text-dark q-mt-md"
          style="width:100%;"
        >
          <template v-slot:avatar>
            <q-icon name="info" color="dark" />
          </template>
          {{ pageMessage }}
          <template v-slot:action>
            <q-btn flat label="Dismiss" @click="bannerDismissed = true" />
          </template>
        </q-banner>
        <div v-if="props.vendor_id" class="row q-col-gutter-lg q-mt-lg items-start">
          <organisation-services-card
            v-for="customer in customers"
            :key="customer.id"
            :organisation="customer"
            viewing-as-type="vendor"
            class="col-xs-12 col-sm-6 col-md-4 col-lg-4"
          />
        </div>
        <div v-if="props.customer_id" class="row q-col-gutter-lg q-mt-lg">
          <organisation-services-card
            v-for="vendor in vendors"
            :key="vendor.id"
            :organisation="vendor"
            viewing-as-type="customer"
            class="col-xs-12 col-sm-6 col-md-4 col-lg-4"
          />
        </div>
      </div>
      <div v-else class="q-my-md">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar"
import { computed, onMounted, ref } from "vue"
import { useStore } from "vuex"
import { customerAuth, vendorAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations } from "src/modules/StaticData.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import OrganisationServicesCard from "src/components/serviceManagement/OrganisationServicesCard.vue"

const store = useStore()
const $q = useQuasar()

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null },
  customer_request_id: { type: String, default: null }
})

const bannerDismissed = ref(false)

let isAuthorised = false
let organisation = undefined
if (props.vendor_id) {
  isAuthorised = vendorAuth(props.vendor_id).isAuthorised
  organisation = vendorAuth(props.vendor_id).vendor
}
if (props.customer_id) {
  isAuthorised = customerAuth(props.customer_id).isAuthorised
  organisation = customerAuth(props.customer_id).customer
}

const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const pageMessage = computed(() => {
  let m = ""
  if (props.customer_id) {
    m = "This page lists all of your organisation's contracts where it is acting as the customer. For Professional Services and Contingent Labour delivery models, you can click through to view read only details."
  } else if (props.vendor_id) {
    m = "This page lists all of your organisation's contracts where it is acting as the vendor. Click on a service to manage the service and it's " +
      OrganisationTypeMethods.changeConsultant(isBuiltEnvironment.value, { isPlural: true, isCamelCase: false })
  }
  return m
})
const contracts = computed(() => {
  return store.getters["contract/getOrganisationContracts"](organisation.value.id)
})
const customers = computed(() => {
  const c = {}
  if (contracts.value && contracts.value.length) {
    contracts.value.forEach(contract => {
      if (c[contract.customer_id] === undefined) {
        c[contract.customer_id] = {
          id: contract.customer_id,
          name: contract.customer.name,
          contracts: []
        }
      }
      c[contract.customer_id].contracts.push(contract)
    })
  }
  return Object.values(c)
})
const vendors = computed(() => {
  const c = {}
  if (contracts.value && contracts.value.length) {
    contracts.value.forEach(contract => {
      if (c[contract.vendor_id] === undefined) {
        c[contract.vendor_id] = {
          id: contract.vendor_id,
          name: contract.vendor.name,
          contracts: []
        }
      }
      c[contract.vendor_id].contracts.push(contract)
    })
  }
  return Object.values(c)
})

onMounted(() => {
  $q.loading.show()
  getContracts()
})

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
</script>

<style scoped>
table {
  border: 1px solid #1c6eaa;
  background-color: white;
  border-collapse: collapse;
  padding: 100px;
}
</style>
