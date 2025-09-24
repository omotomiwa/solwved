<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">
        Service {{ isApproval ? "Approval" : "Manager" }}
      </div>
      <BreadCrumb align="center" :organisation="organisation" v-if="organisation" />
      <div class="row items-end justify-center q-mb-md">
        <div v-if="service.approved === 0" class="column items-end">
          <q-banner inline-actions rounded class="text-dark q-mt-md bg-primary">
            <template v-slot:avatar>
              <q-icon name="info" color="dark" />
            </template>
            <div class="q-pr-lg">
              This service requires
              {{ isContractOwner ? (props.vendor_id ? "buyer" : "vendor") : "your" }} approval
            </div>
            <template v-slot:action>
              <q-btn flat icon="check" v-if="!isContractOwner" label="Approve" @click="showDialog = true" />
            </template>
          </q-banner>
        </div>
      </div>

      <div v-if="isAuthorised" class="full-width">
        <template v-if="service">
          <div class="row justify-between q-mb-md">
            <div class="text-h4">Service Details</div>
            <div>
              Current week: <span class="text-weight-bold">{{ currentWeek }}</span> ({{ currentWeekDates }})
            </div>
          </div>

          <q-table
            :grid="$q.screen.lt.sm"
            :rows="serviceData"
            bordered flat
            hide-header
            hide-bottom
            wrap-cells
            class="border-primary"
            separator="none"
          >
            <template #body-cell-label1="props">
              <q-td :props="props" style="max-width: 125px;">
                <span class="q-table__grid-item-title">{{ StringMethods.upper(props.value) }}</span>
              </q-td>
            </template>
            <template #body-cell-label2="props">
              <q-td :props="props" style="max-width: 125px;">
                <span class="q-table__grid-item-title">{{ StringMethods.upper(props.value) }}</span>
              </q-td>
            </template>
            <template #body-cell-separator>
              <q-td>
                <q-separator
                  class="full-height"
                  color="primary"
                  vertical
                />
              </q-td>
            </template>
          </q-table>

          <q-card class="q-mt-md" v-if="hasServiceTabs">
            <q-tabs
              v-model="serviceTab"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="left"
              narrow-indicator
            >
              <q-tab
                v-for="(tab,index) in serviceTabList"
                :key="index"
                :name="tab.name"
                :label="tab.label"
                :disable="!tab.enabled"
                no-caps
              />
            </q-tabs>

            <q-separator />

            <q-tab-panels
              v-model="serviceTab"
              animated
              vertical
            >
              <q-tab-panel name="contingent-labour-manager">
                <contingent-labour-manager
                  :requests="requests"
                  :service="service"
                  :vendor_id="props.vendor_id"
                  :customer_id="props.customer_id"
                />
              </q-tab-panel>
              <q-tab-panel name="service-provision-manager">
                <service-provision-manager
                  :requests="requests"
                  :service="service"
                  :vendorId="props.vendor_id"
                  :customerId="props.customer_id"
                />
              </q-tab-panel>
              <q-tab-panel name="vendor-default-delivery-manager">
                <default-delivery-manager
                  :requests="requests"
                  :service="service"
                  :vendorId="props.vendor_id"
                />
              </q-tab-panel>
              <q-tab-panel name="customer-default-delivery-manager">
                <default-delivery-manager
                  :requests="requests"
                  :service="service"
                  :customer-id="props.customer_id"
                  :restricted-view="true"
                />
              </q-tab-panel>
              <q-tab-panel name="deliverables-list">
                <deliverables-list
                  :deliverables="service.outputs"
                />
              </q-tab-panel>
            </q-tab-panels>
          </q-card>

          <div class="text-white row items-center q-mt-md"
               v-else-if="service.delivery_model_id === 1 || service.delivery_model_id === 2">
            <q-icon name="info" class="q-mr-sm" />
            <div>
              No requests have yet been deployed against this service. Please go to
              <RouterLink :to="orderManagementLink">Order Management</RouterLink>
              {{ orderManagementActionsDescription }}
            </div>
          </div>
        </template>
      </div>
      <q-dialog v-model="showDialog">
        <q-card style="width: 1200px">
          <q-card-section>
            <div class="text-h6 text-primary">Confirm Approval</div>
          </q-card-section>
          <q-card-section>
            <div>
              Please confirm that you would like to approve this service. Once approved the service becomes active.
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              v-close-popup
              label="Save"
              color="primary"
              text-color="dark"
              @click="confirmApprove"
            />
            <q-btn
              v-close-popup
              label="Cancel"
              color="white"
              outline
              class="q-ml-sm"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar"
import { computed, onMounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { useRoute, useRouter } from "vue-router"
import { DateTime } from "luxon"
import { customerAuth, vendorAuth } from "src/modules/AuthLogic.js"
import { CurrencyMethods, StringMethods } from "src/modules/GlobalMethods.js"
import { ClassCombinations, Config } from "src/modules/StaticData.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import ContingentLabourManager from "src/components/serviceManagement/ContingentLabourManager.vue"
import ServiceProvisionManager from "src/components/serviceManagement/ServiceProvisionManager.vue"
import DefaultDeliveryManager from "src/components/serviceManagement/DefaultDeliveryManager.vue"
import DeliverablesList from "src/components/serviceManagement/DeliverablesList.vue"

const store = useStore()
const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null },
  service_id: { type: String, default: null }
})

let showDialog = ref(false)
const serviceTab = ref("")

let isAuthorised = false
let organisation = false
if (props.vendor_id) {
  isAuthorised = vendorAuth(props.vendor_id).isAuthorised
  organisation = vendorAuth(props.vendor_id).vendor
}
if (props.customer_id) {
  isAuthorised = customerAuth(props.customer_id).isAuthorised
  organisation = customerAuth(props.customer_id).customer
}

