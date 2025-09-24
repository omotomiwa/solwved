<template>
  <q-page>
    <div class="row justify-center q-pa-md swlvd-container-bg">
      <div class="col-12 col-md-10 col-lg-8">
        <div class="text-h2 q-pt-lg text-weight-bold text-center text-white">Timesheet Approvals</div>
        <div class="q-pa-md flex justify-center">
          <div class="text-h6">
            <span class="text-primary cursor-pointer" @click="goBackTwoPages">{{ customer }}</span> / <span class="text-primary cursor-pointer" @click="goBack">Service Management</span> /
            <span>Timesheet Approvals</span>
          </div>
        </div>

        <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xl swlvd-container-bg">
         
           
            <div class="q-mb-sm q-pa-md-sm">Timesheets for approval</div>
          

          <q-list bordered class="rounded-borders">
            <q-expansion-item
              switch-toggle-side
              expand-separator
              label="Filters"
              class="bg-primary"
              header-class="text-black"
            >
              <q-card>
                <q-card-section>
                  <div class="row output-row q-mb-sm q-col-gutter-sm">
                    <q-select
                      class="col-12"
                      outlined
                      v-model="selectedOption_id"
                      :options="options"
                      label="Filter Timesheet"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
         
          <div class="q-mb-sm q-pa-md-sm">{{ OrganisationTypeMethods.changeConsultant(isBuiltEnvironment) }}s engaged on this service</div>

         
          <q-table
            v-model:selected="selectedRecords"
            flat
            :grid="$q.screen.xs"
            color="primary"
            :rows="rows"
            :columns="columns"
            row-key="week"
            :pagination="{ rowsPerPage: 50 }"
            class="bordered"
            table-header-class="text-weight-bolder text-primary "
          >
            <template #body-cell-action="props">
              <q-td :props="props" class="row">
                <div>
                  <q-btn
                    color="primary"
                    outline
                    label="View"
                    size="sm"
                    class="q-mr-md q-mt-xs"
                    @click="openDialog(props.row)"
                  />
                </div>
              </q-td>
            </template>
          </q-table>

          
        </div>
      </div>
    </div>
  </q-page>

  <q-dialog v-model="showDialog">
    <q-card style="width: 60vw; max-width: 60vw">
      <q-card-section class="row items-center q-pb-none">
       

        <q-space />
        <q-btn icon="close" @click="closeDialog" />
      </q-card-section>

      <q-card-section>
        <div>
          Vendor: <span class="text-grey"> {{ vendorName }}</span>
        </div>
        <div>
          Consultant: <span class="text-grey"> {{ consultant }}</span>
        </div>

        <div>
          Pay rate: <span class="text-grey"> {{ payRate.toLocaleString() }}</span>
        </div>
        <div>
        Service: <span class="text-grey"> {{ service }}</span>
        </div>
        <div>
          Total: <span class="text-grey">{{ total.toLocaleString() }}</span>
        </div>

        <div class="row items-center justify-between q-pb-lg q-pt-lg">
          <div>
            Week: {{ localData.week }}
            <span class="text-grey"> {{ localData.dates }}</span>
          </div>
          <q-td class="row">
            <div>
              <q-btn
                
                
                label="Approve"
                size="md"
                icon="check"
                class="q-mr-md text-weight-bold"
                color="primary text-black"
                 text-color="bg-negative"
                @click="approveInvoice"
              />
              <q-btn
                color="negative"
                text-color="white"
                
                label="Reject"
                size="md"
                icon="cancel"
                @click="openRejectDialog"
              />
            </div>
          </q-td>
        </div>
        <div v-if="fallowWeek" class="row items-center">
          <div class="effortLess bg-primary text-dark q-py-md" style="width: calc(100%)">
            No activity / tasks this week: {{ localData.fallow_week_id }}
          </div>
          
        </div>
        <div class="row output-row q-mb-sm q-col-gutter-sm fullwidth" v-else>
          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Monday"
            stack-label
            label-color="white"
            type="text"
            v-model="localData.days.monday"
            disable
          />
          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Tuesday"
            stack-label
            label-color="white"
            type="text"
            v-model="localData.days.tuesday"
            disable
          />
          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Wednesday"
            stack-label
            label-color="white"
            type="text"
            v-model="localData.days.wednesday"
            disable
          />
          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Thursday"
            stack-label
            label-color="white"
            type="text"
            v-model="localData.days.thursday"
            disable
          />
          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Friday"
            stack-label
            label-color="white"
            type="text"
            v-model="localData.days.friday"
            disable
          />

          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Saturday"
            stack-label
            label-color="white"
            type="text"
            v-model="localData.days.saturday"
            disable
          />
          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Sunday"
            stack-label
            label-color="white"
            type="text"
            v-model="localData.days.sunday"
            disable
          />
          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Total Units"
            stack-label
            label-color="white"
            type="text"
            v-model="localData.effort"
            disable
          />

         
        </div>
        <q-input
            class="col-12 q-mt-md"
            color="primary"
            outlined
            label="Notes"
            stack-label
            label-color="white"
            type="text"
            maxlength="255"
            autogrow
            v-model="localData.notes"
            disable
          />
      </q-card-section>

      <q-btn
        size="md"
        padding="sm lg"
        color="primary text-black"
        text-color="bg-negative"
        class="text-weight-bold q-mt-md float-right q-mb-md q-mr-md"
        @click="closeDialog"
      >
        ok
      </q-btn>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showRejectDialog">
    <q-card style="width: 50vw; max-width: 50vw">
      <q-card-section class="row items-center q-pb-none">
        <q-space />
        <q-btn icon="close" @click="closeRejectDialog" />
      </q-card-section>

      <q-card-section>
        <div class="row items-center justify-between q-pb-lg q-pt-lg"></div>
        <div class="q-mb-sm q-pa-md-sm">Why are you rejecting the Timesheet?</div>

        <div class="row output-row q-mb-sm q-col-gutter-sm fullwidth">
          <q-input
            class="col-12"
            color="primary"
            outlined
            label="Reason for Rejection"
            stack-label
            label-color="white"
            type="textarea"
            
            autogrow
            v-model="rejectionNote"
             
          />
        </div>
      </q-card-section>

      <q-btn
        size="md"
        padding="sm lg"
        color="primary text-black"
        text-color="bg-negative"
        class="text-weight-bold q-mt-md float-right q-mb-md q-mr-md"
        @click="rejectInvoice"
      >
        reject
      </q-btn>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue"
