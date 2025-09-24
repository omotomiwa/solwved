<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">
        Contracts<sup>3</sup>
      </div>
      <template v-if="is_authorised">
        <div class="text-h6 breadcrumb">
          <router-link to="/admin">
            Vendor Dashboard
          </router-link>
          <span> / Contracts</span>
        </div>
        <div class="q-mt-lg">
          <div class="q-mb-lg q-pa-sm group">
            <div class="text-h6">
              Contracts with
            </div>
            <q-list v-if="contracts" class="alternate-color">
              <q-item
                v-for="contract in contracts"
                :key="contract.id"
                class="row items-center"
                :to="'/contracts/' + contract.id"
              >
                <div class="col">
                  {{ contract.reference }}
                </div>
                <q-btn label="view" size="sm" icon="article" color="green" />
              </q-item>
            </q-list>
          </div>
        </div>
      </template>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
      <q-dialog v-model="saveDataResponse">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              {{ saveDataHeader }}
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            {{ saveDataMessage }}
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              v-close-popup
              flat
              label="OK"
              color="primary"
              text-color="dark"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue"
import { ClassCombinations } from "src/modules/StaticData.js"

export default defineComponent({
  name: "CustomerVendorContracts",
  props: ["customer_id", "vendor_id"],
  setup() {
    const saveDataResponse = ref()
    const saveDataHeader = ref("")
    const saveDataMessage = ref("")
    const saveError = ref(false)
    return {
      saveDataResponse,
      saveDataHeader,
      saveDataMessage,
      saveError,

      ClassCombinations
    }
  },
  data() {
    return {
      localData: null
    }
  },
  computed: {
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    customer: function() {
      return this.customer_access.find(obj => {
        return parseInt(obj.id) === parseInt(this.customer_id)
      })
    },
    customer_access: function() {
      return this.getCustomers()
    },
    vendor_access: function() {
      return this.$store.getters["customer/getVendorsByCustomer"](parseInt(this.customer_id))
    },
    customer_name: function() {
      return this.customer?.name ?? ""
    },
    customer_users: function() {
      let u = []
      if (this.customer_id) {
        u = this.$store.getters["admin/getUsersByCustomer"](this.customer_id)
      }
      return u
    },
    is_vendor_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("vendor_admin") > -1
    },
    is_super_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("super_admin") > -1
    },
    vendor: function() {
      return this.vendor_access.find(obj => {
        return parseInt(obj.id) === parseInt(this.vendor_id)
      })
    },
    vendorDashboardLink: function() {
      return "/vendor/" + this.vendor_id
    },
    vendorCustomersLink: function() {
      return "/vendor/" + this.vendor_id + "/customers"
    },
    is_authorised: function() {
      const result = this.vendor_access.find(obj => {
        return parseInt(obj.id) === parseInt(this.vendor_id)
      })
      const pass = 1
      return !!(pass || result)
    },
    contracts: function() {
      return this.$store.getters["customer/getContracts"]
    }
  },
  watch: {
    customer: function(newVal) {
      if (newVal) {
        this.setLocalData()
        this.getCustomerUsers()
      }
    }
  },
  mounted() {
    if (this.is_vendor_admin) {
      if ((!this.vendor_access || this.vendor_access.length < 1)) {
        this.$store.dispatch("vendor/getVendorAccess").then(() => {
          this.getContracts()
        }).catch(e => {
          alert(e.data.message || e.statusText)
        })
      } else {
        this.getContracts()
      }
    }
    if (this.customer) {
      this.setLocalData()
    }
    // this.getCustomerUsers()
    // this.getVendors()
    // this.getCustomers()
    this.getContracts()
  },
  methods: {
    setLocalData: function() {
      this.localData = {
        id: this.customer.id,
        name: this.customer.name,
        address: this.customer.address
      }
    },
    getCustomers: function() {
      return this.$store.getters["customer/getCustomers"]
    },
    getCustomerUsers: function() {
      this.$store.dispatch("admin/getCustomerUsers", this.customer_id)
    },
    getContracts: function() {
      const obj = { customerID: this.customer_id, vendorID: this.vendor_id }
      return this.$store.dispatch("customer/viewContracts", obj)
    }
  }
})
</script>

<style lang="scss" scoped>
.group {
  background-color: #fff;
  border: 1px solid $primary;
}
</style>
