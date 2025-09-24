<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Organisations</div>
      <div v-if="is_super_admin" class="text-h6 text-center">
        <router-link to="/admin"> Super Admin Dashboard</router-link>
        /
        <router-link to="/admin/organisations"> Organisations</router-link>
        /
        <span v-if="organisation"> {{ organisation.name }} </span>
      </div>
      <div v-if="is_super_admin && organisation" class="row q-mt-lg">
        <q-input
          v-model="localData.name"
          label="Name"
          type="text"
          color="primary"
          class="q-mb-sm col-12"
          stack-label filled autofocus
        />
        <q-input
          v-model="localData.address"
          label="Address"
          type="textarea"
          color="primary"
          class="q-mb-sm col-12"
          stack-label filled
        />
        <q-input
          v-model="localData.company_number"
          label="Company Number"
          color="primary"
          type="text"
          class="q-mb-sm col-12"
          stack-label filled
        />
        <q-input
          v-model="localData.domain"
          label="Domain Name"
          type="text"
          class="q-mb-sm col-12"
          color="primary"
          stack-label filled
        />
        <!--        <new-selector-form-->
        <!--          :options="currencies"-->
        <!--          option-label="name"-->
        <!--          is-filterable-->
        <!--          filter-key="name"-->
        <!--          label="Currency"-->
        <!--          classes="col-12 q-mb-sm"-->
        <!--          v-model:option_id="localData.currency_id"-->
        <!--          is-option-customisable-->
        <!--          is-selected-option-customisable-->
        <!--          filled-->
        <!--        >-->
        <!--          <template v-slot:option="{ option, events }">-->
        <!--            <q-item v-bind="events">-->
        <!--              <q-item-section>-->
        <!--                {{ option.name }} ( {{ option.symbol }} )-->
        <!--              </q-item-section>-->
        <!--            </q-item>-->
        <!--          </template>-->

        <!--          <template v-slot:selected-item="{ option }">-->
        <!--            {{ option.name }} ( {{ option.symbol }} )-->
        <!--          </template>-->
        <!--        </new-selector-form>-->
        <q-input
          v-model="localData.self_bill_contact"
          label="Accounts - Self-Bill Contact Email"
          type="email"
          class="q-mb-sm col-12"
          color="primary"
          stack-label filled
        />
        <q-field
          color="primary"
          class="q-mb-sm q-py-xs col-12"
          borderless filled
        >
          <q-checkbox
            v-model="localData.subscribed"
            :true-value="1"
            :false-value="0"
            color="primary"
            icon="dark"
            class="text-white swlvd-checkbox"
            label="Subscribed? (i.e. this is a paying organisation)"
          />
        </q-field>
        <q-field
          v-if="localData.subscribed"
          color="primary"
          class="q-mb-sm q-py-xs col-12"
          borderless filled
        >
          <q-checkbox
            v-model="localData.has_service_catalogue"
            color="primary"
            icon="dark"
            :true-value="true"
            :false-value="false"
            class="text-white swlvd-checkbox"
            label="Has access to service catalogue?"
          />
        </q-field>
        <new-selector-form
          v-model:option_id="localData.org_type"
          :options="organisation_types"
          classes="q-mb-sm q-py-xs col-12"
          label="Organisation type"
          filter-key="name"
          default-class="full-width"
          is-filterable filled
        />
        <div class="col-12">
          <new-selector-form
            :options="combined_users"
            option-label="fullName"
            filter-key="fullName"
            label="Organisation Master User"
            class="q-mb-md"
            classes="col-12"
            v-model:option_id="localData.organisation_owner_id"
            is-filterable filled
          />
        </div>
        <div class="row col-12">
          <q-btn
            label="Save"
            class="q-ml-sm"
            color="primary"
            text-color="dark"
            :disable="!allowSave"
            @click="saveChanges"
          />
          <q-btn
            label="Cancel"
            color="white"
            class="q-ml-sm"
            outline
            @click="cancel"
          />
        </div>
        <div class="col-12 q-mt-lg">
          <q-expansion-item
            :label="'Contracts when ' + organisation.name + ' is a Vendor'"
            caption="Click to list / edit"
            header-class="accordion-header"
            class="q-mb-xs"
            switch-toggle-side expand-separator
          >
            <organisation-contracts
              v-if="organisations && organisations.length"
              :organisations="organisations"
              :linked-organisations="linkedOrganisations"
              :vendor_id="organisation_id"
            />
          </q-expansion-item>
          <q-expansion-item
            switch-toggle-side
            expand-separator
            :label="'Contracts when ' + organisation.name + ' is a Customer'"
            caption="Click to list / edit"
            header-class="accordion-header"
            class="q-mb-xs"
          >
            <organisation-contracts
              v-if="organisations && organisations.length"
              :organisations="organisations"
              :linked-organisations="linkedOrganisations"
              :customer_id="organisation_id"
            />
          </q-expansion-item>
        </div>
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue"
import { ClassCombinations } from "src/modules/StaticData.js"
import NewSelectorForm from "src/components/NewSelectorForm.vue"
import OrganisationContracts from "src/components/admin/OrganisationContracts.vue"

