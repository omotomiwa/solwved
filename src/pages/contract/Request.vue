<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Vendor Area</div>
      <div v-if="is_authorised && contract && service && request" class="text-h6 breadcrum">
        <router-link :to="vendorDashboardLink">
          {{ contract.vendor.name }}
        </router-link>
        <span> / </span>
        <router-link :to="vendorContractsLink"> Contracts</router-link>
        <span> / </span>
        <router-link :to="contractLink"> {{ contract.reference }} ({{ contract.customer.name }})</router-link>
        <span> / </span>
        <router-link :to="serviceLink">
          {{ service.name }}
        </router-link>
        <span> / Requests / {{ request_id }}</span>
      </div>
      <div v-if="is_authorised && contract && service && request" class="q-mt-lg">
        <div class="row">
          <div class="column col-xs-6 col-md-3 q-mb-xs-md">
            <div class="text-weight-bold">Contract Reference</div>
            <div>{{ contract.reference }}</div>
          </div>
          <div class="column col-xs-6 col-md-3">
            <div class="text-weight-bold">Contract Service</div>
            <div>{{ service.name }}</div>
          </div>
          <div class="column col-xs-6 col-md-3 q-mb-xs-md">
            <div class="text-weight-bold">Vendor</div>
            <div>{{ contract.vendor.name }}</div>
          </div>
          <div class="column col-xs-6 col-md-3">
            <div class="text-weight-bold">Customer</div>
            <div>{{ contract.customer.name }}</div>
          </div>
        </div>
        <div v-if="service" class="row">
          <div class="column col-xs-6 col-md-3 q-mb-xs-md">
            <div class="text-weight-bold">Delivery Model</div>
            <div>{{ delivery_model }}</div>
          </div>
          <div class="column col-xs-6 col-md-3">
            <div class="text-weight-bold">Financial Model</div>
            <div>{{ financial_model }}</div>
          </div>
        </div>
        <div v-if="service">
          <div class="group">
            <div class="row q-mt-lg text-h4">Request Details</div>
            <div v-if="service_lines" class="row q-mt-lg items-center">
              <edit-request-form
                v-if="request"
                :request="request"
                :editable="is_vendor_admin"
                :service_id="parseInt(service_id)"
                :service_lines="service_lines"
                :delivery_models="available_delivery_models"
                :financial_models="available_financial_models"
                :purchase_orders="purchase_orders"
                :vendor_users="vendor_users"
                :customer_users="customer_users"
                class="q-mb-xl"
                @refresh="refreshService"
              />
            </div>
          </div>
          <div class="group">
            <div class="row q-mt-lg q-mb-sm text-h4">Request Capabilities</div>
            <q-list v-if="request_capabilities && request_capabilities.length" bordered separator>
              <q-item v-for="item in request_capabilities" :key="item.id">
                <item-editor
                  :data="item"
                  label-property="name"
                  :allow-edit-label="false"
                  item-delete-label="Remove"
                  @delete="deleteRequestCapability(item.id)"
                />
              </q-item>
            </q-list>
            <div class="row items-center q-mt-sm">
              <new-selector-form
                v-show="allowNewCapability && showNewCapabilityForm"
                v-model:option_id="newRequestCapability"
                :options="request_capability_options"
                label="Assign Capability"
                is-filterable
                filter-key="name"
                option-val-key="value"
                dense
              />
              <div v-show="allowNewCapability">
                <q-btn
                  v-show="!showNewCapabilityForm"
                  label="Asssign new capability"
                  color="primary"
                  text-color="dark"
                  size="sm"
                  @click="showNewCapabilityForm = true"
                />
                <q-btn
                  v-show="showNewCapabilityForm"
                  class="col-auto q-ml-sm"
                  :disable="!allowSaveRequestCapability"
                  label="Save"
                  color="positive"
                  size="sm"
                  @click="saveNewRequestCapability"
                />
                <q-btn
                  v-show="showNewCapabilityForm"
                  class="col-auto q-ml-sm"
                  label="Cancel"
                  color="primary"
                  text-color="dark"
                  size="sm"
                  @click="showNewCapabilityForm = false"
                />
              </div>
            </div>
          </div>
          <div class="group q-mt-lg">
            <div class="row q-pt-lg q-mb-sm text-h4">{{ OrganisationTypeMethods.changeConsultant(isBuiltEnvironment) }}
              Engagements
            </div>
            <consultant-engagements-table :engagements="engagements" @edit-engagement="editEngagement" />
            <q-btn
              v-if="!showNewEngagementForm"
              label="Create new Engagement"
              class="q-mt-md"
              color="primary"
              text-color="dark"
              size="sm"
              @click="showNewEngagementForm = true"
            />
            <new-engagement-form
              v-show="showNewEngagementForm"
              :vendor_id="parseInt(this.contract.vendor_id)"
              :request_id="parseInt(request_id)"
              :consultants="available_consultants"
              :request_capabilities="request_capabilities"
              :competencies="competencies"
              :projects="projects"
              @cancel="showNewEngagementForm = false"
              @refresh="refreshRequest"
              class="q-mb-xl"
            />
          </div>
        </div>
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
    <q-dialog v-model="showEditEngagement">
      <edit-engagement-form
        v-if="selectedEngagement !== null"
        :engagement="selectedEngagement"
        :vendor_id="parseInt(vendor_id)"
        :request_id="parseInt(request_id)"
        :consultants="available_consultants"
        :request_capabilities="request_capabilities"
        :competencies="competencies"
        :projects="projects"
        class="q-mb-xl"
        @cancel="showEditEngagement = false"
        @refresh="refreshRequest"
      />
    </q-dialog>
    <q-dialog v-model="saveDataResponse">
      <q-card>
        <q-card-section>
          <div>
            {{ saveDataMessage }}
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent } from "vue"
import { ClassCombinations } from "src/modules/StaticData.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import EditRequestForm from "src/components/EditRequestForm.vue"
import ItemEditor from "src/components/ItemEditor.vue"
import NewSelectorForm from "src/components/NewSelectorForm.vue"
import ConsultantEngagementsTable from "src/components/ConsultantEngagementsTable.vue"
import NewEngagementForm from "src/components/NewEngagementForm.vue"
import EditEngagementForm from "src/components/EditEngagementForm.vue"

