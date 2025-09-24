<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Delivery Management</div>
      <BreadCrumb align="center" :organisation="vendor" v-if="isAdminAuthorised" />
      <div class="text-center q-mt-sm">
        <div class="text-h6">
          Current week: <span class="text-weight-bold">{{ currentWeek }}</span>
          ({{ `${currentWeekDates.startDate} - ${currentWeekDates.endDate}` }})
        </div>
      </div>

      <div v-if="isAdminAuthorised && all_vendor_contracts.length" class="column q-mt-lg full-width">
        <div class="full-width row justify-between q-mb-sm">
          <div>Please choose what to report on</div>
          <div v-if="this.selectedService">
            Selected service dates: {{ selectServiceStartDateFormat }} - {{ selectServiceEndDateFormat }}
          </div>
        </div>
        <div class="full-width row items-center q-col-gutter-sm q-mb-md">
          <new-selector-form
            v-model:option_id="mainFilter.customerID"
            classes="col-12 col-sm-6 col-lg-4"
            :options="customers"
            label="Customer"
            is-filterable
            filter-key="name"
            default-class="full-width"
            autofocus
          />
          <new-selector-form
            v-model:option_id="mainFilter.contractID"
            classes="col-12 col-sm-6 col-lg-4"
            :options="contracts"
            is-filterable
            filter-key="reference"
            option-label="reference"
            label="Contract"
            default-class="full-width"
          />
          <new-selector-form
            v-model:option_id="mainFilter.serviceID"
            classes="col-12 col-sm-6 col-lg-4"
            :options="services"
            is-filterable
            filter-key="name"
            label="Service"
            default-class="full-width"
          />
          <new-selector-form
            v-if="milestones.length"
            v-model:option_id="mainFilter.milestoneID"
            classes="col-12 col-sm-6 col-lg-4"
            :options="milestones"
            is-filterable
            filter-key="reference"
            option-label="reference"
            label="Milestone"
            default-class="full-width"
          />
          <new-selector-form
            v-model:option_id="mainFilter.startWeek"
            classes="col-12 col-sm-6 col-lg-4"
            :options="weekOptions"
            is-filterable
            filter-key="label"
            option-label="label"
            option-val-key="weekRef"
            label="From week"
            default-class="full-width"
            :disabled="disableElement.startWeek"
          />
          <new-selector-form
            v-model:option_id="mainFilter.endWeek"
            classes="col-12 col-sm-6 col-lg-4"
            :options="weekOptions"
            is-filterable
            filter-key="label"
            option-label="label"
            option-val-key="weekRef"
            label="To Week (inc)"
            default-class="full-width"
            :disabled="disableElement.endWeek"
          />
          <div class="col-12 row items-center">
            <q-btn
              color="primary"
              text-color="dark"
              label="Get data"
              @click="getRecords"
            />
          </div>
        </div>
        <div v-show="reportData" class="full-width row items-center justify-between q-mb-sm">
          <div class="col-12 row items-center">
            <q-expansion-item
              switch-toggle-side
              expand-separator
              label="Filters"
              header-class="accordion-header"
              class="full-width q-mb-md"
              default-opened
            >
              <q-list separator>
                <q-item class="q-pa-none">
                  <q-card class="full-width" flat bordered>
                    <q-card-section>
                      <div class="row q-col-gutter-sm">
                        <new-selector-form
                          v-if="deliveryModelId < 3"
                          v-model:option_id="tableFilter.requestID"
                          style="min-width: 180px"
                          classes="col-12 col-md-6 col-lg-4"
                          dense
                          :options="requests"
                          is-filterable
                          filter-key="name"
                          label="Request"
                          default-class="full-width"
                        />
                        <new-selector-form
                          v-model:option_id="tableFilter.programmeID"
                          style="min-width: 180px"
                          classes="col-12 col-md-6 col-lg-4"
                          dense
                          :options="programmes"
                          is-filterable
                          filter-key="name"
                          label="Programme"
                          default-class="full-width"
                        />
                        <new-selector-form
                          v-model:option_id="tableFilter.projectID"
                          style="min-width: 180px"
                          classes="col-12 col-md-6 col-lg-4"
                          dense
                          :options="projects"
                          is-filterable
                          filter-key="name"
                          label="Project"
                          default-class="full-width"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </q-item>
              </q-list>
            </q-expansion-item>
          </div>
          <div v-if="filterData.milestoneID !== null" class="col-12">
            Milestone Budget
            {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, selectedMilestone?.amount) }}
          </div>
          <div class="col-12">
            <div class="flex column row-md wrap grid-gap-2 items-start items-md-center justify-md-end">
              <q-btn
                icon="post_add"
                color="white"
                outline
                :label="OrganisationTypeMethods.changeRaid(isBuiltEnvironment)"
                size="sm"
                @click="createRaidEntry">
                <q-tooltip
                  transition-show="scale"
                  transition-hide="scale"
                  :delay="250"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                  class="bg-primary text-dark"
                >
                  Create a {{ OrganisationTypeMethods.changeRaid(isBuiltEnvironment) }} Log for this service
                </q-tooltip>
              </q-btn>
              <q-btn
                v-if="!isBuiltEnvironment"
                icon="post_add"
                color="white"
                outline
                label="Service Alert"
                size="sm"
                @click="createServiceAlert"
              >
                <q-tooltip
                  transition-show="scale"
                  transition-hide="scale"
                  :delay="250"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                  class="bg-primary text-dark"
                >
                  Create an Alert for this service
                </q-tooltip>
              </q-btn>
              <q-btn
                v-if="!isBuiltEnvironment"
                icon="post_add"
                color="white"
                outline
                label="Change Request"
                size="sm"
                @click="createChangeRequest"
              >
                <q-tooltip
                  transition-show="scale"
                  transition-hide="scale"
                  :delay="250"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                  class="bg-primary text-dark"
                >
                  Create a Change Request for this service
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
        <div v-if="reportData" class="full-width">
          <delivery-data-table
            :data="filteredReportData"
            :start-date="startDate"
            :end-date="endDate"
            @show-records="showConsultantRecords"
            @generate-report="onGenerateReport"
          />
        </div>
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
    <q-dialog v-model="showRecordsDialogue">
      <delivery-records-viewer
        v-if="selectedEngagement && Array.isArray(selectedEngagement.delivery_records)"
        :engagement="selectedEngagement"
        :start-date="startDate"
        :end-date="endDate"
        :vendor-id="vendor_id"
        @refresh="refreshData"
      />
    </q-dialog>
  </q-page>