export default defineComponent({
  name: "Organisation",
  components: { NewSelectorForm, OrganisationContracts },
  props: ["organisation_id"],
  setup() {
    return {
      ClassCombinations
    }
  },
  data() {
    return {
      localData: {
        name: "",
        address: "",
        company_number: "",
        domain: "",
        self_bill_contact: "",
        subscribed: false,
        organisation_owner_id: null,
        currency_id: null,
        org_type: 1,
        has_service_catalogue: false
      }
    }
  },
  computed: {
    currencies: function() {
      return this.$store.getters["common/getCurrencies"]
    },
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    is_super_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("super_admin") > -1
    },
    organisations: function() {
      return this.$store.getters["admin/getOrganisations"]
    },
    organisation_types: function() {
      return this.$store.getters["admin/getOrganisationTypes"] ?? []
    },
    linkedOrganisations: function() {
      return this.$store.getters["contract/getLinkedOrganisations"](this.organisation_id)
    },
    organisation: function() {
      if (this.organisations.length) {
        const o = this.organisations.find(org => org.id === parseInt(this.organisation_id))
        if (o) {
          return o
        }
      }
      return false
    },
    customer_users: function() {
      return this.$store.getters["admin/getUsersByCustomer"](this.organisation_id)
    },
    vendor_users: function() {
      return this.$store.getters["admin/getUsersByVendor"](this.organisation_id)
    },
    combined_users: function() {
      const c = this.customer_users.concat(this.vendor_users)
      const a = []
      if (c.length) {
        c.forEach(item => {
          const user = item.user
          const exists = a.find(element => element.id === user.id)
          if (exists === undefined) {
            a.push(user)
          }
        })
      }

      return a
    },
    allowSave: function() {
      return this.localData.name.trim() !== ""
    }
  },
  watch: {
    organisation: function(newVal) {
      if (newVal) {
        this.setLocalData()
      }
    }
  },
  mounted() {
    this.getCurrencies()
    this.getOrganisationTypes()
    if (this.is_super_admin) {
      this.getOrganisations(true)
      this.getCustomerUsers()
      this.getVendorUsers()
      this.getLinkedOrganisations(true)
      this.getOrganisationContracts()
    }
    if (this.organisation) {
      this.setLocalData()
    }
  },
  methods: {
    getCurrencies: function() {
      this.$store.dispatch("common/getCurrencies")
    },
    getOrganisations: function(force) {
      if (this.organisations.length < 1 || force) {
        this.$store.dispatch(
          "admin/datacallDt",
          { call: "organisations", method: "get" }
        )
      }
    },
    getLinkedOrganisations: function(force) {
      if (force) {
        this.$store.dispatch(
          "contract/getLinkedOrganisations",
          this.organisation_id
        )
      }
    },
    getOrganisationContracts: function() {
      this.$store.dispatch(
        "admin/getOrganisationContracts",
        this.organisation_id
      ).then(() => {
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
    getCustomerUsers: function() {
      this.$store.dispatch(
        "admin/getCustomerUsers",
        this.organisation_id
      )
    },
    getVendorUsers: function() {
      this.$store.dispatch(
        "admin/getVendorUsers",
        this.organisation_id
      )
    },
    getOrganisationTypes: function() {
      this.$store.dispatch("admin/getOrganisationTypes")
    },
    setLocalData: function() {
      this.localData = {
        name: this.organisation.name,
        address: this.organisation.address,
        company_number: this.organisation.company_number,
        domain: this.organisation.domain,
        self_bill_contact: this.organisation.self_bill_contact,
        subscribed: this.organisation.subscribed,
        organisation_owner_id: this.organisation.organisation_owner_id,
        currency_id: this.organisation.currency_id,
        org_type: this.organisation.org_type || 1,
        has_service_catalogue: this.organisation.has_service_catalogue || false
      }
    },
    saveChanges: function() {
      if (this.allowSave) {
        const obj = {
          call: "organisations",
          method: "patch",
          id: this.organisation.id,
          data: {
            name: this.localData.name ? this.localData.name.trim() : "",
            address: this.localData.address ? this.localData.address.trim() : "",
            company_number: this.localData.company_number ? this.localData.company_number.trim() : "",
            domain: this.localData.domain ? this.localData.domain.trim() : "",
            self_bill_contact: this.localData.self_bill_contact ? this.localData.self_bill_contact.trim() : "",
            subscribed: this.localData.subscribed,
            organisation_owner_id: this.localData.organisation_owner_id,
            currency_id: this.localData.currency_id,
            org_type: this.localData.org_type || 1,
            has_service_catalogue: this.localData.has_service_catalogue || false
          }
        }
        this.$store.dispatch(
          "admin/datacallDt",
          obj
        ).then(() => {
          this.$store.dispatch(
            "auth/setDataCallNotice",
            { show: true, title: "Organisation updated", message: "Organisation data saved successfully" }
          ).then(() => {
            const t = this
            setTimeout(function() {
              t.$router.push({ path: "/admin/organisations" })
            }, 1200)
          })
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
    },
    cancel: function() {
      this.$router.push({ path: "/admin/organisations" })
    },
    createVendorUser: function(newUserData) {
      const userData = {}
      for (const key in newUserData) {
        if (Object.hasOwnProperty.call(newUserData, key)) {
          userData[key] = newUserData[key].trim()
        }
      }
      this.$store.dispatch(
        "admin/createVendorUser",
        { user_data: userData, vendor_id: this.organisation_id }
      ).then(() => {
        this.getVendorUsers()
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
    deleteVendorUser: function(vendorUserId) {
      this.$store.dispatch(
        "admin/deleteVendorUser",
        vendorUserId
      ).then(() => {
        this.getVendorUsers()
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
    createCustomerUser: function(newUserData) {
      const userData = {}
      for (const key in newUserData) {
        if (Object.hasOwnProperty.call(newUserData, key)) {
          userData[key] = newUserData[key].trim()
        }
      }
      this.$store.dispatch(
        "admin/createCustomerUser",
        { user_data: userData, customer_id: this.organisation_id }
      ).then(() => {
        this.getCustomerUsers()
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
    deleteCustomerUser: function(customerUserId) {
      this.$store.dispatch(
        "admin/deleteCustomerUser",
        customerUserId
      ).then(() => {
        this.getCustomerUsers()
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
