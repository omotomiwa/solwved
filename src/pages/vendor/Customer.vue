<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">
        Vendor Area
      </div>
      <div v-if="is_authorised" class="text-h6 breadcrumb">
        <router-link :to="vendorDashboardLink">
          {{ vendor.name }}
        </router-link>
        <span> / </span>
        <router-link :to="vendorCustomersLink">
          Customers
        </router-link>
        <span> / {{ customer_name }}</span>
      </div>
      <div v-if="is_authorised && customer_name" class="q-mt-lg">
        <div class="q-mb-lg q-pa-sm group">
          <div class="text-h6">
            Customer details for {{ customer_name }}
          </div>
          <q-input
            v-if="localData"
            v-model="localData.address"
            filled
            autogrow
            label="Customer Address"
            stack-label
          />
          <q-btn
            v-if="addressChanged"
            class="q-mt-sm"
            label="Save Changes"
            color="primary"
            text-color="dark"
            @click="saveAddress"
          />
        </div>
        <div v-if="is_authorised" class="q-mb-lg q-pa-sm group relative-position">
          <div class="text-h6">
            Customer users for {{ customer_name }}
          </div>
          <user-access-widget
            :users="customer_users"
            :current_user="user"
            @deleteUser="deleteCustomerUser"
            @createUser="createCustomerUser"
          />
        </div>
        <div class="q-mb-lg q-pa-sm group">
          <div class="text-h6">
            Contracts with {{ customer_name }}
          </div>
          <q-list v-if="contracts" class="alternate-color">
            <q-item
              v-for="contract in contracts"
              :key="contract.id"
              class="row items-center"
              :to="'/vendor/' + vendor_id + '/contracts/' + contract.id"
            >
              <div class="col">
                {{ contract.reference }}
              </div>
              <q-btn
                label="view"
                size="sm"
                color="primary"
                text-color="dark"
              />
            </q-item>
          </q-list>
          <q-btn
            label="Create new contract"
            class="q-mt-md"
            color="primary"
            text-color="dark"
            size="sm"
            @click="createNewContract"
          />
        </div>
      </div>
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
import UserAccessWidget from "components/UserAccessWidget.vue"

export default defineComponent({
  name: "Customer",
  components: { UserAccessWidget },
  props: ["vendor_id", "customer_id"],
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
    contracts: function() {
      return this.$store.getters["vendor/getContractsByVendor"](this.vendor_id)
    },
    customers: function() {
      const c = []
      if (Array.isArray(this.contracts) && this.contracts.length > 0) {
        for (let index = 0; index < this.contracts.length; index++) {
          const contract = this.contracts[index]
          const customer = contract.customer
          if (c.find(element => element.id === customer.id) === undefined) {
            c.push({ id: customer.id, name: customer.name, address: customer.address })
          }
        }
      }
      return c
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
      return this.vendor_access.find(obj => parseInt(obj.id) === parseInt(this.vendor_id))
    },
    vendorDashboardLink: function() {
      return "/vendor/" + this.vendor_id
    },
    vendorCustomersLink: function() {
      return "/vendor/" + this.vendor_id + "/customers"
    },
    vendor_access: function() {
      return this.$store.getters["vendor/getVendors"]
    },
    is_authorised: function() {
      const result = this.vendor_access.find(obj => parseInt(obj.id) === parseInt(this.vendor_id))
      return !!result
    },
    addressChanged: function() {
      return !!(this.customer && this.localData && this.localData.address !== this.customer.address)
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
    this.getCustomerUsers()
    this.getCustomer()
  },
  methods: {
    setLocalData: function() {
      this.localData = {
        id: this.customer.id,
        name: this.customer.name,
        address: this.customer.address
      }
    },
    getContracts: function(force) {
      if (this.contracts.length < 1 || force) {
        this.$store.dispatch("vendor/getVendorContracts", this.vendor_id)
      }
    },
    getCustomerUsers: function() {
      this.$store.dispatch("admin/getCustomerUsers", this.customer_id)
    },
    getCustomer: function() {
      this.$store.dispatch("admin/getOrganisation", this.customer_id)
    },
    customer: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    saveAddress: function() {
      if (this.addressChanged) {
        const obj = { organisationID: this.customer.id, data: { address: this.localData.address } }
        this.$store.dispatch("admin/updateOrganisation", obj).then(() => {
          this.getContracts(true)
        }).catch(e => {
          alert(e.data.message || e.statusText)
        })
      }
    },
    // SysAdmin only
    deleteCustomerUser: function(customerUserId) {
      this.$store.dispatch("admin/deleteCustomerUser", customerUserId).then(() => {
        this.saveDataHeader = "Customer User Removed"
        this.saveError = false
        this.saveDataResponse = true
        this.saveDataMessage = "Customer user access succesfully removed"
        // get updated list
        this.getCustomerUsers()
      }).catch(e => {
        this.saveError = true
        this.saveDataHeader = "Removal error"
        this.saveDataMessage = e
        this.saveDataResponse = true
      })
    },
    createCustomerUser: function(newUserData) {
      const userData = {}
      for (const key in newUserData) {
        if (Object.hasOwnProperty.call(newUserData, key)) {
          userData[key] = newUserData[key].trim()
        }
      }
      userData.type = "customer"
      userData.customer_id = this.customer_id
      userData.admin = 0
      const obj = { data: userData, call: "specialUser", method: "post" }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        this.getCustomerUsers(true) // get updated list
      }).catch(e => {
        if (e.response && e.response.data && e.response.data.error) {
          this.$store.dispatch(
            "auth/setDataCallNotice",
            { show: true, title: "Data call error", message: e.response.data.error }
          )
        } else {
          this.$store.dispatch(
            "auth/setDataCallNotice",
            { show: true, title: "Data call error", message: e }
          )
        }
      })
    },
    createNewContract: function() {
      alert("Coming soon!")
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
