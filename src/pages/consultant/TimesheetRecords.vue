<template>
  <q-page>
    <div class="row justify-center q-pa-md swlvd-container-bg">
      <div class="col-12 col-md-10 col-lg-8">
        <div class="text-h2 q-pt-lg text-weight-bold text-center text-white">Timesheet Records</div>

        
        <div class="q-mb-sm q-pa-md-sm">Manage Your Timesheet Records</div>
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

        <div class="row  justify-end q-mb-sm">
          
         
          <div>
            <router-link :to="newTimesheetLink(engagement.id)">
              <q-btn
                size="md"
                padding="sm lg"
                color="primary text-dark"
                text-color="bg-negative"
                class="text-weight-bold q-mt-md"
              >
                <q-icon color="dark" name="save" /> Add record
              </q-btn>
            </router-link>
          </div>
        </div>

       
        <q-table
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
                  label="Edit"
                  :disable="
                    props.row.status === 'submitted' ||
                    props.row.status === 'accepted' ||
                    props.row.status === 'invoiced'
                  "
                  size="sm"
                  class="q-mr-md q-mt-xs"
                  @click="openDialog(props.row)"
                />
              </div>
            </q-td>
          </template>
          <template #bottom-row>
            <q-tr>
              <q-td colspan="" class="">Total: {{symbol}}{{ totalVal.toLocaleString() }}</q-td>
            </q-tr>
          </template>
        </q-table>

        <!-- <div class="row">
          <p class="q-mt-lg q-mr-lg text-primary text-decoration-underline cursor-pointer" @click="goBack">
            View Dashboard
          </p>
        </div> -->
         <router-link :to="dashboardLink()" class="text-primary "  style="text-decoration: none">
                  View Dashboard
                </router-link>
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
        <div class="row items-center justify-between q-pb-lg q-pt-lg">
          <div>
            Week: {{ localData.week }}
            <span class="text-grey"> {{ localData.dates }}</span>
          </div>
        </div>
        <div v-if="fallowWeek" class="row items-center">
          <div class="effortLess bg-primary text-dark q-py-md" style="width: calc(100% - 40px)">
            No activity / tasks this week: {{ fallowText}}
          </div>
          <div style="width: 40px">
            <q-btn
              icon="remove"
              class="remove-button q-mx-md"
              color="negative"
              round
              size="xs"
              @click="removeFallowWeek"
            />
          </div>
        </div>
        <div class="row output-row q-mb-sm q-col-gutter-sm fullwidth" v-if="!fallowWeek">
          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Monday"
            stack-label
            label-color="white"
            type="number"
            v-model="localData.days.monday"
          />
          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Tuesday"
            stack-label
            label-color="white"
            type="number"
            v-model="localData.days.tuesday"
          />
          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Wednesday"
            stack-label
            label-color="white"
            type="number"
            v-model="localData.days.wednesday"
          />
          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Thursday"
            stack-label
            label-color="white"
            type="number"
            v-model="localData.days.thursday"
          />
          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Friday"
            stack-label
            label-color="white"
            type="number"
            v-model="localData.days.friday"
          />

          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Saturday"
            stack-label
            label-color="white"
            type="number"
            v-model="localData.days.saturday"
          />
          <q-input
            class="col-12 col-sm-6 col-md-3"
            color="primary"
            outlined
            label="Sunday"
            stack-label
            label-color="white"
            type="number"
            v-model="localData.days.sunday"
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
            readonly
          />


        </div>
        <q-input
            class="col-12 q-mt-md q-mb-md"
            color="primary"
            outlined
            label="Notes"
            stack-label
            label-color="white"
            type="textarea"
            maxlength="255"
            autogrow
            v-model="localData.notes"
          />
          <q-input
          v-if="localData.rejectionReason !== null"
            class="col-12"
            color="primary"
            outlined
            label="Rejection Reason"
            stack-label
            label-color="white"
            type="text"
            maxlength="255"
            readonly
            autogrow
            v-model="localData.rejectionReason"
          />
      </q-card-section>
      <div class="row items-center q-mb-md q-pa-md">
        <q-btn-dropdown label="Copy Week" color="primary" outline icon="content_copy">
          <q-list>
            <q-item v-for="week in validWeeks" :key="week.label" v-close-popup clickable @click="selectWeek(week)">
              <q-item-section>
                <q-item-label>{{ week.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn-dropdown class="q-ml-sm q-mr-sm" label="Fallow week" color="accent" icon="flaky">
          <q-list>
            <q-item
              v-for="item in fallowReasons"
              :key="item.value"
              v-close-popup
              clickable
              @click="setFallowWeek(item.id)"
            >
              <q-item-section>
                <q-item-label>{{ item.reason }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- this pushes itself all the way to the right -->
        <q-btn
          class="q-ml-auto text-weight-bold"
          size="md"
          padding="sm lg"
          color="primary text-black"
          text-color="bg-negative"
          @click="updateRecord"
        >
          Update
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from "vue"
import { DateTime } from "luxon"
import { remove as _remove } from "lodash"
import { Config } from "src/modules/StaticData.js"
import { DateMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"

export default defineComponent({
  name: "TimesheetRecords",

  props: ["engagement_id"],
  setup() {
    //const selectedRecords = ref([])
    const selectedOption_id = ref(null)
    const options = [
      { label: "Created", value: "created", id: 1 },
      { label: "Submitted", value: "submitted", id: 2 },
      { label: "Rejected", value: "rejected", id: 3 },
      { label: "Accepted", value: "accepted", id: 4 },
      { label: "Invoiced", value: "invoiced", id: 5 },
    ]
    const columns = ref([
      { name: "Customer", align: "left", label: "Customer", field: "customer", sortable: false },
      { name: "Vendor", align: "left", label: "Vendor", field: "vendor_name", sortable: false },
      { name: "Start Date - End Date", align: "left", label: "Start Date - End Date", field: "dates" },
      { name: "Status", align: "left", label: "Status", field: "status" },
      { name: "Effort", align: "left", label: "Units", field: "effort" },
      { name: "Pay Rate", align: "left", label: "Pay Rate", field: "pay_rate" },
      { name: "Total", align: "left", label: "Total", field: "total" },
      { name: "action", label: "Action", field: "action", align: "left" },
    ])
    const saveDataResponse = ref()
    const saveDataMessage = ref("")
    const saveError = ref(false)
    const invoices = ref([])
    const additionalFilter = ref([])
    const totalValue = ref(0)
    const filterParams = ref("")
    const isBuiltEnvironment = ref("")
    const showDialog = ref()
    return {
      showDialog,
      isBuiltEnvironment,
      additionalFilter,
      filterParams,
      totalValue,
      invoices,
      selectedOption_id,
      options,

      columns,
      initialPagination: {
        rowsPerPage: 0,
      },
      saveDataResponse,
      saveDataMessage,
      saveError,
      OrganisationTypeMethods,
    }
  },
  data() {
    return {
      symbol: null,
      fallowWeek: false,
      fallowText: "",
      weeks: {},
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
        fallow_week_id : null,
        rejectionReason: null,

      },
    }
  },
  computed: {
    organisationDetail(){
          return this.$store.getters["consultant/getOrganisation"]


        },
    fallowReasons() {
      return this.$store.getters["consultant/getFallowWeek"]
    },
    validWeeks() {
      return Object.entries(this.weeks)
        .filter(([key, value]) => value !== null)
        .map(([key, value]) => ({
          label: key,
          value: value,
        }))
    },
    rows() {
      const records = []
      let totalSum = 0
      if (this.invoices.length) {
        for (let index = 0; index < this.invoices.length; index++) {
          const record = this.invoices[index]
          totalSum += Number(record.total)
          const item = {
            customer: record.customer ? record.customer : "N/A",
            week: record.week,
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
            reason: record.reason,
            fallow_week_id: record.fallow_week_id
          }
          records.sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year
            return b.week - a.week
          })

          records.push(item)
        }
      }
      records.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year
        return b.week - a.week
      })

      return records
    },
    totalVal() {
      return this.invoices.reduce((acc, record) => acc + Number(record.total || 0), 0)
    },

    engagements() {
      return this.$store.getters["consultant/getEngagements"]
    },
    engagement() {
      if (this.engagements.length) {
        const id = parseInt(this.engagement_id)
        return this.engagements.find(function (engagement) {
          if (engagement.id === id) {
            return engagement
          }
          return false
        })
      }
      return false
    },
  },
  watch: {
    fallowReasons: function (val) {
      if (val && val.length) {
        if (this.current_record && this.current_record.fallow_week_id) {
          this.setFallowWeek(this.current_record.fallow_week_id, true)
        }
      }
    },
    "localData.days": {
      handler() {
        const toNumber = (val) => Number(val) || 0

        this.localData.effort =
          toNumber(this.localData.days.monday) +
          toNumber(this.localData.days.tuesday) +
          toNumber(this.localData.days.wednesday) +
          toNumber(this.localData.days.thursday) +
          toNumber(this.localData.days.friday) +
          toNumber(this.localData.days.saturday) +
          toNumber(this.localData.days.sunday)
      },
      deep: true,
      immediate: true,
    },

    // invoices: {
    //   handler() {
    //     this.updateOptionsWithVendors()
    //   },
    //   deep: true,
    //   immediate: true,
    // },
    selectedOption_id(newVal) {
      this.filterParams = newVal.value
      this.fetchFilteredInvoices()
    },
  },
  created: async function () {
   
    this.$store.dispatch("consultant/fallowWeek").then(() => {
      if (this.current_record && this.current_record.fallow_week_id) {
        this.setFallowWeek(this.current_record.fallow_week_id, true)
      }
    })
    try {
    // Step 1: Fetch engagements
    await this.$store.dispatch("consultant/engagements");

    // Step 2: Get the engagements directly from Vuex state
    const engagements = this.$store.state.consultant.engagements;

    if (engagements.length > 0) {
      this.vendorId = engagements[0].vendor_id;

      // Step 3: Fetch copy week
      const weeks = await this.$store.dispatch("consultant/copyWeek", {
        vendor_id: this.vendorId
      });
      this.weeks = weeks;

      // Step 4: Now fetch organisation
      const orgData = await this.$store.dispatch("consultant/getOrganisation", this.vendorId);
      this.symbol = orgData.currency.symbol;
      
    } else {
      console.warn("No engagements found.");
    }
  } catch (error) {
    console.error("Error during initial load:", error);
  }
  //   await this.$store.dispatch("consultant/engagements")
  //   if(this.engagements.length > 0) {
  //     this.vendorId = this.engagements[0].vendor_id

  //     await this.$store.dispatch("consultant/copyWeek", { vendor_id: this.vendorId }).then((weeks) => {
  //       this.weeks = weeks

  //     })
  //     try {
  //   const data = await this.$store.dispatch("consultant/getOrganisation", this.vendorId);
  //   this.symbol = data.currency.symbol;
  //   console.log("Organisation fetched:", data);
  // } catch (err) {
  //   console.error("Failed to fetch organisation:", err);
  // }
  //   }
    this.$store.dispatch("consultant/getTimesheet", { engagement_id: this.engagement_id })
.then((invoices) => {
  this.invoices = invoices;
})
.catch((error) => {
  console.error(error);
});

// await this.$store
//     .dispatch("consultant/getOrganisation",  this.vendorId) // or pass dynamic ID
//     .then((data) => {
//       this.symbol = data.currency.symbol
//       console.log("Organisation fetched:", data);
//     })
//     .catch((err) => {
//       console.error("Failed to fetch organisation:", err);
//     });




  },
  methods: {
    removeFallowWeek() {
      this.fallowWeek = false
      this.localData.fallow_week_id = null
    },
    setFallowWeek: function (id) {
      this.fallowWeek = true
      this.localData.days.monday = 0
      this.localData.days.tuesday = 0
      this.localData.days.wednesday = 0
      this.localData.days.thursday = 0
      this.localData.days.friday = 0
      this.localData.days.saturday = 0
      this.localData.days.sunday = 0
      this.localData.effort = 0

      if (id && this.fallowReasons && this.fallowReasons.length) {
        const fallowWeekSelected = this.fallowReasons.find((item) => item.id === id)
        this.fallowText = fallowWeekSelected.reason
        this.localData.fallow_week_id = fallowWeekSelected.id
      }
    },
    selectWeek(week) {
      this.localData.days = week.value
      // do something with it
    },
    openDialog: function (row) {
      const clonedRow = JSON.parse(JSON.stringify(row))
      console.log("cloned data", clonedRow)// 👈 deep clone all at once
      this.localData.rejectionReason = clonedRow.reason
      this.localData.fallow_week_id  = clonedRow.fallow_week_id
      this.fallowText = clonedRow.fallow_week_id === "1" ? "Sickness" : "Leave"
      this.localData.days = clonedRow.days[0]
      this.localData.effort = clonedRow.effort
      this.localData.notes = clonedRow.notes
      this.localData.week = clonedRow.week
      this.localData.dates = clonedRow.dates
      this.consultant = clonedRow.consultant
      this.timesheet_id = clonedRow.timesheet_id
      this.vendorName = clonedRow.vendor_name
      this.payRate = clonedRow.pay_rate




      if (clonedRow.fallow_week_id === "1"  || clonedRow.fallow_week_id  === "2") {
        this.fallowWeek = true
      } else {
        this.fallowWeek = false
      }

      this.showDialog = true
    },
    closeDialog: function () {
      this.showDialog = false
    },


    updateRecord: function () {
  this.$store
    .dispatch("consultant/updateTimesheet", {
      timesheet_id: this.timesheet_id,
      data: this.localData,
    })
    .then((response) => {
      this.$q.notify({ type: "positive", message: response.message });

      // ✅ Use prop engagement_id here
      if (this.engagement_id) {
        this.$store.dispatch("consultant/getTimesheet", { engagement_id: this.engagement_id })
          .then((invoices) => {
            this.invoices = invoices;
          });
      } else {
        console.warn("engagement_id prop is missing");
      }

      this.closeDialog();
    })
    .catch((error) => {
      console.log("update error", error);
      this.$q.notify({ type: "negative", message: error || "Failed to update timesheet." });
    });
},


    fetchFilteredInvoices() {
  this.$store
    .dispatch("consultant/getTimesheet", {
      engagement_id: this.engagement_id,
      status: this.filterParams, // assuming this.filterParams is something like "created"
    })
    .then((invoices) => {
      this.invoices = invoices;
    })
    .catch((error) => {
      console.error(error);
    });
}
,
    goBack: function () {
     // window.history.back()
      return "/consultant"
    },
    dashboardLink() {
  return "/consultant"
},

    newTimesheetLink: function (id) {
      return "/add-record/" + id + "/new"
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