export default defineComponent({
  name: "Request",
  components: {
    EditRequestForm,
    ItemEditor,
    NewSelectorForm,
    ConsultantEngagementsTable,
    NewEngagementForm,
    EditEngagementForm
  },
  props: ["vendor_id", "contract_id", "service_id", "request_id"],
  data() {
    return {
      localData: null,
      isEditingService: false,
      saveDataResponse: false,
      saveDataMessage: "",
      showNewRequestForm: false,
      newRequestCapability: null,
      showNewCapabilityForm: false,
      showNewEngagementForm: false,
      showEditEngagement: false,
      selectedEngagement: null
    }
  },
  setup() {
    return {
      OrganisationTypeMethods,
      ClassCombinations
    }
  },
  computed: {
    isBuiltEnvironment: function() {
      return this.$store.getters["admin/getIsBuiltEnvironment"]
    },
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    contracts: function() {
      return this.$store.getters["vendor/getContractsByVendor"](this.vendor_id)
    },
    contract: function() {
      return this.$store.getters["contract/getContract"]
    },
    service: function() {
      // const c = this.$store.getters['contract/getService']
      return this.$store.getters["contract/getServicesById"](this.service_id)
    },
    delivery_model: function() {
      return this.service ? this.service.delivery_model.name : "Undefined"
    },
    financial_model: function() {
      return this.service ? this.service.financial_model.name : "Undefined"
    },
    consultants: function() {
      return this.$store.getters["vendor/getConsultantsByVendor"](this.contract.vendor_id)
    },
    available_consultants: function() {
      const consultants = []
      if (this.consultants.length) {
        for (let index = 0; index < this.consultants.length; index++) {
          const element = this.consultants[index]
          consultants.push({
            id: element.id,
            name: element.user.first_name + " " + element.user.last_name
          })
        }
      }
      return consultants
    },
    competencies: function() {
      return this.$store.getters["admin/getCompetencies"]
    },
    capabilities: function() {
      let c = []
      if (this.service && this.service.capabilities && this.service.capabilities.length) {
        c = this.service.capabilities
      }
      return c
    },
    request_capabilities: function() {
      if (this.request && this.request.capabilities && this.request.capabilities.length) {
        const c = []
        for (let index = 0; index < this.request.capabilities.length; index++) {
          const element = this.request.capabilities[index]
          const item = {}
          item.capability_id = element.capability.id
          item.id = element.id
          item.name = element.capability.name
          c.push(item)
        }
        return c
      }
      return []
    },
    request_capability_options: function() {
      const rc = []
      if (this.capabilities.length) {
        for (let index = 0; index < this.capabilities.length; index++) {
          const capability = this.capabilities[index]
          const m = this.request_capabilities.find(elem => parseInt(elem.capability_id) === parseInt(capability.id))
          if (!m) {
            rc.push({ name: capability.name, value: capability.id })
          }
        }
      }
      return rc
    },
    allowNewCapability: function() {
      return !!this.request_capability_options.length
    },
    allowSaveRequestCapability: function() {
      return !!(this.newRequestCapability && this.newRequestCapability.value)
    },
    outputs: function() {
      const o = []
      if (this.service && this.service.outputs && this.service.outputs.length) {
        const a = JSON.parse(JSON.stringify(this.service.outputs)) // decouple from bound model
        for (let index = 0; index < a.length; index++) {
          const output = a[index]
          if (output.children === undefined) {
            output.children = []
          }
          if (parseInt(output.parent_id) !== 0) {
            const parent = a.find(element => parseInt(element.id) === parseInt(output.parent_id))
            if (parent.children === undefined) {
              parent.children = []
            }
            parent.children.push(output)
          } else {
            o.push(output)
          }
        }
      }
      return o
    },
    service_lines: function() {
      let o = []
      if (this.service && this.service.service_lines && this.service.service_lines.length) {
        o = this.service.service_lines
      }
      return o
    },
    programmes: function() {
      let o = []
      if (this.service && this.service.programmes && this.service.programmes.length) {
        o = this.service.programmes
      }
      return o
    },
    projects: function() {
      let o = []
      if (
        this.service &&
        this.service.contract &&
        this.service.contract.projects &&
        this.service.contract.projects.length
      ) {
        o = this.service.contract.projects
      }
      return o
    },
    purchase_orders: function() {
      let po = []
      if (this.service && this.service.purchase_orders && this.service.purchase_orders.length) {
        po = this.service.purchase_orders
      }
      return po
    },
    request: function() {
      return this.$store.getters["contract/getRequest"]
    },
    engagements: function() {
      if (this.request && this.request.consultant_engagements && this.request.consultant_engagements.length) {
        return this.request.consultant_engagements
      }
      return []
    },
    available_delivery_models: function() {
      const a = this.$store.getters["admin/getDeliveryModels"]
      const filteredArray = []
      if (a.length && this.delivery_models.length) {
        for (let index = 0; index < a.length; index++) {
          const element = a[index]
          const match = this.delivery_models.find(item => item.name === element.name)
          if (!match) {
            filteredArray.push(element)
          }
        }
        return filteredArray
      } else {
        return a
      }
    },
    available_financial_models: function() {
      const a = this.$store.getters["admin/getFinancialModels"]
      const filteredArray = []
      if (a.length && this.financial_models.length) {
        for (let index = 0; index < a.length; index++) {
          const element = a[index]
          const match = this.financial_models.find(item => item.name === element.name)
          if (!match) {
            filteredArray.push(element)
          }
        }
        return filteredArray
      } else {
        return a
      }
    },
    delivery_models: function() {
      const o = []
      if (this.service && this.service.delivery_models && this.service.delivery_models.length) {
        const a = this.service.delivery_models
        for (let index = 0; index < a.length; index++) {
          const option = a[index]
          o.push({ id: option.id, delivery_model_id: option.delivery_model_id, name: option.delivery_model.name })
        }
      }
      return o
    },
    financial_models: function() {
      const o = []
      if (this.service && this.service.financial_models && this.service.financial_models.length) {
        const a = this.service.financial_models
        for (let index = 0; index < a.length; index++) {
          const option = a[index]
          o.push({ id: option.id, financial_model_id: option.financial_model_id, name: option.financial_model.name })
        }
      }
      return o
    },
    is_vendor_admin: function() {
      if (this.is_super_admin) {
        return true
      }
      return this.user && this.user.roles && this.user.roles.indexOf("vendor_admin") > -1
    },
    vendor: function() {
      return this.contract ? this.contract.vendor : null
    },
    vendorDashboardLink: function() {
      return "/vendor/" + this.contract.vendor.id
    },
    vendorContractsLink: function() {
      return "/vendor/" + this.contract.vendor.id + "/contracts"
    },
    contractLink: function() {
      return "/vendor/" + this.contract.vendor.id + "/contracts/" + this.contract_id
    },
    serviceLink: function() {
      return "/vendor/" + this.contract.vendor.id + "/contracts/" + this.contract_id + "/services/" + this.service_id
    },
    vendor_access: function() {
      // const v = this.$store.getters['vendor/getVendors']
      // this.contract.vendorUsers
      return []
    },
    vendor_users: function() {
      const u = this.$store.getters["vendor/getUsersByVendor"](this.vendor_id)
      const users = []
      if (Array.isArray(u) && u.length > 0) {
        for (let index = 0; index < u.length; index++) {
          const element = u[index]
          users.push({ id: element.user.id, name: element.user.first_name + " " + element.user.last_name })
        }
      }
      return users
    },
    customer_users: function() {
      let u = []
      const users = []
      if (this.contract && this.contract.customer && this.contract.customer.id) {
        u = this.$store.getters["admin/getUsersByCustomer"](this.contract.customer.id)
        if (Array.isArray(u) && u.length > 0) {
          for (let index = 0; index < u.length; index++) {
            const element = u[index]
            users.push({
              id: element.user.id,
              name: element.user.first_name + " " + element.user.last_name,
              email: element.user.email,
              phone: element.user.phone
            })
          }
        }
      }
      return users
    },
    is_authorised: function() {
      const result = this.vendor_access.find(obj => parseInt(obj.id) === parseInt(this.vendor_id))
      if (result) {
        return true
      }
      return true
    },
    is_super_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("super_admin") > -1
    }
  },
  watch: {
    service: function(newVal) {
      if (newVal) {
        this.setLocalData()
      }
    },
    contract: function(newVal) {
      if (newVal) {
        this.getCustomerUsers()
        this.getConsultants()
      }
    },
    request: function(newVal) {
      if (newVal) {
        this.localData.isGood = true
      }
    }
  },
  mounted() {
    // this.getContracts()
    this.setLocalData()
    this.getContract()
    this.getVendorUsers()
    // this.getCustomerUsers()
    this.getService()
    this.getRequest()
    this.getAllEngagementTypes()
    this.getAllFinancialModels()
    this.getConsultants()

    if (this.service) {
      this.setLocalData()
    }
    this.getCompetencies()
  },
  methods: {
    getCompetencies: function(force) {
      if (this.competencies.length < 1 || force) {
        const obj = { call: "competencies", method: "get" }
        this.$store.dispatch("admin/datacallDt", obj)
      }
    },
    getAllEngagementTypes: function(force) {
      if (this.available_delivery_models.length < 1 || force) {
        const obj = { data: this.newItem, call: "deliverymodels", method: "get" }
        this.$store.dispatch("admin/datacallDt", obj)
      }
    },
    getAllFinancialModels: function(force) {
      if (this.available_delivery_models.length < 1 || force) {
        const obj = { data: this.newItem, call: "financialmodels", method: "get" }
        this.$store.dispatch("admin/datacallDt", obj)
      }
    },
    getVendorUsers: function() {
      return this.contract.vendorUsers
    },
    getContracts: function(force) {
      if (this.contracts.length < 1 || force) {
        this.$store.dispatch("vendor/getVendorContracts", this.vendor_id)
      }
    },
    getContract: function() {
      this.$store.dispatch("contract/viewContract", this.contract_id)
    },
    getConsultants: function(force) {
      if ((this.consultants && this.consultants.length < 1) || force) {
        if (this.contract.vendor) {
          this.$store.dispatch("vendor/getVendorConsultants", this.contract.vendor.id)
        }
      }
    },
    getCustomerUsers: function() {
      if (this.is_super_admin && this.contract && this.contract.customer && this.contract.customer.id) {
        //TODO This shouldn't be using the admin store
        this.$store.dispatch("admin/getCustomerUsers", this.contract.customer.id)
      }
    },
    getService: function() {
      this.$store.dispatch(
        "contract/service",
        { method: "get", id: this.service_id }
      )
    },
    getRequest: function() {
      this.$store.dispatch("contract/viewRequest", this.request_id)
    },
    /* Refreshes service child options but not direct service data */
    refreshService: function() {
      this.getService()
    },
    refreshRequest: function() {
      this.getRequest()
    },
    setLocalData: function() {
      this.localData = {
        isGood: false
      }
    },
    saveNewRequestCapability: function() {
      if (this.allowSaveRequestCapability) {
        const data = { request_id: this.request_id, capability_id: this.newRequestCapability.value }
        const obj = { data: data, call: "requestcapabilities", method: "post" }
        this.$store.dispatch("admin/datacallDt", obj).then(() => {
          this.newRequestCapability = null
          this.showNewCapabilityForm = false
          this.getRequest()
        }).catch(e => {
          if (e.response && e.response.data && e.response.data.error) {
            this.$store.dispatch(
              "auth/setDataCallNotice",
              { show: true, title: "Data call error", message: e.response.data.error }
            )
          } else {
            this.$store.dispatch(
              "auth/setDataCallNotice",
              { show: true, title: "Data call error", message: e }
            )
          }
        })
      }
    },
    deleteRequestCapability: function(id) {
      const obj = { call: "requestcapabilities", method: "delete", id: id, vendor_id: this.vendor_id }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        this.getRequest()
      }).catch(e => {
        if (e.response && e.response.data && e.response.data.error) {
          this.$store.dispatch(
            "auth/setDataCallNotice",
            { show: true, title: "Data call error", message: e.response.data.error }
          )
        } else {
          this.$store.dispatch(
            "auth/setDataCallNotice",
            { show: true, title: "Data call error", message: e }
          )
        }
      })
    },
    editEngagement: function(id) {
      this.selectedEngagement = this.engagements.find(elem => parseInt(elem.id) === parseInt(id))
      this.showEditEngagement = true
    }
  }
})
</script>
