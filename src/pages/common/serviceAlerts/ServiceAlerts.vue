<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Service Alerts</div>
      <BreadCrumb align="center" :organisation="organisation" v-if="organisation.name" />

      <div v-if="is_authorised" class="q-mt-lg">
        <q-btn
          class="alert-button q-mb-lg"
          color="primary"
          text-color="dark"
          label="Create New Alert"
          @click="this.$router.push('service-alerts/new')"
        />

        <q-dialog v-model="showDialog">
          <q-card class="q-pa-md-sm full-width">
            <q-card-section>
              <div class="text-h6 text-primary">Edit</div>
            </q-card-section>
            <q-card-section>
              <new-selector-form
                classes="row"
                v-model:option_id="editedItem.status"
                :options="serviceAlertStatuses"
                label="Status"
                is-filterable
                filter-key="name"
                default-class="full-width"
              />
              <div class="row">
                <q-input
                  class="full-width"
                  type="textarea"
                  v-model="editedItem.description"
                  label="Description"
                  label-color="white"
                  color="primary"
                />
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                v-close-popup
                label="OK"
                color="primary"
                text-color="dark"
                @click="saveAlert"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <div class="q-mb-sm q-pa-md-sm">Please choose a Service Alert</div>
        <q-table
          flat
          :grid="$q.screen.xs"
          selection="none"
          :rows="rows"
          :columns="columns"
          wrap-cells
          row-key="id"
          :pagination="pagination"
          class="bordered"
          table-header-class="text-weight-bolder text-primary"
          color="primary"
          binary-state-sort
        >
          <template #body-cell-description="props">
            <q-td :props="props">
              <text-with-show-more :show-more-words="15" :text="props.value ?? '-'" />
            </q-td>
          </template>
          <template #body-cell-status="props">
            <q-td :props="props">
              {{ props.value }}
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props">
              <div>
                <q-btn
                  color="primary"
                  outline
                  label="View"
                  padding="xs md"
                  size="sm"
                  @click.stop="editServiceAlert(props)"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script>
import { date } from "quasar"
import { defineComponent, ref } from "vue"
import { ClassCombinations, Config } from "src/modules/StaticData.js"
import { DateMethods, ObjectMethods } from "src/modules/GlobalMethods.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"
import TextWithShowMore from "components/common/text/TextWithShowMore.vue"