const serviceTabList = computed(() => {
  return [
    {
      name: "contingent-labour-manager",
      label: "Contingent Labour Manager",
      enabled: (requests.value ?? []).length > 0
        && service.value?.delivery_model_id === 1
    },
    {
      name: "service-provision-manager",
      label: "Service Provision Manager",
      enabled: (requests.value ?? []).length > 0
        && service.value?.delivery_model_id === 2
    },
    {
      name: "vendor-default-delivery-manager",
      label: "Delivery Manager",
      enabled: (requests.value ?? []).length > 0
        && !isApproval.value
        && props.vendor_id
        && [3, 4].includes(service.value?.delivery_model_id)
    },
    {
      name: "customer-default-delivery-manager",
      label: "Delivery Manager",
      enabled: (requests.value ?? []).length > 0
        && !isApproval.value
        && props.customer_id
        && [3, 4].includes(service.value?.delivery_model_id)
    },
    {
      name: "deliverables-list",
      label: "Deliverables List",
      enabled: (requests.value ?? []).length > 0
        && isApproval.value
    }
  ].filter(val => val.enabled)
})
const hasServiceTabs = computed(() => (serviceTabList.value ?? []).filter(val => val.enabled).length > 0)
const organisationDetail = computed(() => store.getters["admin/getOrganisation"])
const isContractOwner = computed(() => {
  return !!(service.value && service.value.contract.contract_owner_organisation_id === organisation.value.id)
})
const isApproval = computed(() => {
  return service.value.delivery_model_id > 2 && service.value.approved === 0
})
const currentWeek = computed(() => DateTime.now().weekNumber)
const currentWeekDates = computed(() => {
  const startDate = DateTime.now().startOf("week").toFormat(Config.DATE_FORMAT_DLY)
  const endDate = DateTime.now().endOf("week").toFormat(Config.DATE_FORMAT_DLY)
  return `${startDate} - ${endDate}`
})
const orderManagementLink = computed(() => {
  let link
  if (props.vendor_id) {
    link = "/vendor/" + props.vendor_id + "/order-management"
  } else if (props.customer_id) {
    link = "/customer/" + props.customer_id + "/order-management"
  }
  return link
})
const orderManagementActionsDescription = computed(() => {
  let text
  if (props.vendor_id) {
    text = "to negotiate and deploy orders"
  } else if (props.customer_id) {
    text = "to create and negotiate orders"
  }
  return text
})
const service = computed(() => {
  return store.getters["contract/getServicesById"](props.service_id)
})
const requests = computed(() => {
  let r = []
  if (service.value && service.value.requests && service.value.requests.length) {
    r = service.value.requests
  }
  return r
})
const serviceData = computed(() => {
  if ($q.screen.gt.xs) {
    return [
      {
        label1: props.vendor_id ? "Customer" : "Vendor",
        value1: props.vendr_id ? (service.value?.contract?.customer?.name ?? "-") : (service.value?.contract?.vendor?.name ?? "-"),
        separator: true,
        label2: "Delivery Model",
        value2: service.value?.delivery_model?.name ?? "-"
      },
      {
        label1: "Contract",
        value1: service.value?.contract?.reference ?? "-",
        separator: true,
        label2: "Financial Model",
        value2: service.value?.financial_model?.name ?? "-"
      },
      {
        label1: "Service",
        value1: service.value?.name ?? "-",
        separator: true,
        label2: "Start Date",
        value2: service.value?.start_date ?? "-"
      },
      {
        label1: "Value",
        value1: CurrencyMethods.toCurrencyFormat(organisationDetail.value?.currency?.code, service.value?.value ?? 0),
        separator: true,
        label2: "End Date",
        value2: service.value?.end_date ?? "-"
      }
    ]
  }
  return [
    {
      [props.vendor_id ? "Customer" : "Vendor"]: props.vendr_id ? (service.value?.contract?.customer?.name ?? "-") : (service.value?.contract?.vendor?.name ?? "-"),
      "Contract": service.value?.contract?.reference ?? "-",
      "Service": service.value?.name ?? "-",
      "Value": CurrencyMethods.toCurrencyFormat(organisationDetail.value?.currency?.code, service.value?.value ?? 0),
      "Delivery Model": service.value?.delivery_model?.name ?? "-",
      "Financial Model": service.value?.financial_model?.name ?? "-",
      "Start Date": service.value?.start_date ?? "-",
      "End Date": service.value?.end_date ?? "-"
    }
  ]
})

watch(
  serviceTabList,
  newVal => {
    if (newVal.length > 0) {
      serviceTab.value = newVal.filter(val => val.enabled)[0].name
    }
  },
  { deep: true }
)

function getService() {
  const obj = {
    method: "get",
    id: props.service_id
  }
  store.dispatch("contract/service", obj).then(() => {
    $q.loading.hide()
  })
}

function getCompetencies() {
  store.dispatch("common/getCompetencies")
}

function getConsultants() {
  if (props.vendor_id) {
    store.dispatch("vendor/getVendorConsultants", props.vendor_id)
  }
}

/* This is a buyer only action */
function confirmApprove() {
  $q.loading.show()
  store.dispatch(
    "customer/approveService",
    { id: props.service_id, data: { organisation_id: organisation.value.id } }
  ).then(() => {
    getService()
    //redirect to the approved url
    let path = route.path
    let newPath = path.replace("service-approvals", "active-services")
    router.push({ path: newPath })
  })
}

onMounted(() => {
  $q.loading.show()
  getService()
  getConsultants()
  getCompetencies()
})
</script>

<style scoped lang="scss">
.text-weight-bolder * {
  font-weight: 900;
}

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
</style>
