<template>
      <q-page >
        <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xl swlvd-container-bg">
          <div class="row justify-center">
            <div class="text-h2 text-center text-weight-bold text-white q-mt-md">Generate Invoices</div>
            
          </div>
          <div class="q-pa-md flex justify-center">
            <div class="text-h6">
            <span class="text-primary cursor-pointer" @click="goBackTwoPages">{{ vendor }}</span>  / <span class="text-primary cursor-pointer" @click="goBack">Timesheet Management</span>  /
            <span>Invoice</span>
          </div>
          </div>
          
    
          <div class="row items-center justify-between q-pb-lg q-pt-lg">
            <div>
             
            </div>
            <q-td  class="row">
              <div>
                <q-btn
                  color="primary"
                  text-color="black"
                  
                  label="Generate"
                  size="md"
                  class="q-mr-md text-weight-bold"
                  @click="handleGenerateInvoice"
                   :disable="!invoiceStatus"
                
                />
              </div>
            </q-td>
          </div>
          <q-table
            v-model:selected="selectedRecords"
            selection="multiple"
            flat
            :grid="$q.screen.xs"
            color="primary"
            :rows="rows"
            :columns="invoiceColumns"
            row-key="timesheet_id"
             :pagination="{ rowsPerPage: 50 }"
            class="bordered"
            table-header-class="text-weight-bolder text-primary "
          >
          
            <template #body-cell-action="props" >
              
              <q-td :props="props" class="row q-mt-sm">
                <div>
                  <q-btn
                    color="primary"
                    outline
                    label="View Record"
                    size="sm"
                    class="q-mr-md "
                    @click="openDialog(props.row)"
                  />
                </div>
              </q-td>
            </template>
          </q-table>
    
          <q-separator class="q-my-md" />
    
          
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
              Consultant: <span class="text-grey"> {{ consultant }}</span>
            </div>
            <div>
              Customer: <span class="text-grey"> {{ customer }}</span>
            </div>
            <div>
              Service: <span class="text-grey"> {{ service }}</span>
            </div>
            <div class= "q-mb-md">
                Week: {{ localData.week }}
                <span class="text-grey"> {{ localData.dates }} </span>
              </div>
           
              <div v-if="fallowWeek" class="row items-center">
          <div class="effortLess bg-primary text-dark q-py-md" style="width: calc(100% )">
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
    </template>
    
    <script>
    import { defineComponent, ref } from "vue"
    import { DateTime } from "luxon"
    import { remove as _remove } from "lodash"
    import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
    import SelectedInvoice from "src/components/consultant/SelectedInvoice.vue"
    import NewSelectorForm from "src/components/NewSelectorForm.vue"
    import { Config } from "src/modules/StaticData.js"
    import { DateMethods } from "src/modules/GlobalMethods.js"
    import { vendorAuth } from "src/modules/AuthLogic.js"
    
    
    export default defineComponent({
      name: "Generate Invoices",
      component: { SelectedInvoice, NewSelectorForm },
    
     props: {
    engagement_id: {
      type: String,
      required: true
    },
    vendor_id: {
      type: String,
      required: true
    }
  },
      
      setup() {
        const selectedRecords = ref([])
        const showDialog = ref()
        
        const showTimesheetDialog = ref()
        const selectedOption_id = ref(null)
        const options = [
          { label: "Not yet approved", value: "Not yet approved", id: 1 },
          { label: "Approved", value: "Approved", id: 2 },
          { label: "Invoiced", value: "Invoiced", id: 3 },
          { label: "Not approved", value: "Not approved", id: 4 },
        ]
    
        const invoiceColumns = ref([
        { name: "Customer", required: true, label: "Customer", align: "left", field: "customer", sortable: true },
          { name: "Consultant", required: true, label: "Consultant", align: "left", field: "consultant", sortable: true },
          { name: "Week", required: true, label: "Week", align: "left", field: "week", sortable: true },
          { name: "Start Date - End Date", align: "left", label: "Start Date - End Date", field: "dates" },
          { name: "Pay Rate", align: "left", label: "Pay Rate", field: "pay_rate" },
          { name: "Effort", align: "left", label: "Units", field: "effort" },
          { name: "Total", align: "left", label: "Total", field: "total" },
          { name: "action", label: "Action", field: "action", align: "left" },
        ])
    
        const saveDataResponse = ref()
        const saveDataMessage = ref("")
        const saveError = ref(false)
        const generatedId = ref([])
        const invoices = ref([])
        
        
    
        return {
         
          invoices,
          generatedId,
          options,
          selectedOption_id,
          showTimesheetDialog,
          showDialog,
          selectedRecords,
          invoiceColumns,
          saveDataResponse,
          saveDataMessage,
          saveError,
          OrganisationTypeMethods,
        }
      },
      data() {
        return {
          symbol: null,
          vendor: null,
          isAuthorised: false,
          isAdminAuthorised: false,
          invoiceStatus: false,
          newOutputPrompt: false,
          selectedWeek: DateTime.now().weekYear + "-" + DateTime.now().weekNumber,
          fallowWeek: null,
          vendorId: 0,
          consultant: "",
          service:"",
          customer: "",
          submittedData:false,
          excludeTimesheet: false,
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
            effort: 0,
            notes: "",
            fallow_week_id : null
          },
        }
      },
    
      computed: {
        organisationDetail(){
          return this.$store.getters["admin/getOrganisation"]


        },
        selectedTimesheetIds() {
          return this.selectedRecords.map((record) => record.timesheet_id)
        },
        rows() {
          const records = []
          if (this.invoices.length) {
           
            for (let index = 0; index < this.invoices.length; index++) {
              const record = this.invoices[index]
              const item = {
                customer: record.customer? record.customer : "N/A",
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
                effort: record.effort,
                id: record.timesheet_id,
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
            vendor_id(newId) {
    const { vendor, isAuthorised, isAdminAuthorised } = vendorAuth(newId)
    this.vendor = vendor.value.name   // or `.value` if you want the full object
    this.isAuthorised = isAuthorised.value
    this.isAdminAuthorised = isAdminAuthorised.value
  },
        selectedRecords(newSelection) {
          this.invoiceStatus = newSelection.length > 0;
          const selectedIds = newSelection.map((row) => row.timesheet_id)
          this.generatedId = selectedIds
        },
      },
      created() {
        
        this.symbol = this.organisationDetail.currency.symbol;
            const { vendor, isAuthorised, isAdminAuthorised} = vendorAuth(this.vendor_id);
            this.isAuthorised = isAuthorised.value
    this.isAdminAuthorised = isAdminAuthorised.value;
            this.vendor = vendor.value.name
    
        this.$store
          .dispatch("vendor/getInvoices", {
            "filters[status]": "created",
          })
          .then((invoices) => {
           
            this.invoices = invoices
          })
      },
      methods: {
        handleGenerateInvoice() {
          const payload = {
            timesheet_id: this.generatedId,
          }
    
          this.$store
            .dispatch("vendor/generateInvoice", payload)
            .then(() => {
              this.$q.notify({
                type: "positive",
                message: "Invoices generated successfully!",
              })
    
              // Dispatch the second action here
              return this.$store.dispatch("vendor/getInvoices", {
                "filters[status]": "created",
              })
            })
            .then((invoices) => {
              this.invoices = invoices
            })
            .catch((error) => {
              this.$q.notify({
                type: "negative",
                message: error?.message || "Failed to generate invoice.",
              })
            })
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
    
        openDialog: function (row) {
           // console.log("data", row)
          this.localData.days = row.days[0]
          this.service = row.service
          this.consultant = row.consultant
          this.localData.notes = row.notes
          this.localData.week = row.week
          this.localData.dates = row.dates
          this.localData.effort = row.effort
          this.customer = row.customer
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
       
        closeTimesheetDialog: function () {
          this.showTimesheetDialog = false
        },
        goBack: function () {
          window.history.back()
        },
        goBackTwoPages: function () {
  window.history.go(-2);
}
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
    