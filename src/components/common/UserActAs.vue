<template>
  <div>
    <div v-if="is_super_admin" class="q-m-lg q-pa-lg relative-position">
      <div class="row q-pb-lg q-col-gutter-lg">
        <div class="col-12 col-md-6 text-center">
          <div class="text-h5 q-mb-md text-bold">Access Vendor Dashboards</div>
          <q-list dense v-if="all_vendors.length === 1">
            <q-item
              :to="vendorDashboardLink(all_vendors[0])"
              class="q-mb-md q-pa-md"
              style="border-radius: 5px"
            >
              <q-item-section avatar>
                <q-icon color="secondary" name="change_history" />
              </q-item-section>
              <q-item-section>{{ all_vendors[0].name }}</q-item-section>
            </q-item>
          </q-list>
          <div v-else>
            <div class="row justify-center">
              <new-selector-form
                v-model:option_id="selectedVendorID"
                is-filterable
                filter-key="name"
                :options="all_vendors"
                label="Select Vendor"
                classes="col-12 col-lg-8"
                default-class="full-width"
              />
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 text-center">
          <div class="text-h5 q-mb-md text-bold">Access Customer Dashboards</div>
          <q-list dense v-if="all_customers.length === 1">
            <q-item
              :to="customerDashboardLink(all_customers[0])"
              class="q-mb-md q-pa-md"
              style="border-radius: 5px"
            >
              <q-item-section avatar>
                <q-icon color="secondary" name="change_history" />
              </q-item-section>
              <q-item-section>{{ all_customers[0].name }}</q-item-section>
            </q-item>
          </q-list>
          <div v-else>
            <div class="row justify-center">
              <new-selector-form
                v-model:option_id="selectedCustomerID"
                is-filterable
                filter-key="name"
                :options="all_customers"
                label="Select Customer"
                classes="col-12 col-lg-8"
                default-class="full-width"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- <q-badge color="orange" floating>Super Admin</q-badge> -->
      <q-separator class="q-mt-md q-mx-auto bg-primary" width="50%" />
    </div>
    <div class="row q-col-gutter-lg">
      <div v-if="is_vendor_user || is_vendor_admin" class="column col items-center">
        <div class="q-pa-lg relative-position">
          <div class="text-h5 q-mb-md">Vendor Dashboard</div>
          <q-list dense>
            <q-item
              v-for="vendor in vendor_access"
              :key="vendor.id"
              :to="vendorDashboardLink(vendor)"
              class="q-mb-md q-pa-md"
              style="border-radius: 5px"
            >
              <q-item-section avatar>
                <q-icon color="secondary" name="change_history" />
              </q-item-section>
              <q-item-section>{{ vendor.name }}</q-item-section>
            </q-item>
          </q-list>
          <!-- <q-badge color="orange" floating>Vendor User</q-badge> -->
        </div>
      </div>
      <div v-if="is_customer_user || is_customer_admin" class="column col items-center">
        <div class="q-pa-lg relative-position">
          <div class="text-h5 q-mb-md">Customer Dashboard</div>
          <q-list dense>
            <q-item
              v-for="customer in customer_access"
              :key="customer.id"
              :to="customerDashboardLink(customer)"
              class="q-mb-md q-pa-md"
              style="border-radius: 5px"
            >
              <q-item-section avatar>
                <q-icon color="secondary" name="change_history" />
              </q-item-section>
              <q-item-section>{{ customer.name }}</q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NewSelectorForm from "components/NewSelectorForm.vue"

export default {
  name: "UserActAs",
  components: {
    NewSelectorForm
  },
  data() {
    return {
      selectedVendorID: undefined,
      vendorOptions: [],
      selectedCustomerID: undefined,
      customerOptions: [],
      hasVendorContracts: true,
      hasCustomerContracts: true
    }
  },
  watch: {
    selectedVendorID: function(newVal) {
      if (newVal) {
        this.openVendorDashboard(newVal)
      }
    },
    selectedCustomerID: function(newVal) {
      if (newVal) {
        this.openCustomerDashboard(newVal)
      }
    }
  },
  computed: {
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    is_super_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("super_admin") > -1
    },
    is_vendor_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("vendor_admin") > -1
    },
    is_vendor_user: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("vendor_user") > -1
    },
    is_customer_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("customer_admin") > -1
    },
    is_customer_user: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("customer_user") > -1
    },
    vendor_access: function() {
      return this.$store.getters["vendor/getVendors"]
    },
    customer_access: function() {
      return this.$store.getters["customer/getCustomers"]
    },
    all_vendors: function() {
      return this.$store.getters["admin/allVendors"]
    },
    all_customers: function() {
      return this.$store.getters["admin/allCustomers"]
    }
  },
  methods: {
    vendorDashboardLink: function(vendor) {
      return "/vendor/" + vendor.id
    },
    customerDashboardLink: function(customer) {
      return "/customer/" + customer.id
    },
    openVendorDashboard: function(val) {
      this.$store.commit("auth/setBadge", "vendor")
      this.$router.push({ path: "/vendor/" + val })
    },
    openCustomerDashboard: function(val) {
      this.$router.push({ path: "/customer/" + val })
    }
  },
  mounted() {
    if (this.is_super_admin) {
      this.$store.dispatch("admin/getAllVendors")
      this.$store.dispatch("admin/getAllCustomers")
    }
    if (this.is_vendor_admin || this.is_vendor_user) {
      this.$store.dispatch("vendor/getVendorAccess")
    }
    if (this.is_customer_admin || this.is_customer_user) {
      this.$store.dispatch("customer/getCustomerAccess")
    }
  }
}
</script>
