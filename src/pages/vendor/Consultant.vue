<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Vendor Area</div>
      <div v-if="is_authorised">
        <div class="text-h6 text-center">
          <router-link :to="vendorDashboardLink">
            {{ vendor.name }}
          </router-link>
          /
          <router-link
            :to="vendorConsultantsLink"
            :text="OrganisationTypeMethods.changeConsultant(isBuiltEnvironment,{isPlural: true})"
          />
          <span v-if="consultant"> / {{ consultant.user.first_name }} {{ consultant.user.last_name }}</span>
        </div>
        <div v-if="consultant" class="column q-mt-lg">
          <div class="text-h5 q-mb-md">{{ OrganisationTypeMethods.changeConsultant(isBuiltEnvironment) }} Details</div>
          <div>
            {{ consultant.user.first_name }} {{ consultant.user.last_name }} // <a
            :href="'mailto:'+consultant.user.email">{{ consultant.user.email }}</a> // <a
            :href="'tel:'+consultant.user.phone">{{ consultant.user.phone }}</a>
          </div>
          <div class="text-h6 text-weight-bold q-mt-xl q-mb-md">
            Engagements for {{ consultant.user.first_name }} {{ consultant.user.last_name }}
          </div>
          <q-list v-if="engagements.length" class="alternate-color">
            <q-item v-for="engagement in engagements" :key="engagement.id">
              <q-item-section>
                <div class="row">
                  <div class="col-xs-12 col-sm-4 col-lg-2 row items-center">
                    <q-field
                      class="col"
                      outlined
                      readonly
                      color="primary"
                      dense
                      hide-bottom-space
                      label="Start Date"
                      stack-label
                      label-color="white"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline ellipsis" tabindex="1">
                          {{ date_format(engagement.request.start_date) }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                  <div class="col-xs-12 col-sm-4 col-lg-2 row items-center">
                    <q-field
                      class="col"
                      outlined
                      readonly
                      color="primary"
                      dense
                      hide-bottom-space
                      label="End Date"
                      stack-label
                      label-color="white"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline ellipsis" tabindex="1">
                          {{ date_format(engagement.request.end_date) }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                  <div class="col-xs-12 col-sm-4 col-lg-2 row items-center">
                    <q-field
                      class="col"
                      outlined
                      readonly
                      color="primary"
                      dense
                      hide-bottom-space
                      label="Customer"
                      stack-label
                      label-color="white"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline ellipsis" tabindex="1">
                          {{ engagement.request.service.contract.customer.name }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                  <div class="col-xs-12 col-sm-4 col-lg-2 row items-center">
                    <q-field
                      class="col"
                      outlined
                      readonly
                      color="primary"
                      dense
                      hide-bottom-space
                      label="Category"
                      stack-label
                      label-color="white"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline ellipsis" tabindex="1">
                          {{ engagement.request.service_name.name }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                  <div class="col-xs-12 col-sm-4 col-lg-2 row items-center">
                    <q-field
                      class="col"
                      outlined
                      readonly
                      color="primary"
                      dense
                      hide-bottom-space
                      label="Category"
                      stack-label
                      label-color="white"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline ellipsis" tabindex="1">
                          {{ engagement.request.service_line.name }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                  <div class="col-xs-12 col-sm-4 col-lg-2 row items-center">
                    <q-field
                      class="col"
                      outlined
                      readonly
                      color="primary"
                      dense
                      hide-bottom-space
                      label="Capability"
                      stack-label
                      label-color="white"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline ellipsis" tabindex="1">
                          {{ engagement.request_capability.capability.name }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                  <div class="col-xs-12 col-sm-4 col-lg-2 row items-center">
                    <q-field
                      class="col"
                      outlined
                      readonly
                      color="primary"
                      dense
                      hide-bottom-space
                      label="Competancy"
                      stack-label
                      label-color="white"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline ellipsis" tabindex="1">
                          {{ engagement.competency.name }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                  <div class="col-xs-12 col-sm-4 col-lg-2 row items-center">
                    <q-field
                      class="col"
                      outlined
                      readonly
                      color="primary"
                      dense
                      hide-bottom-space
                      label="Charge Rate"
                      stack-label
                      label-color="white"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline ellipsis" tabindex="1">
                          {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, engagement.charge_rate) }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                  <div class="col-xs-12 col-sm-4 col-lg-2 row items-center">
                    <q-field
                      class="col"
                      outlined
                      readonly
                      color="primary"
                      dense
                      hide-bottom-space
                      label="Pay Rate"
                      stack-label
                      label-color="white"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline ellipsis" tabindex="1">
                          {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, engagement.pay_rate) }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                  <div class="col-xs-12 col-sm-4 col-lg-2 row items-center">
                    <q-field
                      class="col"
                      outlined
                      readonly
                      color="primary"
                      dense
                      hide-bottom-space
                      label="Budget"
                      stack-label
                      label-color="white"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline ellipsis" tabindex="1">
                          {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, engagement.budget) }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                  <div class="col-xs-12 col-sm-4 col-lg-2 row items-center">
                    <q-field
                      class="col"
                      outlined
                      readonly
                      color="primary"
                      dense
                      hide-bottom-space
                      label="Units"
                      stack-label
                      label-color="white"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline ellipsis" tabindex="1">
                          {{ engagement.units }}
                        </div>
                      </template>
                    </q-field>
                  </div>
                  <div class="col-xs-12 col-sm-4 col-lg-2 row items-center">
                    <q-btn
                      label="EDIT"
                      color="primary"
                      text-color="dark"
                    />
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else>
            {{ OrganisationTypeMethods.changeConsultant(isBuiltEnvironment) }} {{ consultant.user.first_name }}
            {{ consultant.user.last_name }} has not been assigned any
            engagements
          </div>
        </div>
      </div>
      <div v-else>
        You are not authorised to view this page
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue"
import { DateTime } from "luxon"
import { ClassCombinations, Config } from "src/modules/StaticData.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"

export default defineComponent({
  name: "Consultant",
  props: ["vendor_id", "consultant_id"],
  setup() {
    return {
      OrganisationTypeMethods,
      ClassCombinations,
      CurrencyMethods
    }
  },
  computed: {
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    isBuiltEnvironment: function() {
      return this.$store.getters["admin/getIsBuiltEnvironment"]
    },
    consultants: function() {
      return this.$store.getters["vendor/getConsultantsByVendor"](this.vendor_id)
    },
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    consultant: function() {
      let c = false
      if (Array.isArray(this.consultants) && this.consultants.length) {
        c = this.consultants.find(element => element.id === parseInt(this.consultant_id))
      }
      return c
    },
    engagements: function() {
      return this.$store.getters["vendor/getEngagementsByConsultantID"](this.consultant_id)
    },
    is_vendor_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("vendor_admin") > -1
    },
    vendor: function() {
      return this.vendor_access.find(obj => {
        return parseInt(obj.id) === parseInt(this.vendor_id)
      })
    },
    vendorDashboardLink: function() {
      return "/vendor/" + this.vendor_id
    },
    vendorConsultantsLink: function() {
      return "/vendor/" + this.vendor_id + "/user-management/consultants"
    },
    vendor_access: function() {
      return this.$store.getters["vendor/getVendors"]
    },
    is_authorised: function() {
      const result = this.vendor_access.find(obj => {
        return parseInt(obj.id) === parseInt(this.vendor_id)
      })
      return !!result
    }
  },
  mounted() {
    if (this.is_vendor_admin) {
      if ((!this.vendor_access || this.vendor_access.length < 1)) {
        this.$store.dispatch("vendor/getVendorAccess").then(() => {
          this.getConsultants()
          this.getEngagements()
        }).catch(e => {
          alert(e.data.message || e.statusText)
        })
      } else {
        this.getConsultants()
        this.getEngagements()
      }
    }
  },
  methods: {
    date_format: function(date) {
      return DateTime.fromISO(date).toFormat(Config.DATE_FORMAT_DLY)
    },
    getConsultants: function() {
      if (this.consultants.length < 1) {
        this.$store.dispatch("vendor/getVendorConsultants", this.vendor_id)
      }
    },
    getEngagements: function() {
      if (this.engagements.length < 1) {
        const obj = { consultantID: this.consultant_id, vendorID: this.vendor_id }
        this.$store.dispatch("vendor/getVendorConsultantEngagements", obj)
      }
    }
  }
})
</script>
