<script>
import { useQuasar } from "quasar"
import { ref } from "vue"
import { useRoute } from "vue-router"
import { v4 as uuidv4 } from "uuid"
import { customerAuth, vendorAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations, UserAccessTypes } from "src/modules/StaticData.js"
import { ObjectMethods, StringMethods } from "src/modules/GlobalMethods.js"
import CardList from "components/common/list/CardList.vue"
import PageHeader from "components/common/PageHeader.vue"
import LabelFromId from "components/common/text/LabelFromId.vue"
import Mermaid from "components/common/diagram/Mermaid.vue"

export default {
  name: "ServiceCatalogue",
  components: { Mermaid, LabelFromId, PageHeader, CardList },
  inheritAttrs: false,
  props: {
    template_id: { type: String, required: true },
    vendor_id: { type: String },
    customer_id: { type: String }
  },
  setup(props) {
    const quasar = useQuasar()

    const capabilityGraphRef = ref(null)
    const deliverableGraphRef = ref(null)

    let isAuthorised = false
    let organisation = undefined

    const route = useRoute()
    let routeName = route.name

    if (props.vendor_id) {
      const vendor_auth = vendorAuth(props.vendor_id)
      isAuthorised = vendor_auth.isAuthorised
      organisation = vendor_auth.vendor
    }
    if (props.customer_id) {
      const customer_auth = customerAuth(props.customer_id)
      isAuthorised = customer_auth.isAuthorised
      organisation = customer_auth.customer
    }

    const serviceTemplate = ref({
      id: null,
      name: null,
      organisation_id: parseInt(props.vendor_id ?? props.customer_id),
      outputs: [],
      capabilities: []
    })

    const dragAndDrop = {
      dragEnter: function(e) {
        if (e.target.draggable !== true && e.target.classList.contains("drop-target")) {
          e.target.classList.add("drag-enter")
        }
      },
      dragLeave: function(e) {
        e.target.classList.remove("drag-enter")
      },
      dragOver: function(e) {
        e.preventDefault()
      }
    }
    const onLhs = {
      dragStart: function({ e, item }) {
        e.dataTransfer.setData("output", JSON.stringify(item))
        e.dataTransfer.dropEffect = "move"
      },
      drop: function(e) {
        e.preventDefault()

        // don't drop on other draggables
        if (e.target.draggable === true) return

        const output = JSON.parse(e.dataTransfer.getData("output"))
        const draggedEl = document.getElementById(output.id)

        // check if original parent node
        if (draggedEl.parentNode === e.target) {
          e.target.classList.remove("drag-enter")
          return
        }

        e.target.classList.remove("drag-enter")
      }
    }
    const onRhs = {
      drop: function(e, item) {
        e.preventDefault()

        // don't drop on other draggables
        if (e.target.draggable === true) return

        const output = JSON.parse(e.dataTransfer.getData("output"))
        const draggedEl = document.getElementById(output.id)

        // check if original parent node
        if (draggedEl.parentNode === e.target) {
          e.target.classList.remove("drag-enter")
          return
        }

        // make the exchange
        e.target.classList.remove("drag-enter")
        if ((item.capability_outputs ?? []).filter(i => i.id === output.id).length === 0) {
          if ("children" in output) {
            delete output.children
          }
          item.capability_outputs.push(output)
          quasar.notify({
            type: "positive",
            textColor: "dark",
            message: "Deliverable added."
          })
        } else {
          quasar.notify({
            type: "negative",
            message: "Deliverable already exist."
          })
        }
      }
    }

    return {
      capabilityGraphRef,
      deliverableGraphRef,

      serviceTemplate,

      isAuthorised,
      organisation,
      routeName,

      dragAndDrop,
      onLhs,
      onRhs,

      StringMethods,
      ClassCombinations,
      uuidv4
    }
  },
  data() {
    return {
      isPageActive: false,
      splitterModel: 50,
      outputChange: 0,
      closeNoteBanner: true,
      modelStatus: {
        addEditDeliverable: false,
        addEditSubDeliverable: false,
        addEditCapability: false
      },
      modelData: {
        deliverable: { id: null, name: null, parent_id: "0", is_expanded: false },
        subDeliverable: { id: null, name: null, parent_id: "0" },
        capabilities: { id: null, name: null, is_expanded: false, capability_outputs: [] },
        item: null,
        error: { deliverable: null, subDeliverable: null, capabilities: null }
      },
      loadingSaveTemplate: false,
      notes: [
        "Drag and drop to add or remove deliverable to capability.",
        "Use right click or long press to access context menu on element."
      ],
      isMermaidDialogOpen: false,
      graphDefinition: {
        deliverable: "",
        capability: ""
      },
      mermaidRefreshIndex: 0
    }
  },
  async mounted() {
    if (this.template_id !== "new") {
      this.$q.loading.show()
    }
    await this.$store.dispatch("admin/getOrganisation", this.vendor_id || this.customer_id)
    await this.$store.dispatch("auth/getUser")
    const accessList = (this.user.accessCustomer ?? []).find(a => a.organisation_id === this.organisation.id)

    if (
      !this.organisation?.has_service_catalogue ||
      !(
        (accessList?.access_list ?? []).includes(UserAccessTypes.SERVICE_CATALOGUE_VIEW.value) ||
        (accessList?.access_list ?? []).includes(UserAccessTypes.SERVICE_CATALOGUE_MANAGER.value)
      ) ||
      (
        ["service-catalogue.create", "service-catalogue.edit"].includes(this.routeName) &&
        !(accessList?.access_list ?? []).includes(UserAccessTypes.SERVICE_CATALOGUE_MANAGER.value)
      )
    ) {
      this.$router.push({ path: "/access-denied" })
    }

    if (this.template_id !== "new") {
      this.getTemplateData()
    } else {
      this.isPageActive = true
    }
  },
  computed: {
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    getTitleStyle: function() {
      let style = {}
      if (this.$q.screen.gt.sm) {
        style = "max-width: 35px !important;"
      }

      return style
    },
    serviceInfo: function() {
      return [
        {
          label: "Template Name",
          value: this.serviceTemplate?.name
        }
      ]
    },
    entityName: function() {
      if (this.vendor_id) {
        return "vendor"
      }
      if (this.customer_id) {
        return "customer"
      }
      return "nada"
    },
    dashboardLink: function() {
      switch (this.entityName) {
        case "vendor":
          return "/" + this.entityName + "/" + this.organisation.id
        case "customer":
          return "/" + this.entityName + "/" + this.organisation.id
      }
      return "nada"
    },
    pageBreadcrumbs: function() {
      let breadcrumbList = []

      if (this.isAuthorised) {
        breadcrumbList.push({ route: this.dashboardLink, name: this.organisation.name })
        breadcrumbList.push({ route: this.dashboardLink + "/service-catalogue", name: "Service Catalogue" })
        breadcrumbList.push({ route: "", name: this.template_id })
      }

      return breadcrumbList
    },
    getListStyle: function() {
      let style = ""
      let columns = 1
      if (this.$q.screen.gt.sm) {
        columns = 2
      }

      style += "display:grid;"
      style += "grid-template-columns: repeat(" + (columns) + ", 1fr);"
      style += "grid-gap: 0.75rem;"
      return style
    },
    outputList: function() {
      return this.serviceTemplate?.outputs ?? []
    },
    capabilitiesList: function() {
      return ObjectMethods.decouple(this.serviceTemplate?.capabilities ?? []).map(c => {
        c.capability_outputs = (c?.capability_outputs ?? []).map(co => {
          let output = this.outputList.find(i => i.id === co.id)
          return {
            id: co.id,
            name: co?.name ?? output?.name
          }
        })
        return c
      })
    }
  },
  watch: {
    outputList: {
      handler: function() {
        this.outputChange++
      },
      deep: true
    },
    template_id: {
      handler: function(newVal) {
        if (newVal !== "new") {
          this.getTemplateData()
        }
      }
    }
  },
  methods: {
    // Deliverable Data
    showDeliverableModel: function(item, data = {}) {
      this.modelStatus.addEditDeliverable = true
      this.modelData.deliverable = {
        id: uuidv4(),
        name: null,
        parent_id: "0",
        is_new: !("id" in data) || ("is_new" in data && data.is_new),
        is_expanded: false,
        children: [],
        ...data
      }
      this.modelData.item = item
    },
    saveDeliverableData: function() {
      if (this.checkDuplication(this.modelData.item, this.modelData.deliverable)) {
        this.modelData.error.deliverable = "Deliverable already exists"
        return
      }

      const index = (this.modelData.item ?? []).findIndex(i => i.id === this.modelData.deliverable.id)
      this.modelData.deliverable.name = this.modelData.deliverable.name.replace(/\s+/g, " ").trim()
      if (index > -1) {
        this.modelData.item[index] = this.modelData.deliverable
      } else {
        this.modelData.item.push(this.modelData.deliverable)
      }
      this.modelStatus.addEditDeliverable = false

      this.resetModelData()
    },
    removeDeliverable: function(output_id) {
      if ((this.serviceTemplate?.outputs ?? []).filter(o => o.id === output_id).length > 0) {
        this.serviceTemplate.outputs = (this.serviceTemplate?.outputs ?? []).filter(o => o.id !== output_id)

        this.serviceTemplate.capabilities = (this.serviceTemplate.capabilities ?? []).map(c => {
          c.capability_outputs = (c?.capability_outputs ?? []).filter(co => co.id !== output_id)
          return c
        })

        this.$q.notify({
          type: "info",
          textColor: "dark",
          message: "Deliverable removed."
        })
      } else {
        this.$q.notify({
          type: "negative",
          message: "Fail to remove deliverable."
        })
      }
    },

    // Sub-Deliverable Data
    showSubDeliverableModel: function(item, data = {}) {
      this.modelStatus.addEditSubDeliverable = true
      this.modelData.subDeliverable = {
        id: uuidv4(),
        name: null,
        parent_id: "0",
        is_new: !("id" in data) || ("is_new" in data && data.is_new),
        is_expanded: false,
        ...data
      }
      this.modelData.item = item
    },
    saveSubDeliverableData: function() {
      if (this.checkDuplication(this.modelData.item, this.modelData.subDeliverable)) {
        this.modelData.error.subDeliverable = "Sub-Deliverable already exists"
        return
      }

      const index = (this.modelData.item ?? []).findIndex(i => i.id === this.modelData.subDeliverable.id)
      this.modelData.subDeliverable.name = this.modelData.subDeliverable.name.replace(/\s+/g, " ").trim()
      if (index > -1) {
        this.modelData.item[index] = this.modelData.subDeliverable
      } else {
        this.modelData.item.push(this.modelData.subDeliverable)
      }
      this.modelStatus.addEditSubDeliverable = false

      this.resetModelData()
    },
    removeDeliverableOutput: function(deliverable, subDeliverable_id) {
      if ((deliverable.children ?? []).filter(d => d.id === subDeliverable_id).length > 0) {
        deliverable.children = (deliverable.children ?? []).filter(d => d.id !== subDeliverable_id)
        this.$q.notify({
          type: "info",
          textColor: "dark",
          message: "Sub-Deliverable removed."
        })
      } else {
        this.$q.notify({
          type: "negative",
          message: "Fail to remove sub-deliverable."
        })
      }
    },

    // Capability Data
    showCapabilityModel: function(item, data = {}) {
      this.modelStatus.addEditCapability = true
      this.modelData.capabilities = {
        id: uuidv4(),
        name: null,
        capability_outputs: [],
        is_new: !("id" in data) || ("is_new" in data && data.is_new),
        is_expanded: false,
        ...data
      }
      this.modelData.item = item
    },
    saveCapabilityData: function() {
      if (this.checkDuplication(this.modelData.item, this.modelData.capabilities)) {
        this.modelData.error.capabilities = "Capability already exists"
        return
      }

      const index = (this.modelData.item ?? []).findIndex(i => i.id === this.modelData.capabilities.id)
      this.modelData.capabilities.name = this.modelData.capabilities.name.replace(/\s+/g, " ").trim()
      if (index > -1) {
        this.modelData.item[index] = this.modelData.capabilities
      } else {
        this.modelData.item.push(this.modelData.capabilities)
      }
      this.modelStatus.addEditCapability = false

      this.resetModelData()
    },
    removeCapability: function(capability_id) {
      if ((this.serviceTemplate?.capabilities ?? []).filter(o => o.id === capability_id).length > 0) {
        this.serviceTemplate.capabilities = (this.serviceTemplate?.capabilities ?? []).filter(o => o.id !== capability_id)
        this.$q.notify({
          type: "info",
          textColor: "dark",
          message: "Capability removed."
        })
      } else {
        this.$q.notify({
          type: "negative",
          message: "Fail to remove capability."
        })
      }
    },
    removeCapabilityOutput: function(capability, output_id) {
      if ((capability.capability_outputs ?? []).filter(o => o.id === output_id).length > 0) {
        capability.capability_outputs = (capability.capability_outputs ?? []).filter(o => o.id !== output_id)
        this.$q.notify({
          type: "info",
          textColor: "dark",
          message: "Deliverable removed."
        })
      } else {
        this.$q.notify({
          type: "negative",
          message: "Fail to remove deliverable."
        })
      }
    },

    // Mermaid Dialog
    showDiagram: function() {
      let graphData = {
        deliverable: [],
        capability: []
      }
      for (const deliverable of this.outputList) {
        if ((deliverable.children ?? []).length === 0) {
          graphData.deliverable.push(
            "    de-" + deliverable.id + "[\"" + deliverable.name + "\"]"
          )
        }
        for (const child of deliverable.children) {
          graphData.deliverable.push(
            "    de-" + deliverable.id + "[\"" + deliverable.name + "\"] ==> de-" + deliverable.id + "-" + child.id + "[\"" + child.name + "\"]"
          )
        }
      }

      for (const capability of this.capabilitiesList) {
        if ((capability.capability_outputs ?? []).length === 0) {
          graphData.capability.push(
            "    ca-" + capability.id + "[\"" + capability.name + "\"]"
          )
        }
        for (const child of capability.capability_outputs) {
          graphData.capability.push(
            "    ca-" + capability.id + "[\"" + capability.name + "\"] ==> ca-" + capability.id + "-" + child.id + "[\"" + child.name + "\"]"
          )
        }
      }

      this.graphDefinition.capability = graphData.capability.join("\n")
      this.graphDefinition.deliverable = graphData.deliverable.join("\n")

      this.mermaidRefreshIndex = Date.now()
      this.isMermaidDialogOpen = true
    },
    exportGraph: function(val) {
      switch (val) {
        case "capabilities":
          this.capabilityGraphRef?.exportGraph()
          break
        case "deliverable":
          this.deliverableGraphRef?.exportGraph()
          break
      }
    },

    // Other Methods
    resetErrorMessage: function() {
      this.modelData.error.deliverable = null
      this.modelData.error.subDeliverable = null
      this.modelData.error.capabilities = null
    },
    resetModelData: function() {
      this.modelData = {
        deliverable: { id: null, name: null, parent_id: "0", is_expanded: false },
        subDeliverable: { id: null, name: null, parent_id: "0" },
        capabilities: { id: null, name: null, is_expanded: false, capability_outputs: [] },
        item: null,
        error: { deliverable: null, subDeliverable: null, capabilities: null }
      }
    },
    closeNotes: function() {
      this.closeNoteBanner = false
    },
    getTemplateData: function() {
      if (this.template_id !== "new") {
        this.$store.dispatch(
          "contract/getServiceTemplate",
          { organisation_id: this.vendor_id ?? this.customer_id, template_id: this.template_id }
        ).then(response => {
          this.serviceTemplate = response.data
        }).finally(() => {
          if (this.$q.loading.isActive) {
            this.$q.loading.hide()
            this.isPageActive = true
          }
        })
      }
    },
    saveTemplateData: function() {
      this.loadingSaveTemplate = true
      this.$store.dispatch(
        "contract/createServiceTemplate",
        this.serviceTemplate
      ).then(response => {
        if (this.template_id === "new") {
          this.$router.push("/vendor/" + this.organisation.id + "/service-catalogue/edit/" + response.data.id)
        }
        this.getTemplateData()
        this.$q.notify({
          type: "positive",
          textColor: "dark",
          message: "Service template saved."
        })
      }).catch(error => {
        this.$q.notify({
          type: "negative",
          message: error?.message ?? error?.data?.message ?? error.data ?? "Fail to save service template."
        })
      }).finally(() => {
        this.loadingSaveTemplate = false
      })
    },
    checkDuplication: function(list = [], data = {}, key = "name") {
      let listData = (list ?? [])
        .filter(l => l.id !== data.id)
        .map(item => (item[key] ?? "").replace(/\s+/g, " ").trim().toLowerCase())

      return listData.includes((data[key] ?? "").replace(/\s+/g, " ").trim().toLowerCase())
    }
  }
}
</script>

