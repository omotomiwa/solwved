<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">
        Vendors
      </div>
      <div v-if="good && is_authorised" class="text-h6">
        for {{ customer.name }}
      </div>
      <div v-if="good===true" class="text-h6 breadcrumb">
        Vendors you have contracts with
        <q-list>
          <q-item
            v-for="vendor in vendor_access"
            :key="vendor.id"
            :to="vendorDashboardLink(vendor)"
            class="q-mb-md q-pa-md bg-white"
            style="border-radius: 5px;"
          >
            <q-item-section avatar>
              <q-icon
                color="primary"
                name="arrow_forward"
              />
            </q-item-section>
            <q-item-section>{{ vendor.name }}</q-item-section>
            <q-td>
              <div>
                <router-link :to="CustomerVendorContractLink(vendor)">
                  <q-btn
                    color="green"
                    label="Contracts"
                    size="sm"
                    icon="article"
                  />
                </router-link>
              </div>
            </q-td>
          </q-item>
        </q-list>
      </div>
      <div v-else>
        You are not authorised to view this page
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue"
import { ClassCombinations } from "src/modules/StaticData.js"

export default defineComponent({
  name: "Vendors",
  props: ["customer_id"],
  setup() {
    return {
      ClassCombinations
    }
  },
  data() {
    return {
      vendors: [],
      reportData: false,
      dataMessage: "",
      good: false
    }
  },
  computed: {
    is_authorised: function() {
      if (this.badge === "customer") return true

      return this.customer_access.find(obj => parseInt(obj.id) === parseInt(this.customer_id))
    },
    customer: function() {
      return this.customer_access.find(obj => parseInt(obj.id) === parseInt(this.customer_id))
    },
    customer_access: function() {
      return this.$store.getters["customer/getCustomers"]
    },
    vendor_access: function() {
      return this.$store.getters["customer/getVendorsByCustomer"](parseInt(this.customer_id))
    },
    badge: function() {
      return this.$store.getters["auth/getBadge"]
    }
  },
  watch: {
    vendor_access: function(newVal) {
      if (newVal) {
        this.good = true
      }
    }
  },
  mounted() {
    this.getVendors()
  },
  methods: {
    getVendors: function() {
      if (!this.vendors.length) {
        this.$store.dispatch("customer/getCustomerVendors", this.customer_id)
      }
    },
    vendorDashboardLink: function(vendor) {
      return "/vendor/" + vendor.id
    },
    CustomerVendorContractLink: function(vendor) {
      // return '/customer/' + this.customer_id + '/vendor/' + vendor.id
      return "/customer/" + this.customer_id + "/vendor/" + vendor.id
    }
  }
})
</script>

<style scoped>
h1 {
  line-height: 2rem;
}
</style>