export default defineComponent({
  name: "ServiceAlerts",
  components: {
    TextWithShowMore,
    BreadCrumb,
    NewSelectorForm
  },
  props: ["vendor_id", "customer_id"],
  emits: ["refresh"],
  setup(props) {
    let firstCol = {}
    if (props.vendor_id) {
      firstCol = { name: "customer", label: "Customer", field: "customer" }
    }
    if (props.customer_id) {
      firstCol = { name: "vendor", label: "Vendor", field: "vendor" }
    }
    const columns = ref([
      {
        name: "created_at",
        label: "Date",
        field: "created_at",
        align: "center",
        sortable: true,
        sortOrder: "da",
        rawSort: (a, b) => date.getDateDiff(DateMethods.convertDateTimeFormat(a), DateMethods.convertDateTimeFormat(b), "second"),
        format: val => val ? date.formatDate(DateMethods.convertDateTimeFormat(val), Config.DATE_FORMAT_DMY) : "-"
      },
      { name: firstCol.name, label: firstCol.label, field: firstCol.field, align: "left", sortable: true },
      { name: "contract", label: "Contract", field: "contract", align: "left", sortable: true },
      { name: "service", label: "Service", field: "service", align: "left", sortable: true },
      { name: "status", label: "Status", field: "status", align: "center", sortable: true },
      {
        name: "description",
        label: "Description",
        field: "description",
        align: "left",
        sortable: true,
        classes: "max-350"
      },
      {
        name: "updated",
        label: "Last Updated",
        field: "updated_at",
        align: "center",
        sortable: true,
        sortOrder: "da",
        rawSort: (a, b) => date.getDateDiff(DateMethods.convertDateTimeFormat(a), DateMethods.convertDateTimeFormat(b), "second"),
        format: val => val ? date.formatDate(DateMethods.convertDateTimeFormat(val), Config.DATE_FORMAT_DMY) : "-"
      },
      { name: "actions", label: "Actions", align: "center" }
    ])
    return {
      formData: {
        service_id: 0,
        notes: null
      },
      pagination: {
        sortBy: "created_at",
        descending: true,
        rowsPerPage: 20 // current rows per page being displayed
      },

      columns,

      ClassCombinations
    }
  },
  data() {
    return {
      allowSave: false,
      notes: null,
      selectedRequest: 0,
      showDialog: false,
      editedItem: {
        id: 0,
        status: {},
        description: ""
      }
    }
  },
  computed: {
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    vendor: function() {
      return this.vendor_access.find(obj => {
        return parseInt(obj.id) === parseInt(this.vendor_id)
      })
    },
    vendor_access: function() {
      return this.$store.getters["vendor/getVendors"]
    },
    is_authorised: function() {
      if (this.customer_id || this.vendor_id) {
        return true
      }
      const result = this.vendor_access.find(obj => {
        return parseInt(obj.id) === parseInt(this.vendor_id)
      })
      return !!result
    },
    alerts: function() {
      const unsorted = this.$store.getters["vendor/getServiceAlerts"]
      const sorted = ObjectMethods.decouple(unsorted)
      //order by most recent first
      sorted.sort((a, b) => (a.created_at < b.created_at ? 1 : b.created_at < a.created_at ? -1 : 0))
      return sorted
    },
    requests: function() {
      return this.$store.getters["contract/getCustomerrequests"]
    },
    organisations: function() {
      return this.$store.getters["admin/getOrganisations"]
    },
    organisation: function() {
      let org = {}
      let orgId = 0
      if (this.vendor_id) {
        orgId = parseInt(this.vendor_id)
      }
      if (this.customer_id) {
        orgId = parseInt(this.customer_id)
      }
      if (this.organisations.length) {
        org = this.organisations.find(organisations => organisations.id === orgId)
      }
      return org
    },
    capabilities: function() {
      return this.$store.getters["contract/getCapabilities"]
    },
    serviceAlertStatuses: function() {
      return this.$store.getters["vendor/getServiceAlertStatuses"]
    },
    rows: function() {
      const rz = []

      this.alerts.forEach(r => {
        const row = {
          id: r.id,
          customer: r.service.contract.customer.name,
          vendor: r.service.contract.vendor.name,
          contract: r.service.contract.reference,
          service: r.service.name,
          request: r.request_id,
          engagement: r.engagement_id,
          created_at: r.created_at,
          status: r.status.name,
          status_id: r.status.id,
          description: r.description,
          updated_at: r.updated_at
        }
        rz.push(row)
      })
      return rz
    }
  },
  watch: {
    organisations: function(newVal) {
      this.setFirstItem("selectedCustomer", newVal)
    },
    capabilities: function(newVal) {
      this.setFirstItem("selectedCapability", newVal)
    }
  },
  mounted() {
    this.getOrganisations(true)
    this.getAlerts()
    this.getServiceAlertStatuses()
  },
  methods: {
    getOrganisations: function(force) {
      if (this.organisations.length < 1 || force) {
        const obj = {
          call: "organisations",
          method: "get"
        }
        this.$store.dispatch("admin/datacallDt", obj)
        this.$q.loading.hide()
      }
    },
    getAlerts: function() {
      const obj = {
        serviceId: this.selectedService,
        matchVendor: "matchVendor",
        matchVendorId: this.vendor_id,
        matchCustomer: "matchCustomer",
        matchCustomerId: this.customer_id
      }
      this.$store.dispatch("vendor/getServiceAlerts", obj)
      this.$q.loading.hide()
    },
    getServiceAlertStatuses: function() {
      this.$store.dispatch("vendor/getServiceAlertStatuses")
    },
    setFirstItem: function(prop, a) {
      if (Array.isArray(a) && a.length) {
        this[prop] = a[0].id
      }
    },
    saveAlert: function() {
      const obj = {
        data: {
          status_id: this.editedItem.status.id,
          description: this.editedItem.description,
          organisation_id: this.organisation.id
        },
        call: "servicealerts",
        method: "put",
        id: this.editedItem.id
      }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        // call service update
        this.$emit("refresh")
        this.getAlerts()
        this.showDialog = false
      }).catch(e => {
        alert(e.data.message || e.statusText)
      })
    },
    linkToEdit: function(alert_id) {
      let path = ""
      if (this.vendor_id) {
        path = "/vendor/" + this.vendor_id + "/service-management/service-alerts/" + alert_id
      }
      if (this.customer_id) {
        path = "/customer/" + this.customer_id + "/service-management/service-alerts/" + alert_id
      }

      this.$router.push({ path: path })
    },
    editServiceAlert: function(props) {
      this.linkToEdit(props.row.id)
      /*
      this.editedItem.id = props.row.id
      this.editedItem.status = this.serviceAlertStatuses[props.row.status_id - 1]
      this.editedItem.description = props.row.description
      this.showDialog = true
      */
    }
  }
})
</script>