</template>

<script>
import { date } from "quasar"
import { defineComponent, nextTick } from "vue"
import { DateTime } from "luxon"
import { vendorAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations, Config } from "src/modules/StaticData.js"
import { CurrencyMethods, DateMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import DeliveryDataTable from "components/DeliveryDataTable.vue"
import DeliveryRecordsViewer from "components/DeliveryRecordsViewer.vue"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

export default defineComponent({
  name: "DeliveryData",
  components: {
    BreadCrumb,
    NewSelectorForm,
    DeliveryDataTable,
    DeliveryRecordsViewer
  },
  props: ["vendor_id"],
  setup() {
    return {
      OrganisationTypeMethods,
      ClassCombinations,
      CurrencyMethods
    }
  },
  data() {
    return {
      vendor: null,
      isAdminAuthorised: false,
      mainFilter: {
        customerID: null,
        contractID: null,
        serviceID: null,
        milestoneID: null,
        startWeek: null,
        endWeek: null
      },
      filterData: {
        customerID: null,
        contractID: null,
        serviceID: null,
        milestoneID: null,
        startWeek: null,
        endWeek: null
      },
      tableFilter: {
        requestID: 0,
        programmeID: 0,
        projectID: 0
      },
      reportData: false,
      showRecordsDialogue: false,
      selectedEngagement: null,
      disableElement: {
        startWeek: false,
        endWeek: false
      }
    }
  },
  computed: {
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    isBuiltEnvironment: function() {
      return this.$store.getters["admin/getIsBuiltEnvironment"]
    },
    currentWeek: function() {
      return DateTime.now().weekNumber
    },
    currentWeekDates: function() {
      const startDate = DateTime.now().startOf("week").toFormat(Config.DATE_FORMAT_DLY)
      const endDate = DateTime.now().endOf("week").toFormat(Config.DATE_FORMAT_DLY)
      return { startDate, endDate }
    },
    all_vendor_contracts: function() {
      return this.$store.getters["vendor/getContractsByVendor"](this.vendor_id)
    },
    contracts: function() {
      let c = []
      if (this.mainFilter.customerID) {
        if (Array.isArray(this.all_vendor_contracts) && this.all_vendor_contracts.length > 0) {
          const contracts = this.all_vendor_contracts.filter(contract => contract.customer.id === this.mainFilter.customerID)
          if (Array.isArray(contracts) && contracts.length > 0) {
            c = contracts
          }
        }
      }
      return c
    },
    customers: function() {
      const c = []
      if (Array.isArray(this.all_vendor_contracts) && this.all_vendor_contracts.length > 0) {
        for (let index = 0; index < this.all_vendor_contracts.length; index++) {
          const customer = this.all_vendor_contracts[index].customer
          if (c.find(element => element.id === customer.id) === undefined) {
            c.push({ id: customer.id, name: customer.name })
          }
        }
      }
      return c
    },
    services: function() {
      let cs = []

      if (this.mainFilter.contractID !== false) {
        const s = this.contracts.find(contract => contract.id === this.mainFilter.contractID)
        cs = s?.services ?? []
      }
      return cs
    },
    milestones: function() {
      const a = []
      if (
        this.selectedService &&
        this.selectedService.delivery_model_id > 2 &&
        this.selectedService.purchase_orders &&
        this.selectedService.purchase_orders.length &&
        this.selectedService.purchase_orders[0].milestones &&
        this.selectedService.purchase_orders[0].milestones.length
      ) {
        a.push(...this.selectedService.purchase_orders[0].milestones)
      }
      return a
    },
    selectedService: function() {
      const s = this.services.find(service => service.id === this.mainFilter.serviceID)
      return s ?? null
    },
    weekOptions: function() {
      const weeks = []

      if (!this.selectedService) {
        return weeks
      }

      let weekStartDate = DateTime.fromISO(DateMethods.convertDateFormat(this.selectedService.end_date, "/", "-")).startOf("week")
      let weekEndDate = DateTime.fromISO(DateMethods.convertDateFormat(this.selectedService.end_date, "/", "-")).endOf("week")
      let serviceStartDate = DateTime.fromISO(DateMethods.convertDateFormat(this.selectedService.start_date, "/", "-")).startOf("week")

      let index = 0

      while (weekStartDate >= serviceStartDate) {
        const year = weekStartDate.weekYear
        const week = weekStartDate.weekNumber

        const weekObject = {
          weekRef: year + "-" + week,
          weekYear: year,
          weekNumber: week,
          startDate: weekStartDate.toFormat(Config.DATE_FORMAT_DLY),
          endDate: weekEndDate.toFormat(Config.DATE_FORMAT_DLY),
          label: `${year} - Week ${week} (${weekStartDate.toFormat(Config.DATE_FORMAT_DLY)} - ${weekEndDate.toFormat(
            Config.DATE_FORMAT_DLY
          )})`
        }
        weeks.push(weekObject)

        weekStartDate = weekStartDate.minus({ weeks: 1 })
        weekEndDate = weekEndDate.minus({ weeks: 1 })

        //loop bail out safety net
        index++
        if (index > 200) {
          break
        }
      }
      return weeks
    },
    startDate: function() {
      if (this.filterData.startWeek) {
        const dt = DateTime.fromObject({
          weekYear: this.filterData.startWeek.split("-")[0],
          weekNumber: this.filterData.startWeek.split("-")[1]
        })
        return dt.startOf("week").toFormat(Config.DATE_FORMAT_DLY)
      } else {
        return null
      }
    },
    endDate: function() {
      if (this.filterData.endWeek) {
        const dt = DateTime.fromObject({
          weekYear: this.filterData.endWeek.split("-")[0],
          weekNumber: this.filterData.endWeek.split("-")[1]
        })
        return dt.endOf("week").toFormat(Config.DATE_FORMAT_DLY)
      } else {
        return null
      }
    },
    selectServiceStartDateFormat: function() {
      let d = ""
      if (this.selectedService) {
        d = date.formatDate(DateMethods.convertDateFormat(this.selectedService.start_date), Config.DATE_FORMAT_DMY)
      }
      return d
    },
    selectServiceEndDateFormat: function() {
      let d = ""
      if (this.selectedService) {
        d = date.formatDate(DateMethods.convertDateFormat(this.selectedService.end_date), Config.DATE_FORMAT_DMY)
      }
      return d
    },
    selectedContract: function() {
      const cn = this.contracts.find(contract => contract.id === this.filterData.contractID)
      return cn ?? null
    },
    requests: function() {
      let r = [{ id: 0, name: "All Requests" }]
      return r.concat(this.reportData.requestFilters)
    },
    programmes: function() {
      const a = [{ id: 0, name: "All Programmes" }]
      if (this.selectedContract && this.selectedContract.programmes && this.selectedContract.programmes.length) {
        a.push(...this.selectedContract.programmes)
      }
      return a
    },
    all_projects: function() {
      const a = []
      if (this.selectedContract && this.selectedContract.projects && this.selectedContract.projects.length) {
        a.push(...this.selectedContract.projects)
      }
      return a
    },
    projects: function() {
      const a = []
      if (this.tableFilter.programmeID && this.tableFilter.programmeID > 0) {
        a.push({ id: 0, name: "All Projects in Programme" })
        this.all_projects.forEach(project => {
          if (project.programme_id === this.tableFilter.programmeID) {
            a.push(project)
          }
        })
      } else {
        a.push({ id: 0, name: "All Projects" }, ...this.all_projects)
      }
      return a
    },
    validProjectIDs: function() {
      const a = []
      if (this.tableFilter.projectID && this.tableFilter.projectID > 0) {
        a.push(this.tableFilter.projectID)
      } else if (this.tableFilter.programmeID && this.tableFilter.programmeID > 0) {
        this.projects.forEach(project => {
          a.push(project.id)
        })
      }
      return a.filter(val => parseInt(val) > 0)
    },
    filteredReportData: function() {
      const reportData = JSON.parse(JSON.stringify(this.reportData))
      if (this.tableFilter.requestID) {
        reportData.requests = reportData.requests.filter(val => parseInt(val.id) === parseInt(this.tableFilter.requestID))
      }
      if (this.validProjectIDs.length > 0) {
        reportData.requests.map(request => {
          request.consultant_engagements = (request?.consultant_engagements ?? []).map(engagement => {
            engagement.delivery_records = (engagement?.delivery_records ?? []).map(records => {
              records.outputs = (records?.outputs ?? []).filter(output => this.validProjectIDs.includes(output.project_id))
              return records
            }).filter(val => val.outputs.length > 0)
            return engagement
          })
          return request
        })
      }
      return reportData
    },
    selectedCustomerName: function() {
      const c = this.customers.find(customer => customer.id === this.filterData.customerID)
      return c?.name ?? "Unknown"
    },
    deliveryModelId: function() {
      const s = this.services.find(service => service.id === this.filterData.serviceID)
      return s && s?.delivery_model_id < 3
    },
    selectedMilestone: function() {
      const m = this.milestones.find(milestone => milestone.id === this.filterData.milestoneID)
      return m ?? null
    },
    filterMilestone: function() {
      const m = this.milestones.find(milestone => milestone.id === this.mainFilter.milestoneID)
      return m ?? null
    }
  },
  watch: {
    customers: function(newVal) {
      this.setFirstItem("mainFilter", "customerID", newVal)
    },
    contracts: function(newVal) {
      this.setFirstItem("mainFilter", "contractID", newVal)
    },
    services: function(newVal) {
      this.setFirstItem("mainFilter", "serviceID", newVal)
      this.tableFilter.requestID = 0
    },
    "mainFilter.startWeek": async function() {
      await nextTick()
      this.checkWeekValidity()
    },
    "mainFilter.endWeek": async function() {
      await nextTick()
      this.checkWeekValidity()
    },
    "mainFilter.customerID": function() {
      this.mainFilter.serviceID = null
      this.mainFilter.milestoneID = null
      this.mainFilter.startWeek = null
      this.mainFilter.endWeek = null
    },
    "mainFilter.contractID": function() {
      this.mainFilter.milestoneID = null
      this.mainFilter.startWeek = null
      this.mainFilter.endWeek = null
    },
    "mainFilter.serviceID": function() {
      this.mainFilter.milestoneID = null
      this.mainFilter.startWeek = null
      this.mainFilter.endWeek = null
      this.disableElement.startWeek = false
      this.disableElement.endWeek = false
    },
    "mainFilter.milestoneID": function(newVal) {
      if (newVal !== null) {
        this.setWeeksToMilestoneDates()
      }
    },
    selectedService: function(newVal) {
      this.mainFilter.startWeek = newVal ? this.getWeekObject(newVal.start_date) : null
      this.mainFilter.endWeek = newVal ? this.getWeekObject(newVal.end_date) : null
    }
  },
  created() {
    this.vendor = vendorAuth(this.vendor_id).vendor
    this.isAdminAuthorised = vendorAuth(this.vendor_id).isAdminAuthorised
  },
  mounted() {
    //this.setWeekOptions()
    this.reportData = false
    if (this.isAdminAuthorised) {
      this.getContracts()
      this.setFirstItem("mainFilter", "customerID", this.customers)
      this.setFirstItem("mainFilter", "contractID", this.contracts)
      this.setFirstItem("mainFilter", "serviceID", this.services)
    }
  },
  methods: {
    setFirstItem: function(prop, prop1, a) {
      if (Array.isArray(a) && a.length) {
        this[prop][prop1] = a[0].id
      }
    },
    setWeeksToMilestoneDates: function() {
      this.disableElement.startWeek = false
      this.disableElement.endWeek = false

      const sd = DateTime.fromISO(DateMethods.convertDateFormat(this.filterMilestone?.start_date, "/", "-"))
      const ed = DateTime.fromISO(DateMethods.convertDateFormat(this.filterMilestone?.end_date, "/", "-"))

      if (sd.weekday === 1) this.disableElement.startWeek = true
      if (ed.weekday === 7) this.disableElement.endWeek = true

      let sw = sd.weekYear + "-" + sd.weekNumber
      // If weekOption is not available then select the oldest one
      this.mainFilter.startWeek = (this.weekOptions.find(option => option.weekRef === sw) === undefined) ?
        this.weekOptions[this.weekOptions.length - 1].weekRef :
        sw

      let ew = ed.weekYear + "-" + ed.weekNumber
      // If weekOption is not available then select the latest one
      this.mainFilter.endWeek = (this.weekOptions.find(option => option.weekRef === ew) === undefined) ?
        this.weekOptions[0].weekRef :
        ew
    },
    getWeekObject: function(date) {
      const dt = DateTime.fromISO(DateMethods.convertDateFormat(date, "/", "-"))
      return dt.weekYear + "-" + dt.weekNumber
    },
    checkWeekValidity: function() {
      if (this.mainFilter.startWeek && this.mainFilter.endWeek) {
        if (
          Number(this.mainFilter.endWeek.split("-")[0]) === Number(this.mainFilter.startWeek.split("-")[0]) &&
          Number(this.mainFilter.endWeek.split("-")[1]) < Number(this.mainFilter.startWeek.split("-")[1])
        ) {
          this.mainFilter.endWeek = this.mainFilter.startWeek
        } else if (Number(this.mainFilter.endWeek.split("-")[0]) < Number(this.mainFilter.startWeek.split("-")[0])) {
          this.mainFilter.endWeek = this.mainFilter.startWeek
        }
      }
    },
    getContracts: function() {
      if (this.contracts.length < 1) {
        this.$store.dispatch("vendor/getVendorContracts", this.vendor_id)
      }
    },
    getRecords: function() {
      this.filterData = Object.assign({}, this.mainFilter)
      this.getData()
    },
    getData: function() {
      if (this.mainFilter.serviceID && parseInt(this.mainFilter.serviceID) > 0) {
        this.$q.loading.show()
        this.$store.dispatch(
          "vendor/getServiceReport",
          {
            vendor_id: this.vendor_id,
            service_id: this.mainFilter.serviceID,
            startDate: this.startDate,
            endDate: this.endDate
          }
        ).then(response => {
          this.$q.loading.hide()
          this.reportData = response.data
        }).catch(e => {
          this.$q.loading.hide()
          alert(e.data.message || e.statusText)
        })
      } else {
        alert("service not selected")
        this.reportData = false
      }
    },
    createRaidEntry: function() {
      const raidPath = "/vendor/" + this.vendor_id + "/service-management/raid/new/"
      this.$router.push({
        path: raidPath,
        query: {
          customer_id: this.filterData.customerID,
          contract_id: this.filterData.contractID,
          service_id: this.filterData.serviceID
        }
      })
    },
    createServiceAlert: function() {
      const raidPath = "/vendor/" + this.vendor_id + "/service-management/service-alerts/new/"
      this.$router.push({
        path: raidPath, query: {
          customer_id: this.filterData.customerID,
          contract_id: this.filterData.contractID,
          project_id: this.tableFilter.projectID,
          service_id: this.filterData.serviceID
        }
      })
    },
    createChangeRequest: function() {
      const raidPath = "/vendor/" + this.vendor_id + "/service-management/change-requests/new/"
      this.$router.push({
        path: raidPath,
        query: {
          customer_id: this.filterData.customerID,
          contract_id: this.filterData.contractID,
          project_id: this.tableFilter.projectID,
          service_id: this.filterData.serviceID
        }
      })
    },
    showConsultantRecords: function(engagement) {
      this.selectedEngagement = engagement
      this.showRecordsDialogue = true
    },
    onGenerateReport: function(requests) {
      this.$q.loading.show({
        message: "Generating report, please wait..."
      })
      const obj = {
        vendorID: this.vendor_id,
        data: {
          service_id: parseInt(this.filterData.serviceID),
          customer_id: this.filterData.customerID,
          customer_name: this.selectedCustomerName,
          vendor_id: this.vendor_id,
          vendor_name: this.vendor.name,
          period_start_date: this.weekOptions.find(option => option.weekRef === this.filterData.startWeek).startDate,
          period_end_date: this.weekOptions.find(option => option.weekRef === this.filterData.endWeek).endDate,
          period_label: "Please update",
          requests: requests
        }
      }
      this.$store.dispatch("vendor/generateSpendReport", obj).then(response => {
        this.$q.loading.hide()
        // redirect to relevant report url
        this.$router.push({
          path: "/vendor/" + this.vendor_id + "/financial-management/spend-reports/" + response.data
        })
      }).catch(e => {
        this.$q.loading.hide()
        this.$q.notify({
          type: "negative",
          message: `Error generating report:  ${e}`
        })
      })
    },
    refreshData: function() {
      this.getData()
      this.showRecordsDialogue = false
    }
  }
})
</script>
