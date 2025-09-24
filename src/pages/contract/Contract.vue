<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Contract</div>
      <BreadCrumb align="center" :organisation="organisation" v-if="organisation" />
      <div v-if="contract && contract.id && isAdminAuthorised && isLoaded">
        <div class="text-h3 text-weight-bold q-py-lg text-white">
          <div class="row q-mt-lg text-h4">Contract Manager</div>
          <div class="row q-col-gutter-md q-mt-lg col">
            <q-input
              v-model="localData.reference"
              class="col-xs-12 col-sm-6 col-md"
              :readonly="!isEditingContract"
              stack-label
              outlined
              label-color="white"
              color="primary"
              type="text"
              label="Reference"
            />
            <CurrencyInput
              v-if="isEditingContract"
              label="Value"
              v-model="localData.value"
              class="col-xs-12 col-sm-6 col-md"
              :prefix="currency_symbol"
            />
            <q-field
              v-else
              class="col-xs-12 col-sm-6 col-md"
              outlined
              readonly
              hide-bottom-space
              label-color="white"
              color="primary"
              label="Value"
              stack-label
            >
              <template #control>
                <div class="self-center full-width no-outline" tabindex="0">
                  {{ contract_value }}
                </div>
              </template>
            </q-field>
            <q-input
              v-model="localData.startDate"
              class="col-xs-12 col-sm-6 col-md"
              outlined
              :readonly="!isEditingContract"
              type="text"
              label="Start Date"
              :mask="Config.DATE_MASK"
              stack-label
              :rules="[checkDate]"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" v-if="isEditingContract">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale" ref="startDatePopup">
                    <q-date
                      first-day-of-week="1"
                      v-model="localData.startDate"
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
              v-model="localData.endDate"
              class="col-xs-12 col-sm-6 col-md"
              outlined
              :readonly="!isEditingContract"
              type="text"
              label="End Date"
              :mask="Config.DATE_MASK"
              stack-label
              :rules="[checkDate]"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" v-if="isEditingContract">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale" ref="endDatePopup">
                    <q-date
                      first-day-of-week="1"
                      v-model="localData.endDate"
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
            <div class="col-xs-12 col-sm-6 col-md q-px-lg">
              <q-btn
                v-if="!isEditingContract"
                label="Edit"
                class="q-ml-xs-none q-ml-sm-sm"
                color="primary"
                text-color="dark"
                size="md"
                :disable="!allowSave"
                @click="editContract"
              />
              <q-btn
                v-else
                label="Save"
                class="q-ml-xs-none q-ml-sm-sm"
                color="primary"
                text-color="dark"
                size="md"
                @click="saveContractValues"
              />
            </div>
          </div>
        </div>
        <div>
          <div class="row">
            <q-card flat bordered class="col column justify-start">
              <q-card-section>
                <div class="text-h5 text-primary">Vendor</div>
                <div v-if="contract.vendor.name" class="text-h6 text-weight-bold">
                  {{ contract.vendor.name }}
                </div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div class="text-h6 text-primary q-mb-sm">Contract Owner</div>
                <div class="row items-center">
                  <div>Name:</div>
                  <div class="text-weight-bold q-ml-sm">
                    <new-selector-form
                      v-model:option_id="localData.vendor_owner_id"
                      :options="contract.vendorUsers"
                      option-label="fullName"
                      is-border-less
                      is-filterable
                      filter-key="fullName"
                      label=""
                      default-class="w-content"
                    />
                  </div>
                  <div>
                    <q-btn
                      v-if="vendorOwnerChange && !savingVendorOwner"
                      size="sm"
                      class="q-ml-xs-none q-ml-sm"
                      color="primary"
                      text-color="dark"
                      label="Save Change"
                      @click="saveVendorOwner"
                    />
                    <q-btn
                      v-if="vendorOwnerChange && !savingVendorOwner"
                      size="sm"
                      label="Cancel"
                      class="q-ml-sm"
                      color="white"
                      outline
                      @click="cancelVendorOwnerChange"
                    />
                    <div v-if="savingVendorOwner"
                         class="text-white bg-positive q-pl-xs q-pr-sm q-ml-md row items-center"
                    >
                      <q-spinner color="white" size="1em" />
                      <div class="q-pl-xs">Saving</div>
                    </div>
                  </div>
                </div>
                <div v-if="contract.vendor_contract_owner">
                  <div>
                    Email:
                    <a :href="'mailto:' + contract.vendor_contract_owner.email">
                      <span>
                        {{ contract.vendor_contract_owner.email }}
                      </span>
                    </a>
                  </div>
                  <div>
                    Phone:
                    <a :href="'tel:' + contract.vendor_contract_owner.phone">
                      <span>
                        {{ contract.vendor_contract_owner.phone }}
                      </span>
                    </a>
                  </div>
                </div>
              </q-card-section>
            </q-card>
            <q-card flat bordered class="col column justify-start relative-position">
              <q-card-section>
                <div class="text-h5 text-primary">Customer</div>
                <div class="text-h6 text-weight-bold">
                  {{ contract.customer.name }}
                </div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div class="text-h6 text-primary">Contract Owner</div>
                <div class="row items-center">
                  <div>Name:</div>
                  <div class="text-weight-bold q-ml-sm">
                    <new-selector-form
                      v-model:option_id="localData.customer_owner_id"
                      :options="contract.customerUsers"
                      option-label="fullName"
                      is-border-less
                      is-filterable
                      filter-key="fullName"
                      label=""
                      default-class="w-content"
                    />
                  </div>
                  <div>
                    <q-btn
                      v-if="customerOwnerChange && !savingCustomerOwner"
                      size="sm"
                      class="q-ml-xs-none q-ml-sm"
                      color="primary"
                      text-color="dark"
                      label="Save Change"
                      @click="saveCustomerOwner"
                    />
                    <q-btn
                      v-if="customerOwnerChange && !savingCustomerOwner"
                      size="sm"
                      label="Cancel"
                      class="q-ml-sm"
                      color="white"
                      outline
                      @click="cancelCustomerOwnerChange"
                    />
                    <div v-if="savingCustomerOwner"
                         class="text-white bg-positive q-pl-xs q-pr-sm q-ml-md row items-center">
                      <q-spinner color="white" size="1em" />
                      <div class="q-pl-xs">Saving</div>
                    </div>
                  </div>
                </div>
                <div v-if="contract.customer_contract_owner">
                  <div>
                    Email:
                    <a :href="'mailto:' + contract.customer_contract_owner.email">
                      <span>
                        {{ contract.customer_contract_owner.email }}
                      </span>
                    </a>
                  </div>
                  <div>
                    Phone:
                    <a :href="'tel:' + contract.customer_contract_owner.phone">
                      <span>
                        {{ contract.customer_contract_owner.phone }}
                      </span>
                    </a>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <div class="q-mt-lg">
          <div class="text-h5 q-mt-lg q-mb-md">Contract Attachments</div>
          <div v-if="localData" class="row q-gutter-sm ">
            <div class="col">
              <multiple-media-widget v-model="contract.terms"
                                     :extra-data="terms"
                                     show-delete
                                     accept=".pdf,.doc,.docs"
                                     extensions=".pdf,.doc,.docs"
                                     @createMedia="onCreateMultipleMedia"
                                     @deleteMedia="onCreateMultipleMedia"
              />
            </div>
            <!-- <div class="col">
              <media-widget v-model="contract.services" @createMedia="onCreateMedia" />
            </div> -->
            <div class="col">
              <multiple-media-widget v-model="contract.rateCard"
                                     :extra-data="rateCard"
                                     show-delete
                                     accept=".pdf,.doc,.docs"
                                     extensions=".pdf,.doc,.docs"
                                     @createMedia="onCreateMultipleMedia"
                                     @deleteMedia="onCreateMultipleMedia"
              />
            </div>
          </div>

          <div class="group q-mt-xl q-mb-xl">
            <q-list separator class="rounded-borders">
              <q-expansion-item switch-toggle-side
                                expand-separator
                                label="Programmes"
                                caption="Click to list / edit"
                                header-class="accordion-header q-mb-md"
              >
                <q-list v-if="contract.programmes" bordered separator>
                  <q-item v-for="item in contract.programmes" :key="item.id">
                    <item-editor-with-child
                      :data="item"
                      child-property="projects"
                      child-type="selector"
                      child-label="Projects"
                      :child-options="projects"
                      new-item-label="Attach Project"
                      new-item-parent-property="project_id"
                      :new-item-parent-property-value="item.id"
                      child-data-call="projects"
                      @update="updateProgramme"
                      @delete="deleteProgramme"
                      @service-update="serviceUpdate"
                    />
                  </q-item>
                </q-list>
                <div v-if="addingNewProgramme" class="col-auto row items-center q-py-sm q-px-sm q-px-md-none">
                  <q-input
                    v-model="localData.newProgramme"
                    label="New Programme"
                    class="col"
                    dense
                    outlined
                    stack-label
                    label-color="white"
                    color="primary"
                    type="text"
                    @update:model-value="value => $emit('update:reference', value)"
                    @keyup.enter="saveNewProgramme"
                    autofocus
                  />
                  <q-btn
                    label="Save"
                    size="sm"
                    class="q-ml-sm"
                    color="primary"
                    text-color="dark"
                    @click="saveNewProgramme"
                  />
                  <q-btn
                    label="Cancel"
                    color="white"
                    outline
                    size="sm"
                    class="q-ml-sm"
                    @click="addingNewProgramme = false"
                  />
                </div>
                <div v-else class="q-py-md">
                  <q-btn
                    label="ADD NEW"
                    color="primary"
                    text-color="dark"
                    size="md"
                    @click="addingNewProgramme = true"
                  />
                </div>
              </q-expansion-item>
              <q-expansion-item
                switch-toggle-side
                expand-separator
                label="Projects"
                caption="Click to list / edit"
                header-class="accordion-header"
              >
                <q-list v-if="contract.projects" bordered separator>
                  <q-item v-for="item in contract.projects" :key="item.id">
                    <item-editor
                      :data="item"
                      label-property="name"
                      :allow-edit-label="true"
                      new-item-parent-property="id"
                      new-item-label="New Project"
                      item-delete-label="Delete"
                      @update="updateProject"
                      @edit="updateProject"
                      @delete="deleteProject"
                    />
                  </q-item>
                </q-list>
                <div v-if="addingNewProject" class="col-auto row items-center q-py-sm q-px-sm q-px-md-none">
                  <q-input
                    v-model="localData.newProject"
                    label="New Project"
                    class="col"
                    dense
                    outlined
                    stack-label
                    label-color="white"
                    color="primary"
                    type="text"
                    @keyup.enter="saveNewProject"
                    @update:model-value="value => $emit('update:reference', value)"
                    @update="serviceUpdate"
                    autofocus
                  />
                  <q-btn
                    label="Save"
                    size="sm"
                    class="q-ml-sm"
                    color="primary"
                    text-color="dark"
                    @click="saveNewProject"
                  />
                  <q-btn
                    label="Cancel"
                    color="white"
                    outline
                    size="sm"
                    class="q-ml-sm"
                    @click="addingNewProject = false"
                  />
                </div>
                <div v-else class="q-py-sm">
                  <q-btn
                    label="ADD NEW"
                    color="primary"
                    text-color="dark"
                    size="md"
                    @click="addingNewProject = true"
                  />
                </div>
              </q-expansion-item>
            </q-list>
          </div>

          <div>
            <div class="text-h5 q-mt-xl q-mb-sm">Contract Services</div>
            <services-table :services="services" :contract="contract" @edit="onEditService" />
            <q-btn
              v-show="!showNewServiceForm"
              label="New Contract Service"
              color="primary"
              text-color="dark"
              class="q-mt-md"
              size="md"
              :disable="remainingContractBudget <= 0"
              @click="createNewService"
            />
            <div v-if="showNewServiceForm">
              <div class="text-subtitle q-mt-lg">Create a new service</div>
              <NewServiceForm
                :organisation-id="organisation.id"
                :contract_id="contract.id"
                :contract="contract"
                @cancel="showNewServiceForm = false"
                @refresh="refreshContract"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="isLoaded">
        You are not authorised to view this page
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, nextTick, ref } from "vue"
import { ClassCombinations, Config, RulesRegex } from "src/modules/StaticData.js"
import { CurrencyMethods, DateMethods } from "src/modules/GlobalMethods.js"
import { customerAuth, vendorAuth } from "src/modules/AuthLogic.js"
import ServicesTable from "src/components/ServicesTable.vue"
import NewServiceForm from "src/components/NewServiceForm.vue"
import ItemEditor from "src/components/ItemEditor.vue"
import ItemEditorWithChild from "src/components/ItemEditorWithChild.vue"
import CurrencyInput from "src/components/CurrencyInput.vue"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"
import MultipleMediaWidget from "components/MultipleMediaWidget.vue"

