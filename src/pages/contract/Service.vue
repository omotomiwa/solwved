<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div v-if="contract" class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Service Builder</div>
      <BreadCrumb align="center" :organisation="organisation" v-if="organisation" />
      <div v-if="contract && localData && isAdminAuthorised && isLoaded" class="q-mt-lg">
        <div class="row">
          <div class="column col">
            <div class="text-weight-bold">Contract Reference</div>
            <div v-if="contract.reference">
              {{ contract.reference }}
            </div>
          </div>
          <div class="column col">
            <div class="text-weight-bold">Vendor</div>
            <div v-if="contract.vendor">
              {{ contract.vendor.name }}
            </div>
          </div>
          <div class="column col">
            <div class="text-weight-bold">Customer</div>
            <div v-if="contract.customer">
              {{ contract.customer.name }}
            </div>
          </div>
        </div>
        <div v-if="service !== false">
          <div class="group">
            <div class="row items-end justify-between q-mt-lg">
              <div class="text-h4">Service Builder</div>
              <q-toggle
                v-if="localData.delivery_model_id > 2 && localData.approved === 0"
                v-model="localData.ready_for_approval"
                :label="customer_id ? 'Ready for vendor approval' : 'Ready for buyer approval'"
                checked-icon="check"
                unchecked-icon="clear"
                color="primary"
                icon-color="dark"
                :false-value="0"
                :true-value="1"
                @update:model-value="setReadyForApproval"
              />
              <div v-else-if="localData.delivery_model_id > 2 && localData.approved === 1">
                <div class="row items-center">
                  <q-icon name="check" color="primary" size="md" />
                  <div>Service approved by Buyer</div>
                </div>
              </div>
            </div>
            <div class="row q-col-gutter-md q-mt-lg items-center">
              <q-input
                v-model="localData.name"
                class="col-xs-12 col-sm-6 col-md-4 col-lg-3"
                outlined
                :readonly="!isEditingService"
                stack-label
                label-color="white"
                color="primary"
                type="text"
                label="Name"
              />
              <q-input
                v-if="isEditingService"
                v-model="localData.lot"
                class="col-xs-6 col-sm-3 col-md-2 col-lg-2"
                outlined
                stack-label
                label-color="white"
                color="primary"
                type="text"
                label="Lot"
                placeholder="n/a"
              />
              <q-field
                v-else
                class="col-xs-6 col-sm-3 col-md-2 col-lg-2"
                outlined
                readonly
                hide-bottom-space
                label="Lot"
                stack-label
                label-color="white"
                color="primary"
              >
                <template #control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    {{ service.lot === null ? "n/a" : service.lot }}
                  </div>
                </template>
              </q-field>
              <currency-input
                v-if="isEditingService && service.delivery_model_id < 3"
                label="Value"
                v-model="localData.value"
                class="col-xs-6 col-sm-3 col-md-2 col-lg-2"
                :prefix="currency_symbol"
              />
              <q-field
                v-else
                class="col-xs-6 col-sm-3 col-md-2 col-lg-2"
                outlined
                readonly
                label-color="white"
                color="primary"
                hide-bottom-space
                label="Value"
                stack-label
              >
                <template #control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    {{ service_value }}
                  </div>
                </template>
                <q-tooltip
                  v-if="isEditingService"
                  anchor="top middle"
                  self="bottom middle"
                  class="row align-center"
                  :offset="[10, 10]"
                  :delay="250"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-icon name="tips_and_updates" size="xs" class="q-mr-sm" />
                  <span>To change the service budget, edit the Purchase Order below</span>
                </q-tooltip>
              </q-field>
              <new-selector-form
                v-if="delivery_model_options"
                v-model:option_id="localData.delivery_model_id"
                :options="delivery_model_options"
                label="Delivery Model"
                disabled
                classes="col-xs-12 col-sm-6 col-md-4 col-lg-2"
                default-class="w-content"
                is-filterable
                filter-key="name"
              />
              <new-selector-form
                v-if="financial_model_options"
                v-model:option_id="localData.financial_model_id"
                :options="financial_model_options"
                label="Financial Model"
                :disabled="!isEditingService"
                classes="col-xs-12 col-sm-6 col-md-4 col-lg-3"
                default-class="w-content"
                is-filterable
                filter-key="name"
              />
              <q-input
                v-model="localData.start_date"
                class="col-xs-6 col-sm-6 col-md-4 col-lg-2"
                outlined
                :readonly="!isEditingService || service.delivery_model_id > 2"
                type="text"
                label="Start Date"
                :mask="Config.DATE_MASK"
                hide-bottom-space
                stack-label
                :rules="[checkDate]"
              >
                <q-tooltip
                  v-if="isEditingService"
                  anchor="top middle"
                  self="bottom middle"
                  class="row align-center"
                  :offset="[10, 10]"
                  :delay="250"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-icon name="tips_and_updates" size="xs" class="q-mr-sm" />
                  <span>
                    To change the service start date, edit the Purchase Order below
                  </span>
                </q-tooltip>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer" v-if="isEditingService">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                      ref="startDatePopup"
                    >
                      <q-date
                        first-day-of-week="1"
                        v-model="localData.start_date"
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
                v-model="localData.end_date"
                class="col-xs-6 col-sm-6 col-md-4 col-lg-2"
                outlined
                :readonly="!isEditingService || service.delivery_model_id > 2"
                type="text"
                label="End Date"
                :mask="Config.DATE_MASK"
                hide-bottom-space
                stack-label
                :rules="[checkDate]"
              >
                <q-tooltip
                  v-if="isEditingService"
                  anchor="top middle"
                  self="bottom middle"
                  class="row align-center"
                  :offset="[10, 10]"
                  :delay="250"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-icon name="tips_and_updates" size="xs" class="q-mr-sm" />
                  <span>
                    To change the service end date, edit the Purchase Order below
                  </span>
                </q-tooltip>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer" v-if="isEditingService">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                      ref="endDatePopup"
                    >
                      <q-date
                        first-day-of-week="1"
                        v-model="localData.end_date"
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

              <div class="col-xs-12 col-sm-6 col-md-3 col-lg-2">
                <div class="q-py-sm rounded-borders"
                     :class="$q.dark.isActive ? 'field-bg-dark' : 'field-bg-light'"
                >
                  <q-toggle
                    :label="localData.has_competency ? 'SFIA' : 'No Competency'"
                    color="primary"
                    v-model="localData.has_competency"
                    :disable="!isEditingService"
                  />
                </div>

              </div>

              <new-selector-form
                v-model:option_id="localData.customer_owner_id"
                :readonly="!isEditingService"
                :disabled="!isEditingService"
                classes="col-xs-12 col-sm-6 col-md-4 col-lg-3"
                :options="contract.customerUsers"
                default-class="w-content"
                is-filterable
                filter-key="fullName"
                option-label="fullName"
                label="Service Owner"
              />
              <new-selector-form
                v-model:option_id="localData.vendor_owner_id"
                :readonly="!isEditingService"
                :options="contract.vendorUsers"
                :disabled="!isEditingService"
                classes="col-xs-12 col-sm-6 col-md-4 col-lg-3"
                default-class="w-content"
                is-filterable
                filter-key="fullName"
                option-label="fullName"
                label="Service Delivery Manager"
              />
              <div class="col-xs-12 col-sm-12 col-md">
                <div class="flex grid-col-gap-2 justify-end">
                  <q-btn
                    v-if="!isEditingService"
                    label="Edit"
                    color="primary"
                    text-color="dark"
                    size="md"
                    :disable="!allowSave"
                    @click="editService"
                  />
                  <q-btn
                    v-if="isEditingService"
                    label="Save"
                    color="primary"
                    text-color="dark"
                    size="md"
                    @click="saveService"
                  />
                  <q-btn
                    v-if="isEditingService"
                    class="q-ml-sm"
                    label="Cancel"
                    color="white"
                    outline
                    size="md"
                    @click="cancelServiceChange"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="group q-mt-xl q-mb-xl">
            <div v-if="isSinglePurchaseOrderService">
              <div class="text-h6">Purchase Order Details</div>
              <service-property-editor
                :badge="badge"
                :data="purchase_orders"
                :service-id="parseInt(service_id)"
                :service="service"
                data-call="purchaseorders"
                property-type="purchase_order"
                :capabilities="capabilities"
                :can-breakdown-purchase-orders="canBreakdownPurchaseOrders"
                :single-item-only="isSinglePurchaseOrderService"
                :show-purchase-order-totals="false"
                @service-update="refreshService"
              />
            </div>
            <div class="row items-center justify-end q-mb-md">
              <q-btn-dropdown
                color="primary"
                outline
                label="Apply template"
                class="q-mr-sm"
              >
                <q-list>
                  <q-item
                    v-for="template in serviceTemplates"
                    :key="template.id"
                    clickable
                    v-close-popup
                    @click="onSelectTemplate(template)"
                  >
                    <q-item-section>
                      <q-item-label>{{ template.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-btn
                label="Save as template"
                color="primary"
                outline
                @click="saveAsTemplateDialogue = true"
              />
            </div>
            <q-list separator class="rounded-borders">
              <q-expansion-item
                v-if="showServiceLines"
                switch-toggle-side
                expand-separator
                :label="categoryLabel"
                caption="Click to list / edit"
                header-class="accordion-header q-mb-md"
              >
                <service-property-editor
                  :badge="badge"
                  :data="service_lines"
                  :service-id="parseInt(service_id)"
                  data-call="servicelines"
                  :new-item-label="service.delivery_model.id === 2 ? 'New Service Line' : 'New Category'"
                  child-data-call="servicelines"
                  new-item-parent-property="service_name_id"
                  @service-update="refreshService"
                />
              </q-expansion-item>
              <q-expansion-item
                switch-toggle-side
                label="Deliverables"
                caption="Click to list / edit"
                header-class="accordion-header q-mb-md"
              >
                <service-property-editor
                  :badge="badge"
                  :data="outputs"
                  :service-id="parseInt(service_id)"
                  data-call="outputs"
                  property-type="with_children"
                  child-property="children"
                  child-label="Sub Deliverables"
                  new-item-label="New Deliverable"
                  new-child-item-label="New Sub Deliverable"
                  child-data-call="outputs"
                  new-item-parent-property="parent_id"
                  @service-update="refreshService"
                />
              </q-expansion-item>
              <q-expansion-item
                switch-toggle-side
                expand-separator
                :label="capabilityOutcomeLabel"
                caption="Click to list / edit"
                header-class="accordion-header q-mb-md"
              >
                <service-property-editor
                  :badge="badge"
                  :data="capabilities"
                  access-type="admin"
                  :service-id="parseInt(service_id)"
                  data-call="capabilities"
                  new-item-label="New Capability"
                  property-type="with_children"
                  child-type="selector"
                  child-property="deliverables"
                  :child-options="outputs"
                  child-label="Deliverables"
                  new-child-item-label="Assign Deliverable"
                  child-data-call="capabilityoutputs"
                  new-item-parent-property="capability_id"
                  has-multiple-selector
                  @service-update="refreshService"
                />
              </q-expansion-item>
              <q-expansion-item
                v-if="!isSinglePurchaseOrderService"
                switch-toggle-side
                expand-separator
                label="Purchase Orders"
                caption="Click to list / edit"
                header-class="accordion-header q-mb-md"
              >
                <service-property-editor
                  :badge="badge"
                  :data="purchase_orders"
                  :service-id="parseInt(service_id)"
                  :service="service"
                  data-call="purchaseorders"
                  property-type="purchase_order"
                  :capabilities="capabilities"
                  new-item-label="New Purchase Order"
                  :can-breakdown-purchase-orders="canBreakdownPurchaseOrders"
                  @service-update="refreshService"
                />
              </q-expansion-item>
            </q-list>
          </div>
        </div>
      </div>
      <div v-else-if="isLoaded" class="q-my-lg">You are not authorised to view this page</div>
    </div>
    <q-dialog v-model="saveAsTemplateDialogue" no-backdrop-dismiss>
      <save-template-dialogue
        :service-id="service_id"
        :organisation-id="organisation.id"
        @close="saveAsTemplateDialogue = false"
      />
    </q-dialog>
    <q-dialog v-model="applyTemplateDialogue" no-backdrop-dismiss>
      <apply-service-template-dialogue
        :service-id="service_id"
        :template-id="selectedServiceTemplate.id"
        :template-name="selectedServiceTemplate.name"
        :organisation-id="organisation.id"
        @close="applyTemplateDialogue = false"
        @update="reloadService"
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
import { defineComponent, ref } from "vue"
import { ClassCombinations, Config, RulesRegex } from "src/modules/StaticData.js"
import { customerAuth, vendorAuth } from "src/modules/AuthLogic.js"
import { CurrencyMethods, DateMethods } from "src/modules/GlobalMethods.js"
import ServicePropertyEditor from "src/components/ServicePropertyEditor.vue"
import ApplyServiceTemplateDialogue from "src/components/ApplyServiceTemplateDialogue.vue"
import NewSelectorForm from "src/components/NewSelectorForm.vue"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import SaveTemplateDialogue from "src/components/SaveTemplateDialogue.vue"
import CurrencyInput from "src/components/CurrencyInput.vue"

export default defineComponent({
  name: "Service",
  components: {
    ServicePropertyEditor,
    NewSelectorForm,
    BreadCrumb,
    SaveTemplateDialogue,
    ApplyServiceTemplateDialogue,
    CurrencyInput
  },
  props: ["vendor_id", "customer_id", "contract_id", "service_id"],
  data() {
    return {
      customer: null,
      localData: {
        has_competency: false
      },
      isEditingService: false,
      saveDataResponse: false,
      saveDataMessage: "",
      organisation: null,
      isAdminAuthorised: false,
      saveAsTemplateDialogue: false,
      applyTemplateDialogue: false,
      serviceTemplates: [],
      selectedServiceTemplate: {
        id: null,
        name: null
      },
      isLoaded: false
    }
  },
  setup() {
    const startDatePopup = ref(null)
    const endDatePopup = ref(null)

    const closeStartDatePopup = () => {
      startDatePopup.value.hide()
    }
    const closeEndDatePopup = () => {
      endDatePopup.value.hide()
    }

    return {
      startDatePopup,
      endDatePopup,

      closeStartDatePopup,
      closeEndDatePopup,

      ClassCombinations,
      Config
    }
  },
  computed: {
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    badge: function() {
      return this.$store.getters["auth/getBadge"]
    },
    contract: function() {
      return this.$store.getters["contract/getContract"]
    },
    service: function() {
      return this.$store.getters["contract/getServicesById"](this.service_id)
    },
    isSinglePurchaseOrderService: function() {
      return this.service.delivery_model.id === 3 || this.service.delivery_model.id === 4
    },
    showServiceLines: function() {
      return !(this.service.delivery_model.id === 3 || this.service.delivery_model.id === 4)
    },
    categoryLabel: function() {
      return this.service.delivery_model.id === 2 ? "Service Lines" : "Categories"
    },
    vendor: function() {
      return this.contract ? this.contract.vendor : null
    },
    capabilityOutcomeLabel: function() {
      return this.localData.delivery_model_id <= 2 ? "Capabilities" : "Capabilities"
    },
    service_value: function() {
      return CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, this.service.value)
    },
    currency_symbol: function() {
      return this.organisation?.currency?.symbol ?? Config.CURRENCY_SYMBOL
    },
    canBreakdownPurchaseOrders: function() {
      // ONLY SOW AND WP delivery models can have PO Breakdowns
      return this.localData.delivery_model_id >= 3
    },
    capabilities: function() {
      const c = []
      if (this.service && this.service.capabilities && this.service.capabilities.length) {
        const a = JSON.parse(JSON.stringify(this.service.capabilities))
        for (let index = 0; index < a.length; index++) {
          const capability = a[index]
          if (capability.capability_outputs && capability.capability_outputs.length) {
            const deliverables = []
            for (let j = 0; j < capability.capability_outputs.length; j++) {
              const output = capability.capability_outputs[j]
              const obj = {
                id: output.id,
                capability_id: output.capability_id,
                output_id: output.output_id,
                name: output.output.name
              }
              deliverables.push(obj)
            }
            capability.deliverables = deliverables
          }
          c.push(capability)
        }
        // need to add 'deliverables' key to each item
      }
      return c
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
            // find the item
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
      return this.service?.service_lines || []
    },
    programmes: function() {
      return this.service?.programmes || []
    },
    projects: function() {
      return this.service?.projects || []
    },
    purchase_orders: function() {
      return this.service?.purchase_orders || []
    },
    requests: function() {
      return this.service?.requests || []
    },
    delivery_model_options: function() {
      return this.$store.getters["admin/getDeliveryModels"]
    },
    financial_model_options: function() {
      return this.$store.getters["admin/getFinancialModels"]
    },
    vendor_users: function() {
      let u = []
      const users = []
      if (this.contract && this.contract.vendor && this.contract.vendor.id) {
        u = this.$store.getters["admin/getUsersByVendor"](this.contract.vendor.id)
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
    is_super_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("super_admin") > -1
    },
    allowSave: function() {
      return !(this.localData.name && this.localData.name.trim().length < 2)
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
        this.getVendorUsers()
        this.getCustomerUsers()
      }
    },
    organisation: function(newVal) {
      if (newVal && newVal.id) {
        this.getServiceTemplates()
      }
    }
  },
  created() {
    if (this.vendor_id) {
      this.organisation = vendorAuth(this.vendor_id).vendor
      this.isAdminAuthorised = vendorAuth(this.vendor_id).isAdminAuthorised
    } else if (this.customer_id) {
      this.organisation = customerAuth(this.customer_id).customer
      this.isAdminAuthorised = customerAuth(this.customer_id).isAdminAuthorised
    }
  },
  mounted() {
    this.getContract()
    // this.getVendorUsers()
    // this.getCustomerUsers()
    this.getService()
    this.getAllEngagementTypes()
    this.getAllFinancialModels()

    if (this.service) {
      this.setLocalData()
    }
  },
  methods: {
    checkDate: function(val) {
      if ((val ?? "").trim().length > 0 && !RulesRegex.date.test(DateMethods.convertDateFormat(val))) {
        return "Please enter the valid date"
      }
      return true
    },
    reloadService: function() {
      this.getService(true)
      this.applyTemplateDialogue = false
    },
    onSelectTemplate: function(template) {
      this.selectedServiceTemplate.id = template.id
      this.selectedServiceTemplate.name = template.name
      this.applyTemplateDialogue = true
    },
    getAllEngagementTypes: function(force) {
      if (this.delivery_model_options.length < 1 || force) {
        const obj = {
          data: this.newItem,
          call: "deliverymodels",
          method: "get"
        }
        this.$store.dispatch("admin/datacallDt", obj)
      }
    },
    getAllFinancialModels: function(force) {
      if (this.delivery_model_options.length < 1 || force) {
        const obj = {
          data: this.newItem,
          call: "financialmodels",
          method: "get"
        }
        this.$store.dispatch("admin/datacallDt", obj)
      }
    },
    getVendorUsers: function() {
      if (this.is_super_admin && this.contract && this.contract.vendor && this.contract.vendor.id) {
        this.$store.dispatch("admin/getVendorUsers", this.contract.vendor.id)
      }
    },
    getCustomerUsers: function() {
      if (this.is_super_admin && this.contract && this.contract.customer && this.contract.customer.id) {
        this.$store.dispatch("admin/getCustomerUsers", this.contract.customer.id)
      }
    },
    getContract: function() {
      this.$store.dispatch("contract/viewContract", this.contract_id)
    },
    getService: function(update = false) {
      this.isLoaded = update
      this.$q.loading.show()
      this.$store.dispatch(
        "contract/service",
        { method: "get", id: this.service_id }
      ).then(() => {
        this.$q.loading.hide()
        this.isLoaded = true
      }).catch(() => {
        this.isLoaded = true
      })
    },
    getServiceTemplates: function() {
      this.$store.dispatch("contract/getServiceTemplates", this.organisation.id).then(response => {
        if (response.data && response.data.length) {
          this.serviceTemplates = []
          this.serviceTemplates.push(...response.data)
        } else {
          this.serviceTemplates = []
        }
      })
    },
    refreshService: function() {
      this.getService(true)
    },
    setLocalData: function() {
      this.localData = {
        contract_id: null,
        name: this.service.name,
        lot: this.service.lot,
        value: Math.round(this.service.value),
        delivery_model_id: this.service.delivery_model_id,
        financial_model_id: this.service.financial_model_id,
        start_date: this.service.start_date,
        end_date: this.service.end_date,
        customer_owner_id: this.service.customer_owner_id,
        vendor_owner_id: this.service.vendor_owner_id,
        ready_for_approval: this.service.ready_for_approval,
        approved: this.service.approved,
        has_competency: this.service.has_competency
      }
    },
    editService: function() {
      this.isEditingService = true
    },
    saveService: function() {
      this.isEditingService = false
      if (this.localData.lot !== null && this.localData.lot.trim() === "") {
        this.localData.lot = null
      }
      if (this.allowSave) {
        this.localData.contract_id = this.contract_id
        this.localData._method = "patch"
        const obj = {
          data: this.localData,
          id: this.service_id,
          method: "patch"
        }
        this.$store.dispatch("admin/service", obj).then(() => {
          this.getService(true)
        }).catch(e => {
          alert(e.data.message || e.statusText)
        })
      }
    },
    setReadyForApproval: function() {
      this.localData.contract_id = this.contract_id
      this.localData._method = "patch"
      const obj = {
        data: {
          ready_for_approval: this.localData.ready_for_approval
        },
        id: this.service_id,
        method: "patch"
      }
      this.$store.dispatch("admin/service", obj).then(() => {
        // no needed
      }).catch(e => {
        alert(e.data.message || e.statusText)
      })
    },
    cancelServiceChange: function() {
      this.isEditingService = false
      this.setLocalData()
    }
  }
})
</script>

<style lang="scss" scoped>
.super {
  color: white;
  background-color: $negative;
}

.admin {
  color: $dark;
  background-color: $swlvd-green;
}

.consultant {
  color: $dark;
  background-color: $warning;
}

.vendor {
  color: $dark;
  background-color: $swlvd-yellow;
}

.customer {
  color: white;
  background-color: $accent;
}
</style>
