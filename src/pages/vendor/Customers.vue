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
        <span> / Customers</span>
      </div>
      <div v-if="is_authorised" class="q-mt-lg">
        <div class="text-h5 q-mb-md">
          Customers
        </div>
        <q-list class="alternate-color">
          <q-item
            v-for="customer in customers"
            :key="customer.id"
            class="row items-center"
            :to="'/vendor/' + vendor_id + '/customers/' + customer.id"
          >
            <div class="col">
              {{ customer.name }}
            </div>
            <q-btn
              label="view"
              size="sm"
              color="primary"
              text-color="dark"
            />
          </q-item>
        </q-list>
        <q-item class="q-mt-md q-pt-none q-pb-md row items-center">
          <q-input
            v-show="showNewForm"
            ref="nameInput"
            v-model="newItem.name"
            class="col"
            style="max-width:400px;"
            type="text"
            @keyup.enter="saveNewItem"
          />
          <q-btn
            v-if="!showNewForm"
            label="Create new customer"
            class="q-mt-md"
            color="primary"
            text-color="dark"
            size="sm"
            @click="createNewCustomer"
          />
          <q-btn
            v-if="showNewForm"
            class="col-auto q-ml-sm"
            :disable="!allowSave"
            label="Save"
            color="positive"
            size="sm"
            @click="saveNewItem"
          />
          <q-btn
            v-if="showNewForm"
            class="col-auto q-ml-sm"
            label="Cancel"
            color="primary"
            text-color="dark"
            size="sm"
            @click="cancelNewItem"
          />
        </q-item>
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, nextTick } from "vue"
import { ClassCombinations } from "src/modules/StaticData.js"

export default defineComponent({
  name: "Customers",
  props: ["vendor_id"],
  emits: ["listUpdate"],
  setup() {
    return {
      ClassCombinations
    }
  },
  data() {
    return {
      showNewForm: false,
      newItem: { name: "" }
    }
  },
  computed: {
    allowSave: function() {
      return (this.newItem.name ?? "").trim().length >= 3
    },
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
            c.push({ id: customer.id, name: customer.name })
          }
        }
      }
      return c
    },
    is_vendor_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("vendor_admin") > -1
    },
    organisations: function() {
      return this.$store.getters["admin/getOrganisations"]
    },
    vendor: function() {
      return this.vendor_access.find(obj => parseInt(obj.id) === parseInt(this.vendor_id))
    },
    vendorDashboardLink: function() {
      return "/vendor/" + this.vendor_id
    },
    vendor_access: function() {
      return this.$store.getters["vendor/getVendors"]
    },
    is_authorised: function() {
      const result = this.vendor_access.find(obj => parseInt(obj.id) === parseInt(this.vendor_id))
      return !!result
    }
  },
  mounted() {
    if (this.is_vendor_admin) {
      if ((!this.vendor_access || this.vendor_access.length < 1)) {
        this.$store.dispatch("vendor/getVendorAccess").then(() => {
          this.getContracts()
          this.getOrganisations(true)
        }).catch(e => {
          alert(e.data.message || e.statusText)
        })
      } else {
        this.getContracts()
        this.getOrganisations(true)
      }
    }
  },
  methods: {
    getContracts: function() {
      if (this.contracts.length < 1) {
        this.$store.dispatch("vendor/getVendorContracts", this.vendor_id)
      }
    },
    getOrganisations: function(force) {
      if (this.organisations.length < 1 || force) {
        const obj = { call: "organisations", method: "get" }
        this.$store.dispatch("admin/datacallDt", obj)
      }
    },
    createNewCustomer: function() {
      this.showNewForm = true
    },
    showNewItemForm: async function() {
      this.showNewForm = true
      await nextTick()
      this.nameInput.focus()
    },
    resetNewItemForm: function() {
      this.newItem.name = ""
    },
    cancelNewItem: function() {
      this.resetNewItemForm()
      this.showNewForm = false
    },
    saveNewItem: function() {
      if (this.allowSave) {
        const obj = { data: this.newItem, call: "organisations", method: "post" }
        this.$store.dispatch("admin/datacallDt", obj).then(() => {
          // call service update
          this.$emit("listUpdate")
          this.resetNewItemForm()
        }).catch(e => {
          alert(e.data.message || e.statusText)
        })
      }
    },
    updateItem: function(data) {
      const _data = JSON.parse(JSON.stringify(data))
      const _id = data.id
      if (_data.children !== undefined) {
        delete _data.children
      }

      const obj = { data: _data, id: _id, call: this.dataCall, method: "patch" }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        // call service update
        this.$emit("listUpdate")
      }).catch(e => {
        alert(e.data.message || e.statusText)
      })
    },
    deleteItem: function(data) {
      const obj = { id: data, call: this.dataCall, method: "delete" }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        // call service update
        this.$emit("listUpdate")
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
    }
  }
})
</script>

<style scoped>
.alternate-color .q-item {
  background-color: rgba(54, 76, 102, 0.2);
}

.alternate-color .q-item:nth-of-type(2n) {
  background-color: rgba(54, 76, 102, 0.1);
}
</style>