import { DateTime } from "luxon"
import { remove as _remove } from "lodash"
import { Config } from "src/modules/StaticData.js"
import { DateMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import SelectedInvoice from "src/components/consultant/SelectedInvoice.vue"
import NewSelectorForm from "src/components/NewSelectorForm.vue"
import { customerAuth } from "src/modules/AuthLogic.js"

export default defineComponent({
  name: "Invoices",
  component: { SelectedInvoice, NewSelectorForm },

  props: {
    customer_id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const selectedRecords = ref([])
    const showDialog = ref()
    const showRejectDialog = ref()
    const showTimesheetDialog = ref()
    const selectedOption_id = ref(null)
    const options = []

    const columns = ref([
      { name: "Consultant", align: "left", label: "Consultant", field: "consultant", sortable: false },
      { name: "Vendor", align: "left", label: "Vendor", field: "vendor_name", sortable: false },
      { name: "Start Date - End Date", align: "left", label: "Start Date - End Date", field: "dates" },
      { name: "Pay Rate", align: "left", label: "Pay Rate", field: "pay_rate" },
      { name: "Total", align: "left", label: "Total", field: "total" },
      { name: "action", label: "Action", field: "action", align: "left" },
    ])
    const saveDataResponse = ref()
    const saveDataMessage = ref("")
    const saveError = ref(false)
    const timesheet_id = ref(null)
    const invoices = ref([])
    const filterParams = ref("")

    const organisationType = ref("")
    const otherOrganisationType = ref("")

    

    return {
      
      organisationType,
      otherOrganisationType,
      filterParams,
      invoices,
      timesheet_id,
      options,
      selectedOption_id,
      showTimesheetDialog,
      showRejectDialog,
      showDialog,
      selectedRecords,
      columns,
      saveDataResponse,
      saveDataMessage,
      saveError,
      OrganisationTypeMethods,
    }
  },
  data() {
    return {
      symbol: null,
      customer: null,
      isAuthorised: false,
      isAdminAuthorised: false,
      newOutputPrompt: false,
      selectedWeek: DateTime.now().weekYear + "-" + DateTime.now().weekNumber,
      fallowWeek: null,
      vendorId: 0,
      vendorName: "",
      rejectionNote: "",
      payRate: "",
      total: "",
      consultant: "",
      service: "",

      localData: {
        dates: "",
        week: "",
        days: {
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
          sunday: 0,
        },
        total: 0,
        notes: "",
        effort: 0,
        fallow_week_id: null
      },
    }
  },

  computed: {
    organisationDetail(){
          return this.$store.getters["admin/getOrganisation"]


        },
    isBuiltEnvironment() {
      return false
    },
    rows() {
      const records = []
      if (this.invoices.length) {
        for (let index = 0; index < this.invoices.length; index++) {
          const record = this.invoices[index]
          const item = {
            week: record.week.replace("W", ""),
            service: record.service,
            consultant: record.consultant,
            dates: this.formatDate(record.start_date),
            pay_rate: `${this.symbol}${Number(record.pay_rate).toFixed(2)}`,
            total: `${this.symbol}${Number(record.total).toLocaleString()}`,
            timesheet_id: record.timesheet_id,
            vendor_id: record.vendor_id,
            vendor_name: record.vendor,
            notes: record.notes,
            days: record.days,
            status: record.status,
            fallow_week_id: record.fallow_week_id
          }
          records.push(item)
        }
      }
      records.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year
        return b.week - a.week
      })
      return records
    },
  },
  watch: {
    customer_id(newId) {
      const { customer, isAuthorised, isAdminAuthorised } =
        customerAuth(newId);
      this.customer = customer.value;
      this.isAuthorised = isAuthorised.value;
      this.isAdminAuthorised = isAdminAuthorised.value;
    },
    
    selectedOption_id(newVal) {
      this.filterParams = newVal.value
      this.fetchFilteredInvoices()
    },
    selectedRecords(newVal) {
      for (let index = newVal.length - 1; index >= 0; index--) {
        const record = newVal[index]
        if (record.submitted === 1) {
          newVal.splice(index, 1)
        }
      }
    },
  },
 

  created() {
    this.symbol = this.organisationDetail.currency.symbol;
    this.$store.dispatch("consultant/getInvoicesApproval").then((invoices) => {
      this.invoices = invoices
      this.populateConsultantOptions()
    })
    const { customer, isAuthorised, isAdminAuthorised } = customerAuth(this.customer_id);
    this.isAuthorised = isAuthorised.value;
    this.isAdminAuthorised = isAdminAuthorised.value;
    this.customer = customer.value.name
    
  },
  methods: {
    populateConsultantOptions() {
      const uniqueConsultants = new Map()

      this.invoices.forEach((invoice) => {
        if (invoice.consultant_id && invoice.consultant && !uniqueConsultants.has(invoice.consultant_id)) {
          uniqueConsultants.set(invoice.consultant_id, {
            label: invoice.consultant,
            value: invoice.consultant_id,
          })
        }
      })

      // Filter out existing consultant options from this.options
      const existingConsultantIds = new Set(this.options.map((opt) => opt.value))

      const newConsultants = Array.from(uniqueConsultants.values())
        .filter((consultant) => !existingConsultantIds.has(consultant.value))
        .map((consultant, index) => ({
          ...consultant,
          id: this.options.length + index + 1,
        }))

      // Append only new consultants to the options list
      this.options = [...this.options, ...newConsultants]
    },

    fetchFilteredInvoices() {
  const params = {
    "filters[status]": this.filterParams
  };

  if (this.selectedCustomerId) {
    params.customer_id = this.selectedCustomerId;
  }

  this.$store
    .dispatch("consultant/getInvoicesApproval", params)
    .then((invoices) => {
      this.invoices = invoices;
    })
    .catch((error) => {
      console.error(error);
    });
}
,
    async approveInvoice() {
      if (this.timesheet_id) {
        try {
          // Step 1: Approve timesheet
          await this.$store.dispatch("consultant/acceptTimesheetApproval", this.timesheet_id)

          // Step 2: Notify success
          this.$q.notify({ type: "positive", message: "Timesheet accepted successfully!" })
          this.showDialog = false
          // Step 3: Get invoice approval data and assign to this.invoice
          const invoiceData = await this.$store.dispatch("consultant/getInvoicesApproval")
          this.invoices = invoiceData
        } catch (error) {
          this.$q.notify({
            type: "negative",
            message: error?.message || "Failed to accept timesheet.",
          })
        }
      }
    },
    async rejectInvoice() {
      try {
        const result = await this.$store.dispatch("consultant/rejectTimesheet", {
          timesheet_id: this.timesheet_id,
          reason: this.rejectionNote,
        })

        this.$q.notify({ type: "positive", message: "Timesheet rejected successfully!" })

        const invoiceData = await this.$store.dispatch("consultant/getInvoicesApproval")
        this.invoices = invoiceData
        this.closeRejectDialog()
        this.showDialog = false
      } catch (error) {
        this.$q.notify({ type: "negative", message: error || "Failed to reject timesheet." })
      }
    },

    openDialog: function (row) {
     // console.log("checking data", row)
      this.payRate = row.pay_rate
      this.total = row.total
      this.service = row.service
      this.consultant = row.consultant
      this.timesheet_id = row.timesheet_id
      this.localData.days = row.days[0]
      this.vendorName = row.vendor_name
      this.localData.notes = row.notes
      this.localData.week = row.week
      this.localData.dates = row.dates
      this.localData.effort = Object.values(row.days[0]).reduce((sum, val) => sum + Number(val), 0)
      this.localData.fallow_week_id = row.fallow_week_id === "1" ? "Sickness" : row.fallow_week_id === "2" ? "Leave" : null 
      this.fallowWeek = row.fallow_week_id === "1" ? true : row.fallow_week_id === "2" ? true : false
      this.showDialog = true
    },
    closeDialog: function () {
      this.showDialog = false
    },
    closeApproveDialog: function () {
      this.showDialog = false
      this.showTimesheetDialog = true
    },
    openRejectDialog: function () {
      this.showRejectDialog = true
    },
    closeRejectDialog: function () {
      this.showRejectDialog = false
    },
    closeTimesheetDialog: function () {
      this.showTimesheetDialog = false
    },

    formatDate: function (date) {
      const start = DateTime.fromISO(DateMethods.convertDateFormat(date, "/", "-"))
        .startOf("week")
        .toFormat(Config.DATE_FORMAT_DLY)
      const end = DateTime.fromISO(DateMethods.convertDateFormat(date, "/", "-"))
        .endOf("week")
        .toFormat(Config.DATE_FORMAT_DLY)
      return start + " - " + end
    },
    goBackTwoPages: function () {
  window.history.go(-2);
},
    goBack: function () {
      window.history.back()
    },
  },
})
</script>

<style scoped>
.details {
  font-size: 1.2rem;
}

.details2 {
  font-size: 1.1rem;
}
</style>

<style>
.bordered {
  border: 1px solid rgba(0, 0, 0, 0.24);
}

.bordered tr.selected {
  background-color: rgba(76, 175, 80, 0.04);
}

.bordered .q-table th {
  font-weight: 600;
  font-size: 0.9rem;
}

.totals {
  font-size: 1rem;
  font-weight: 600;
}
.w-standard {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}
</style>