<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column full-width q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <page-header title="Service Catalogue" :breadcrumbs="pageBreadcrumbs" v-if="organisation" />

      <div v-if="isAuthorised" class="q-mt-lg">
        <q-slide-transition>
          <div v-show="!$q.loading.isActive && isPageActive">

            <q-dialog v-model="isMermaidDialogOpen">
              <q-card style="max-width: 90vw; width: 100%">
                <q-card-section>
                  <div class="row full-width relative-position">
                    <div class="col-12 sticky top bg-dark">
                      <div class="full-width flex justify-between" :class="{ 'q-my-md' : serviceTemplate.name }">
                        <p class="text-h4 text-primary text-center col-grow q-mb-none">{{ serviceTemplate.name }}</p>
                        <div>
                          <q-btn
                            icon="close"
                            flat round dense v-close-popup
                          />
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <mermaid
                        ref="deliverableGraphRef"
                        :chart="graphDefinition.deliverable"
                        :render-index="mermaidRefreshIndex"
                        :title="serviceTemplate.name"
                        sub-title="Deliverables"
                        :file-name="(serviceTemplate.name || 'Service Template') + ' [Deliverable]'"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <mermaid
                        ref="capabilityGraphRef"
                        :chart="graphDefinition.capability"
                        :render-index="mermaidRefreshIndex"
                        :title="serviceTemplate.name"
                        sub-title="Capabilities"
                        :file-name="(serviceTemplate.name || 'Service Template') + ' [Capability]'"
                      />
                    </div>
                    <div class="text-center full-width sticky center" style="bottom: 10px;">
                      <q-fab
                        color="primary"
                        text-color="dark"
                        direction="up"
                        label="Download"
                        icon="fa-solid fa-download"
                        padding="sm"
                      >
                        <template v-slot:active-icon="{ opened }">
                          <q-icon :class="{ 'example-fab-animate': opened === true }" name="close" />
                        </template>
                        <q-fab-action
                          color="info"
                          icon="fa-solid fa-download"
                          label="Capabilities"
                          @click="exportGraph('capabilities')"
                        />
                        <q-fab-action
                          color="info"
                          icon="fa-solid fa-download"
                          label="Deliverables"
                          @click="exportGraph('deliverable')"
                        />
                      </q-fab>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-dialog>

            <div class="w-full flex justify-end q-gutter-md q-mb-md">
              <q-btn
                v-if="(serviceTemplate?.outputs ?? []).length > 0 || ( serviceTemplate?.capabilities ?? [] ).length > 0"
                label="View Diagram"
                color="primary"
                outline
                @click="showDiagram"
              />
              <template v-if="['service-catalogue.create','service-catalogue.edit'].includes(routeName)">
                <q-btn
                  label="Save Template"
                  color="primary"
                  text-color="dark"
                  :loading="loadingSaveTemplate"
                  @click="saveTemplateData"
                />
              </template>
            </div>

            <q-table
              :grid="$q.screen.lt.sm"
              :rows="serviceInfo"
              class="border-primary q-mb-md"
              separator="none"
              bordered flat hide-header hide-bottom wrap-cells
            >
              <template #body-cell-label="props">
                <q-td :props="props" :style="getTitleStyle">
                  <span class="q-table__grid-item-title">{{ StringMethods.upper(props.value) }}</span>
                </q-td>
              </template>
              <template #body-cell-value="props">
                <q-td :props="props">
                  <q-input
                    v-if="['service-catalogue.create','service-catalogue.edit'].includes(routeName)"
                    v-model="serviceTemplate.name"
                    filled
                  />
                  <span v-else class="text-h6">{{ props.value }}</span>
                </q-td>
              </template>
              <template v-slot:item="props">
                <q-card class="full-width" flat bordered>
                  <q-card-section class="text-left">
                    <span class="q-table__grid-item-title">{{ props.row.label }}</span>
                    <br>
                    <q-input
                      v-if="['service-catalogue.create','service-catalogue.edit'].includes(routeName)"
                      v-model="serviceTemplate.name"
                      filled
                    />
                    <strong v-else class="text-h6">{{ props.row.value }}</strong>
                  </q-card-section>
                </q-card>
              </template>
            </q-table>

            <template v-if="serviceTemplate">
              <template v-if="['service-catalogue.create','service-catalogue.edit'].includes(routeName)">

                <q-slide-transition>
                  <div v-show="closeNoteBanner">
                    <q-banner
                      class="bg-grey-9 text-white border-dark-028 q-mb-md"
                      rounded dark inline-actions
                    >
                      <p class="q-mb-none">Notes:</p>
                      <ul>
                        <li v-for="(item,index) of notes" :key="index">{{ item }}</li>
                      </ul>
                      <template v-slot:action>
                        <q-btn
                          icon="fa-solid fa-xmark"
                          padding="10px 10px"
                          flat
                          @click="closeNotes"
                        />
                      </template>
                    </q-banner>
                  </div>
                </q-slide-transition>

                <q-dialog v-model="modelStatus.addEditDeliverable" persistent>
                  <q-card style="min-width: 350px">
                    <q-card-section>
                      <div class="text-h6">Deliverable</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      <q-input
                        v-model="modelData.deliverable.name"
                        :error="modelData.error.deliverable !== null"
                        :error-message="modelData.error.deliverable"
                        dense autofocus
                        @keydown="resetErrorMessage"
                        @focus="resetErrorMessage"
                        @keyup.enter="saveDeliverableData"
                      />
                    </q-card-section>

                    <q-card-actions align="right" class="text-primary">
                      <q-btn label="Cancel" flat v-close-popup />
                      <q-btn label="Save Deliverable" flat @click="saveDeliverableData" />
                    </q-card-actions>
                  </q-card>
                </q-dialog>

                <q-dialog v-model="modelStatus.addEditSubDeliverable" persistent>
                  <q-card style="min-width: 350px">
                    <q-card-section>
                      <div class="text-h6">Sub-Deliverable</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      <q-input
                        v-model="modelData.subDeliverable.name"
                        :error="modelData.error.subDeliverable !== null"
                        :error-message="modelData.error.subDeliverable"
                        dense autofocus
                        @keydown="resetErrorMessage"
                        @focus="resetErrorMessage"
                        @keyup.enter="saveSubDeliverableData"
                      />
                    </q-card-section>

                    <q-card-actions align="right" class="text-primary">
                      <q-btn label="Cancel" flat v-close-popup />
                      <q-btn label="Save Sub-deliverable" flat @click="saveSubDeliverableData" />
                    </q-card-actions>
                  </q-card>
                </q-dialog>

                <q-dialog v-model="modelStatus.addEditCapability" persistent>
                  <q-card style="min-width: 350px">
                    <q-card-section>
                      <div class="text-h6">Capability</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      <q-input
                        v-model="modelData.capabilities.name"
                        :error="modelData.error.capabilities !== null"
                        :error-message="modelData.error.capabilities"
                        dense autofocus
                        @keydown="resetErrorMessage"
                        @focus="resetErrorMessage"
                        @keyup.enter="saveCapabilityData"
                      />
                    </q-card-section>

                    <q-card-actions align="right" class="text-primary">
                      <q-btn label="Cancel" flat v-close-popup />
                      <q-btn label="Save Deliverable" flat @click="saveCapabilityData" />
                    </q-card-actions>
                  </q-card>
                </q-dialog>

                <div class="row q-gutter-y-md q-gutter-md-x-md">
                  <div class="col-12 col-md">
                    <q-card flat bordered>
                      <q-card-section>
                        <div class="flex justify-between items-center">
                          <p class="text-h5 q-mb-none">Deliverables</p>
                          <q-btn
                            :size="$q.screen.gt.sm ? 'md' : 'sm'"
                            :dense="$q.screen.lt.md"
                            label="Add Deliverable"
                            icon="add"
                            color="primary"
                            text-color="dark"
                            @click="showDeliverableModel(serviceTemplate?.outputs)"
                          />
                        </div>
                      </q-card-section>
                      <q-card-section>
                        <div
                          class="rounded-borders overflow-hidden full-width"
                          @dragenter="e => dragAndDrop.dragEnter(e)"
                          @dragleave="e => dragAndDrop.dragLeave(e)"
                          @dragover="e => dragAndDrop.dragOver(e)"
                          @drop="e => onLhs.drop(e)"
                        >
                          <q-list
                            v-if="(serviceTemplate?.outputs ?? []).length > 0"
                            class="rounded-borders"
                            :style="getListStyle"
                          >
                            <q-item
                              v-for="(item,index) of (serviceTemplate?.outputs ?? [])"
                              :key="index"
                              :id="item.id"
                              class="bg-dark border-dark-028 rounded-borders cursor-pointer"
                              draggable="true"
                              clickable v-ripple
                              @dragstart="e => onLhs.dragStart({e, item})"
                            >
                              <q-item-section top class="full-height q-mt-xs">
                                <q-item-label class="text-primary">
                                  <span class="cursor-pointer">
                                    {{ item.name }}
                                    <q-badge
                                      v-if="item?.is_new"
                                      text-color="dark"
                                      align="top"
                                      class="font-size-10 q-py-none q-px-xs"
                                    >
                                      New
                                    </q-badge>
                                    <q-menu
                                      transition-show="jump-down"
                                      transition-hide="jump-up"
                                      fit context-menu auto-close
                                    >
                                      <q-list dense>
                                        <q-item
                                          clickable
                                          @click="showSubDeliverableModel(serviceTemplate?.outputs,item)"
                                        >
                                          <q-item-section avatar class="min-w-auto">
                                            <q-icon name="fa-solid fa-pen" color="white" size="12px" />
                                          </q-item-section>
                                          <q-item-section>Edit</q-item-section>
                                        </q-item>
                                        <q-item clickable @click="removeDeliverable(item.id)">
                                          <q-item-section avatar class="min-w-auto">
                                            <q-icon name="fa-solid fa-trash" color="white" size="12px" />
                                          </q-item-section>
                                          <q-item-section>Delete</q-item-section>
                                        </q-item>
                                        <q-separator />
                                        <q-item clickable @click="showSubDeliverableModel(item?.children)">
                                          <q-item-section avatar class="min-w-auto">
                                            <q-icon name="fa-solid fa-plus" color="white" size="12px" />
                                          </q-item-section>
                                          <q-item-section>Add Sub-Deliverable</q-item-section>
                                        </q-item>
                                      </q-list>
                                    </q-menu>
                                  </span>
                                  <q-icon
                                    class="float-right"
                                    :name="item.is_expanded ? 'remove' : 'add'"
                                    @click="item.is_expanded = !item.is_expanded"
                                  >
                                    <q-tooltip anchor="top middle" self="bottom middle">
                                      {{ item.is_expanded ? "Collapse" : "Expand" }}
                                    </q-tooltip>
                                  </q-icon>
                                </q-item-label>

                                <q-slide-transition>
                                  <div v-show="item.is_expanded">
                                    <q-list class="rounded-borders" dense>
                                      <template v-if="(item?.children ?? []).length > 0">
                                        <q-item
                                          v-for="(sd,index) of (item?.children ?? [])"
                                          :key="index"
                                          class="q-py-sm"
                                          :id="sd.id"
                                          clickable
                                        >
                                          <q-item-section avatar class="min-w-auto">
                                            <q-icon color="primary" name="fa-solid fa-circle" size="12px" />
                                          </q-item-section>

                                          <q-item-section top class="cursor-pointer">
                                            <q-item-label class="line-height-1-75" caption>
                                              {{ sd.name }}
                                              <q-badge
                                                v-if="sd?.is_new"
                                                text-color="dark"
                                                align="top"
                                                class="font-size-10 q-py-none q-px-xs"
                                              >
                                                New
                                              </q-badge>
                                            </q-item-label>
                                            <q-menu
                                              transition-show="jump-down"
                                              transition-hide="jump-up"
                                              fit context-menu auto-close
                                            >
                                              <q-list dense>
                                                <q-item clickable @click="showSubDeliverableModel(item?.children,sd)">
                                                  <q-item-section avatar class="min-w-auto">
                                                    <q-icon name="fa-solid fa-pen" color="white" size="12px" />
                                                  </q-item-section>
                                                  <q-item-section>Edit</q-item-section>
                                                </q-item>
                                                <q-item clickable @click="removeDeliverableOutput(item, sd.id)">
                                                  <q-item-section avatar class="min-w-auto">
                                                    <q-icon name="fa-solid fa-trash" color="white" size="12px" />
                                                  </q-item-section>
                                                  <q-item-section>Delete</q-item-section>
                                                </q-item>
                                              </q-list>
                                            </q-menu>
                                          </q-item-section>
                                        </q-item>
                                      </template>
                                      <q-item v-else class="q-py-sm" disable>
                                        <q-item-label class="line-height-1-75" caption>
                                          No Item found
                                        </q-item-label>
                                      </q-item>
                                    </q-list>
                                    <q-btn
                                      label="Add Sub-Deliverable"
                                      color="secondary"
                                      size="sm"
                                      class="full-width"
                                      outline
                                      @click="showSubDeliverableModel(item?.children)"
                                    />
                                  </div>
                                </q-slide-transition>
                                <span
                                  v-if="!item.is_expanded"
                                  class="text-caption q-ma-none font-size-10 text-grey-6"
                                >
                                  Has Items: {{ (item?.children ?? []).length }}
                                </span>
                              </q-item-section>
                            </q-item>
                          </q-list>
                        </div>
                        <p
                          v-if="(serviceTemplate?.outputs ?? []).length === 0"
                          class="dimmed q-mb-none"
                        >
                          No deliverables found
                        </p>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-md">
                    <q-card flat bordered>
                      <q-card-section>
                        <div class="flex justify-between items-center">
                          <p class="text-h5 q-mb-none">Capabilities</p>
                          <q-btn
                            :size="$q.screen.gt.sm ? 'md' : 'sm'"
                            :dense="$q.screen.lt.md"
                            label="Add Capability"
                            icon="add"
                            color="primary"
                            text-color="dark"
                            @click="showCapabilityModel(serviceTemplate?.capabilities)"
                          />
                        </div>
                      </q-card-section>
                      <q-card-section>
                        <div
                          v-if="( serviceTemplate?.capabilities ?? [] ).length > 0"
                          class="row q-col-gutter-md"
                        >
                          <template
                            v-for="item of ( serviceTemplate?.capabilities ?? [] )"
                            :key="'capability-' + item.id"
                          >
                            <div class="col-12 col-md-6">
                              <div
                                class="bg-dark border-dark-028 rounded-borders full-width q-pa-sm full-height flex column"
                              >
                                <span class="text-primary">
                                  <span class="cursor-pointer">
                                    {{ item.name }}
                                    <q-badge
                                      v-if="item?.is_new"
                                      text-color="dark"
                                      align="top"
                                      class="font-size-10 q-py-none q-px-xs"
                                    >
                                      New
                                    </q-badge>
                                    <q-menu
                                      transition-show="jump-down"
                                      transition-hide="jump-up"
                                      fit context-menu auto-close
                                    >
                                      <q-list dense>
                                        <q-item
                                          clickable
                                          @click="showCapabilityModel(serviceTemplate?.capabilities,item)"
                                        >
                                          <q-item-section avatar class="min-w-auto">
                                            <q-icon name="fa-solid fa-pen" color="white" size="12px" />
                                          </q-item-section>
                                          <q-item-section>Edit</q-item-section>
                                        </q-item>
                                        <q-item clickable @click="removeCapability(item.id)">
                                          <q-item-section avatar class="min-w-auto">
                                            <q-icon name="fa-solid fa-trash" color="white" size="12px" />
                                          </q-item-section>
                                          <q-item-section>Delete</q-item-section>
                                        </q-item>
                                        <q-separator />
                                      </q-list>
                                    </q-menu>
                                  </span>
                                  <q-icon
                                    class="float-right"
                                    :name="item.is_expanded ? 'remove' : 'add'"
                                    @click="item.is_expanded = !item.is_expanded"
                                  >
                                    <q-tooltip
                                      anchor="top middle"
                                      self="bottom middle"
                                    >
                                      {{ item.is_expanded ? "Collapse" : "Expand" }}
                                    </q-tooltip>
                                  </q-icon>
                                </span>
                                <q-slide-transition>
                                  <div v-show="item.is_expanded">
                                    <q-list dense>
                                      <template v-if="( item?.capability_outputs ?? [] ).length > 0">
                                        <q-item
                                          v-for="(co, index) of ( item?.capability_outputs ?? [] )"
                                          :key="index"
                                          class="q-py-sm"
                                        >
                                          <q-item-section top>
                                            <q-item-label class="line-height-1-75" caption>
                                              <label-from-id
                                                :id="co.id"
                                                :list="outputList"
                                                :index="[outputChange,item.id,co.id].join('-')"
                                                label-key="name"
                                              />
                                              <q-badge
                                                v-if="co?.is_new"
                                                text-color="dark"
                                                align="top"
                                                class="font-size-10 q-py-none q-px-xs"
                                              >
                                                New
                                              </q-badge>
                                            </q-item-label>
                                          </q-item-section>

                                          <q-item-section top side>
                                            <div class="text-grey-8 q-gutter-xs">
                                              <q-btn
                                                class="gt-xs"
                                                size="12px"
                                                icon="delete"
                                                color="negative"
                                                flat dense round
                                                @click="removeCapabilityOutput(item, co.id)"
                                              >
                                                <q-tooltip anchor="top middle" self="bottom middle">
                                                  Delete
                                                </q-tooltip>
                                              </q-btn>
                                            </div>
                                          </q-item-section>
                                        </q-item>
                                      </template>
                                      <q-item v-else class="q-py-sm" disable>
                                        <q-item-label class="line-height-1-75" caption>
                                          No Item found
                                        </q-item-label>
                                      </q-item>
                                    </q-list>
                                    <q-space />
                                  </div>
                                </q-slide-transition>
                                <span
                                  v-if="!item.is_expanded"
                                  class="text-caption q-ma-none font-size-10 q-mb-xs text-grey-6"
                                >
                                  Has Items: {{ (item?.capability_outputs ?? []).length }}
                                </span>
                                <div
                                  :id="item.id"
                                  class="drop-target border-dark-028 rounded-borders text-grey-7 placeholder-text q-mt-xs"
                                  data-placeholder="DROP HERE"
                                  @dragenter="e => dragAndDrop.dragEnter(e)"
                                  @dragleave="e => dragAndDrop.dragLeave(e)"
                                  @dragover="e => dragAndDrop.dragOver(e)"
                                  @drop="e => onRhs.drop(e, item)"
                                />
                              </div>
                            </div>
                          </template>
                        </div>
                        <p v-else class="dimmed q-mb-none">
                          No capabilities found
                        </p>
                      </q-card-section>
                    </q-card>
                  </div>

                </div>
              </template>
              <template v-else>
                <div class="row q-gutter-y-md q-gutter-md-x-md">
                  <div class="col-12 col-md">
                    <q-card flat bordered>
                      <q-card-section>
                        <p class="text-h5 q-mb-none">
                          Deliverables
                        </p>
                      </q-card-section>
                      <q-card-section>
                        <template v-if="outputList.length > 0">
                          <card-list
                            :list="(outputList ?? [])"
                            label-key="name"
                            :max-columns="2"
                            is-parent
                          />
                        </template>
                        <p v-else class="dimmed q-mb-none">
                          No deliverables found
                        </p>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-md">
                    <q-card flat bordered>
                      <q-card-section>
                        <p class="text-h5 q-mb-none">
                          Capabilities
                        </p>
                      </q-card-section>
                      <q-card-section>
                        <template v-if="capabilitiesList.length > 0">
                          <card-list
                            :list="(capabilitiesList ?? [])"
                            label-key="name"
                            children-key="capability_outputs"
                            caption-key="capability_outputs"
                            :max-columns="2"
                            is-parent
                          />
                        </template>
                        <p v-else class="dimmed q-mb-none">
                          No capabilities found
                        </p>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </template>
            </template>

          </div>
        </q-slide-transition>
      </div>
      <div v-else class="q-my-lg">
        You are not authorised to view this page
      </div>
    </div>
  </q-page>
</template>