export default defineComponent({
  name: "Contract",
  components: {
    MultipleMediaWidget,
    ServicesTable,
    NewServiceForm,
    ItemEditor,
    ItemEditorWithChild,
    CurrencyInput,
    BreadCrumb,
    NewSelectorForm
  },
  props: ["contract_id", "vendor_id", "customer_id"],
  emits: ["update:reference", "serviceUpdate"],
  data() {
    return {
      localData: {
        reference: "",
        vendor_id: "",
        customer_id: "",
        value: 0,
        startDate: null,
        endDate: null,
        newProgramme: "",
        newProject: ""
      },
      isEditingContract: false,
      showNewServiceForm: false,
      savingCustomerOwner: false,
      savingVendorOwner: false,
      newMedia: {
        id: null,
        organisation_id: null,
        name: "",
        model_id: 10,
        model: "contract",
        metadata: "ratecard",
        accept: ".pdf, .doc"
      },
      addingNewProgramme: false,
      addingNewProject: false,
      organisation: null,
      isAdminAuthorised: false,
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
    organisationDetail: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    rateCard: function() {
      return {
        organisation_id: this.organisationDetail.id,
        name: "ratecard",
        model_id: this.contract_id,
        model: "contract",
        metadata: "ratecard",
        accept: ".pdf, .doc"
      }
    },
    terms: function() {
      return {
        organisation_id: this.organisationDetail.id,
        name: "terms",
        model_id: this.contract_id,
        model: "contract",
        metadata: "terms",
        accept: ".pdf, .doc"
      }
    },
    contract_value: function() {
      return CurrencyMethods.toCurrencyFormat(this.organisationDetail?.currency?.code, this.contract.value)
    },
    currency_symbol: function() {
      return this.organisationDetail?.currency?.symbol ?? Config.CURRENCY_SYMBOL
    },
    vendorOwnerChange: function() {
      return this.localData.vendor_owner_id !== null &&
        parseInt(this.localData.vendor_owner_id) !== parseInt(this.contract.vendor_owner_id)
    },
    customerOwnerChange: function() {
      return this.localData.customer_owner_id !== null &&
        parseInt(this.localData.customer_owner_id) !== parseInt(this.contract.customer_owner_id)
    },
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    is_super_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("super_admin") > -1
    },
    contract: function() {
      return this.$store.getters["contract/getContract"]
    },
    services: function() {
      let s = []
      const contract = this.contract
      if (contract.services && contract.services.length) {
        s = contract.services
      }
      return s
    },
    remainingContractBudget: function() {
      let subTotal = 0
      if (Array.isArray(this.contract.services) && this.contract.services.length) {
        for (let index = 0; index < this.contract.services.length; index++) {
          const service = this.contract.services[index]
          subTotal += parseInt(service.value)
        }
      }
      let remainingBudget = this.contract.value - subTotal
      if (remainingBudget < 0) {
        remainingBudget = 0
      }
      return remainingBudget
    },
    vendor: function() {
      return this.contract ? this.contract.vendor : null
    },
    badge: function() {
      return this.$store.getters["auth/getBadge"]
    },
    allowSave: function() {
      if (
        (this.localData.reference.trim() !== "" && this.localData.reference.trim() !== this.contract.reference) ||
        this.localData.vendor_id !== this.contract.vendor_id ||
        this.localData.customer_id !== this.contract.customer_id
      ) {
        return true
      }
      return true
    },
    projects: function() {
      return this.contract.projects
    }
  },
  watch: {
    contract: function(newVal) {
      if (newVal) {
        this.setLocalData()
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
  },
  methods: {
    checkDate: function(val) {
      if ((val ?? "").trim().length > 0 && !RulesRegex.date.test(DateMethods.convertDateFormat(val))) {
        return "Please enter the valid date"
      }
      return true
    },
    startDateRule: function(val) {
      if (this.localData.endDate && val) {
        return val <= this.localData.endDate ? true : "Start date must be before end date"
      }
      return !!val
    },
    endDateRule: function(val) {
      if (this.localData.startDate && val) {
        return val >= this.localData.startDate ? true : "End date must be after start date"
      }
      return !!val
    },
    editContract: function() {
      this.isEditingContract = true
    },
    saveContractValues: async function() {
      this.updateContract("contract_values")
      await nextTick()
      this.cancelEditContract()
    },
    cancelEditContract: function() {
      this.isEditingContract = false
      this.localData.value = this.contract.value
      this.localData.startDate = this.contract.start_date
      this.localData.endDate = this.contract.end_date
    },
    serviceUpdate: function() {
      this.refreshContract()
    },
    saveNewProgramme: function() {
      if (this.allowSave) {
        const data = {
          contract_id: parseInt(this.contract_id),
          name: this.localData.newProgramme
        }
        const obj = { data: data, call: "programmes", method: "post" }
        this.$store.dispatch("contract/datacallDt", obj).then(() => {
          this.refreshContract()
          this.addingNewProgramme = false
        }).catch(e => {
          alert(e.data.message || e.statusText)
        })
      }
    },
    updateProgramme: function(data) {
      const _data = JSON.parse(JSON.stringify(data))
      const _id = data.id
      if (_data.children !== undefined) {
        delete _data.children
      }
      const obj = {
        data: _data,
        id: _id,
        call: "programmes",
        method: "patch"
      }
      this.$store.dispatch("contract/datacallDt", obj).then(() => {
        this.$emit("serviceUpdate")
      }).catch(e => {
        alert(e.data.message || e.statusText)
      })
    },
    saveNewProject: function() {
      if (this.allowSave) {
        const data = {
          contract_id: parseInt(this.contract_id),
          name: this.localData.newProject,
          programme_id: null
        }
        const obj = { data: data, call: "projects", method: "post" }
        this.$store.dispatch("contract/datacallDt", obj).then(() => {
          this.refreshContract()
          this.addingNewProject = false
        }).catch(e => {
          alert(e.data.message || e.statusText)
        })
      }
    },
    updateProject: function(data) {
      const _data = JSON.parse(JSON.stringify(data))
      const _id = data.id
      if (_data.children !== undefined) {
        delete _data.children
      }

      const obj = {
        data: _data,
        id: _id,
        call: "projects",
        method: "put"
      }
      this.$store.dispatch("contract/datacallDt", obj).then(() => {
        this.refreshContract()
      }).catch(e => {
        alert(e.data.message || e.statusText)
      })
    },
    saveNewItem: function() {
      if (this.allowSave) {
        const obj = { data: this.newItem, call: this.dataCall, method: "post" }
        this.$store.dispatch("contract/datacallDt", obj).then(() => {
          this.refreshContract()
        }).catch(e => {
          alert(JSON.stringify(e))
        })
      }
    },
    updateItem: function(data) {
      const _data = JSON.parse(JSON.stringify(data))
      const _id = data.id
      if (_data.children !== undefined) {
        delete _data.children
      }

      const obj = { data: _data, id: _id, call: "programmes", method: "patch" }
      this.$store.dispatch("contract/datacallDt", obj).then(() => {
        this.refreshContract()
      }).catch(e => {
        alert(JSON.stringify(e))
      })
    },
    deleteProgramme: function(data) {
      const obj = { id: data, call: "programmes", method: "delete" }
      this.$store.dispatch("contract/datacallDt", obj).then(() => {
        this.refreshContract()
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
    deleteProject: function(projectId) {
      const obj = { id: projectId, call: "projects", method: "delete" }
      this.$store.dispatch("contract/datacallDt", obj).then(() => {
        this.refreshContract()
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
    refreshContract: function() {
      this.getContract(true)
    },
    getContract: function(update = false) {
      this.isLoaded = update
      this.$q.loading.show()
      this.$store.dispatch("contract/viewContract", this.contract_id).then(() => {
        this.$q.loading.hide()
        this.isLoaded = true
      }).catch(() => {
        this.$q.loading.hide()
        this.isLoaded = true
      })
    },
    setLocalData: function() {
      this.localData = {
        reference: this.contract.reference,
        vendor_id: this.contract.vendor_id,
        customer_id: this.contract.customer_id,
        customer_owner_id: this.contract.customer_owner_id === null ? null : parseInt(this.contract.customer_owner_id),
        value: this.contract.value,
        startDate: this.contract.start_date,
        endDate: this.contract.end_date,
        vendor_owner_id: this.contract.vendor_owner_id === null ? null : parseInt(this.contract.vendor_owner_id),
        newProgramme: "",
        newProject: ""
      }
    },
    saveVendorOwner: function() {
      this.updateContract("vendor_owner")
      this.savingVendorOwner = false
      this.setLocalData()
    },
    saveCustomerOwner: function() {
      this.updateContract("customer_owner")
      this.savingCustomerOwner = false
      this.setLocalData()
    },
    // TODO update this work out what has changed and save the changed data
    updateContract: function(specific) {
      const obj = {
        call: "contracts/" + this.contract.id,
        method: "patch",
        data: {}
      }
      switch (specific) {
        case "vendor_owner":
          obj.data.vendor_owner_id = this.localData.vendor_owner_id
          break
        case "customer_owner":
          obj.data.customer_owner_id = this.localData.customer_owner_id
          break
        case "contract_values":
          obj.data.value = this.localData.value
          obj.data.reference = this.localData.reference.trim()
          obj.data.start_date = this.localData.startDate
          obj.data.end_date = this.localData.endDate
          break
      }
      this.$store.dispatch("contract/datacallDt", obj).then(() => {
        this.getContract(true)
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
    cancelVendorOwnerChange: function() {
      this.savingVendorOwner = false
      this.localData.vendor_owner_id = parseInt(this.contract.vendor_owner_id)
    },
    cancelCustomerOwnerChange: function() {
      this.savingCustomerOwner = false
      this.localData.customer_owner_id = this.contract.customer_owner_id ? parseInt(this.contract.customer_owner_id) : null
    },
    onEditService: function(id) {
      let serviceLink = ""
      if (this.vendor_id) {
        serviceLink = "/vendor/" + this.vendor_id + "/contracts/" + this.contract.id + "/services/" + id
      } else if (this.customer_id) {
        serviceLink = "/customer/" + this.customer_id + "/contracts/" + this.contract.id + "/services/" + id
      }
      this.$router.push({ path: serviceLink })
    },
    createNewService: function() {
      this.showNewServiceForm = true
    },
    onCreateMedia: function() {
      this.refreshContract()
      this.show_dialog = false
    },
    onCreateMultipleMedia: function() {
      this.refreshContract()
      this.show_dialog = false
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
