<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Spend Reports</div>
      <BreadCrumb align="center" :organisation="vendor" v-if="is_authorised" />
      <div v-if="is_authorised" class="column q-mt-lg">
        <h1>Spend Reports</h1>
        <new-selector-form
          v-model:option_id="selectedCustomerID"
          label="Select Customer"
          filled
          is-clearable
          :options="customers"
          is-filterable
          filter-key="name"
          classes="q-gutter-md row"
          default-class="full-width"
          style="width: 350px; padding-bottom: 32px"
          no-option-label="No results"
          autofocus
        />
        <div v-if="selectedCustomerID > 0">
          <div class="q-mb-xl">
            <div class="status-heading">Pending Vendor Approval</div>
            <q-list v-if="unapproved_reports.length" dense padding class="q-gutter-md">
              <q-item v-for="report in unapproved_reports" :key="report.id" :to="reportLink(report.id)">
                <q-item-section avatar>
                  <q-icon size="lg" color="primary" name="summarize" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ report.customer_name }} - {{ report.period_label }}</q-item-label>
                  <q-item-label caption class="text-primary">
                    {{ report.period_start_date }} - {{ report.period_end_date }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="none-message">
              There are no pending Spend Reports. Go to
              <router-link :to="deliveryDataLink"> Delivery Data</router-link>
              to create one.
            </div>
          </div>
          <div class="q-mb-xl">
            <div class="status-heading">Pending Customer Approval</div>
            <q-list v-if="vendor_approved_reports.length" dense padding class="q-gutter-md">
              <q-item v-for="report in vendor_approved_reports" :key="report.id" :to="reportLink(report.id)">
                <q-item-section avatar>
                  <q-icon size="lg" color="primary" name="summarize" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ report.customer_name }} - {{ report.period_label }}</q-item-label>
                  <q-item-label caption class="text-primary">
                    {{ report.period_start_date }} - {{ report.period_end_date }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="none-message">There are no reports to display</div>
          </div>
          <div class="q-mb-xl">
            <div class="status-heading">Fully Approved Reports</div>
            <q-list v-if="customer_approved_reports.length" dense padding class="q-gutter-md">
              <q-item v-for="report in customer_approved_reports" :key="report.id" :to="reportLink(report.id)">
                <q-item-section avatar>
                  <q-icon size="lg" color="primary" name="summarize" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ report.customer_name }} - {{ report.period_label }}</q-item-label>
                  <q-item-label caption class="text-primary">
                    {{ report.period_start_date }} - {{ report.period_end_date }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="none-message">There are no reports to display</div>
          </div>
        </div>
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue"
import { ClassCombinations } from "src/modules/StaticData.js"
import { vendorAuth } from "src/modules/AuthLogic.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

export default defineComponent({
  name: "SpendReports",
  components: {
    BreadCrumb,
    NewSelectorForm
  },
  props: ["vendor_id"],
  setup() {
    return {
      ClassCombinations
    }
  },
  data() {
    const { vendor, isAuthorised, isAdminAuthorised } = vendorAuth(this.vendor_id)

    return {
      selectedCustomerID: null,
      vendor,
      isAuthorised,
      isAdminAuthorised
    }
  },
  computed: {
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    is_vendor_admin: function() {
      return this.user && (this.user.roles?.includes("vendor_admin") || this.user.badge === "super")
    },
    vendorDashboardLink: function() {
      return "/vendor/" + this.vendor_id
    },
    deliveryDataLink: function() {
      return "/vendor/" + this.vendor_id + "/delivery-management"
    },
    vendor_access: function() {
      return this.$store.getters["vendor/getVendors"]
    },
    is_authorised: function() {
      if (this.user && this.user.badge === "super") {
        return true
      }
      const result = this.vendor_access.find(obj => parseInt(obj.id) === parseInt(this.vendor_id))
      return !!result
    },
    customers: function() {
      return this.$store.getters["vendor/getCustomersByVendor"](parseInt(this.vendor_id))
    },
    reports: function() {
      return this.$store.getters["vendor/getSpendReports"](parseInt(this.vendor_id))
    },
    selectedCustomerReports: function() {
      return this.reports.filter(report => report.customer_id === this.selectedCustomerID)
    },
    vendor_approved_reports: function() {
      const a = []
      for (let index = 0; index < this.selectedCustomerReports.length; index++) {
        const report = this.selectedCustomerReports[index]
        if (report.vendor_approved === 1 && report.customer_approved === 0) {
          a.push(report)
        }
      }
      return a
    },
    customer_approved_reports: function() {
      const a = []
      for (let index = 0; index < this.selectedCustomerReports.length; index++) {
        const report = this.selectedCustomerReports[index]
        if (report.customer_approved === 1) {
          a.push(report)
        }
      }
      return a
    },
    unapproved_reports: function() {
      const a = []
      for (let index = 0; index < this.selectedCustomerReports.length; index++) {
        const report = this.selectedCustomerReports[index]
        if (report.vendor_approved === 0) {
          a.push(report)
        }
      }
      return a
    }
  },
  mounted() {
    if (this.is_vendor_admin) {
      if (!this.vendor_access || this.vendor_access.length < 1) {
        this.$store.dispatch("vendor/getVendorAccess").then(() => {
          this.getReportsData()
          this.getCustomers()
        }).catch(e => {
          alert(e.data.message || e.statusText)
        })
      } else {
        this.getReportsData()
        this.getCustomers()
      }
    }
  },
  methods: {
    getReportsData: function() {
      this.$store.dispatch("vendor/getReports", parseInt(this.vendor_id))
    },
    getCustomers: function() {
      if (!this.customers.length) {
        this.$store.dispatch("vendor/getVendorCustomers", this.vendor_id)
      }
    },
    reportLink: function(id) {
      return "/vendor/" + this.vendor_id + "/financial-management/spend-reports/" + id
    }
  }
})
</script>

<style scoped>
h1 {
  line-height: 2rem;
}

.none-message {
  font-style: italic;
}

.status-heading {
  font-weight: 600;
  font-size: larger;
}
</style>
