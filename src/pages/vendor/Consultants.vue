<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Vendor Area</div>
      <BreadCrumb align="center" :organisation="vendor" v-if="isAuthorised" />
      <div v-if="isAuthorised" class="q-mt-lg">
        <q-table
          :title="OrganisationTypeMethods.changeConsultant(isBuiltEnvironment,{ isPlural: true })"
          :rows="consultants"
          :columns="consultantColumns"
          row-key="id"
          v-model:pagination="pagination"
          table-class="alternate-color"
          hide-bottom
          table-header-class="text-weight-bolder text-primary"
          color="primary"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="name" :props="props" :style="colorStyle(props.row?.user?.linkInfo?.isSuper)">
                {{ props.row.user.fullName }}
              </q-td>
              <q-td key="email" :props="props">
                {{ props.row.user.email }}
              </q-td>
              <q-td key="phone" :props="props">
                {{ props.row.user.phone }}
              </q-td>
              <q-td key="type" :props="props">
                {{ props.row.consultant_type.name }}
                <q-popup-edit
                  v-slot="service"
                  v-model="props.row.consultant_type.name"
                  title="Change Type"
                  color="primary"
                  buttons
                  @save="(v, iv) => updateConsultantType(v, iv, props.row)"
                >
                  <new-selector-form
                    v-model:option_id="service.value"
                    is-filterable
                    filter-key="label"
                    option-label="label"
                    dense
                    :options="consultantTypes"
                    option-val-key="value"
                    label="Type"
                    classes="col-xs-12 col-sm-6 col-lg-2"
                    default-class="full-width"
                  />
                </q-popup-edit>
              </q-td>
              <q-td key="reference" :props="props">
                {{ props.row.reference }}
                <q-popup-edit
                  v-slot="service"
                  color="primary"
                  v-model="props.row.reference"
                  @save="(v, iv) => updateConsultantReference(v, iv, props.row)"
                  buttons
                >
                  <q-input v-model="service.value"
                           dense autofocus counter
                           label-color="white"
                           color="primary"
                           @keyup.enter="service.set" />
                </q-popup-edit>
              </q-td>
              <q-td key="active" :props="props">
                <q-icon class="text-green" size="2rem" name="check" v-if="props.row.engagementInfo.active" />
                <q-icon class="text-accent" size="2rem" name="warning" v-else />
              </q-td>
              <q-td key="customer" :props="props">
                <div class="text-pre-wrap">{{ props.row.engagementInfo.customer }}</div>
              </q-td>
              <q-td key="engagements" :props="props">
                <div class="text-pre-wrap">{{ props.row.engagementInfo.numEngagements }}</div>
              </q-td>
              <q-td key="availability" :props="props">
                {{ props.row?.engagementInfo?.availability_date }}
              </q-td>
              <q-td key="2fa" :props="props">
                <template v-if="props.row?.user?.twoFactorEnabled?.status">
                  <q-badge v-if="props.row?.user?.twoFactorEnabled?.isEnabled" round color="positive" text-color="dark">
                    <q-icon
                      name="fa-solid fa-check"
                      class="q-mr-xs"
                    />
                    Enabled
                  </q-badge>
                  <q-badge v-else round color="primary" text-color="dark">
                    <q-icon
                      name="fa-solid fa-hourglass-half"
                      class="q-mr-xs"
                    />
                    Not Confirmed
                  </q-badge>
                </template>
              </q-td>
              <q-td key="actions" :props="props">
                <q-btn v-if="canDelete(props.row)"
                       icon="delete"
                       color="red"
                       size="sm"
                       padding="xs"
                       flat
                       dense
                       rounded
                       @click="deleteButtonClick(props.row)"
                >
                  <q-tooltip> This user may be removed from your
                    {{ OrganisationTypeMethods.changeConsultant(isBuiltEnvironment, {
                      isPlural: true,
                      isCamelCase: false
                    }) }}
                  </q-tooltip>
                </q-btn>
              </q-td>
            </q-tr>
          </template>
        </q-table>

        <div class="q-mt-lg q-mb-sm">
          NB You must complete all the fields, but if the email is already registered, that existing user info will be
          used
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-xs-12 col-sm-6 col-lg-2 row items-center">
            <q-input
              class="col"
              outlined
              v-model="newUserData.first_name"
              label="First Name"
              stack-label
              label-color="white"
              color="primary"
              type="text"
              maxlength="255"
            />
          </div>
          <div class="col-xs-12 col-sm-6 col-lg-2 row items-center">
            <q-input
              class="col"
              outlined
              v-model="newUserData.last_name"
              label="Last Name"
              stack-label
              label-color="white"
              color="primary"
              type="text"
              maxlength="255"
            />
          </div>
          <div class="col-xs-12 col-sm-6 col-lg-2 row items-center">
            <q-input
              class="col"
              outlined
              v-model="newUserData.email"
              label="Email"
              stack-label
              label-color="white"
              color="primary"
              type="email"
              maxlength="255"
            />
          </div>
          <div class="col-xs-12 col-sm-6 col-lg-2 row items-center">
            <q-input
              class="col"
              outlined
              v-model="newUserData.phone"
              label="Phone"
              stack-label
              label-color="white"
              color="primary"
              type="text"
              maxlength="255"
            />
          </div>
          <new-selector-form
            classes="col-xs-12 col-sm-6 col-lg-2"
            is-filterable
            filter-key="label"
            option-label="label"
            v-model:option_id="newUserData.type"
            :options="consultantTypes"
            label="Type"
            :is-emit-value="false"
            default-class="full-width"
          />
          <div class="col-xs-12 col-sm-6 col-lg-2 row items-center">
            <q-input
              class="col"
              outlined
              v-model="newUserData.reference"
              label="Reference"
              stack-label
              label-color="white"
              color="primary"
              type="text"
              maxlength="255"
            />
          </div>
        </div>
        <div class="row q-mt-sm">
          <div class="col-xs-12 col-sm-6 col-lg-2 row justify-start items-center">
            <q-btn
              unelevated
              size="md"
              :label="'Add '+ OrganisationTypeMethods.changeConsultant(isBuiltEnvironment)"
              color="primary"
              text-color="dark"
              @click="createUser"
              :disable="!allowCreateNew"
            />
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
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import NewSelectorForm from "components/NewSelectorForm.vue"
import BreadCrumb from "src/components/common/BreadCrumb.vue"

export default defineComponent({
  name: "Consultants",
  components: {
    NewSelectorForm,
    BreadCrumb
  },
  props: ["vendor_id"],
  setup(props) {
    const { vendor, isAuthorised } = vendorAuth(props.vendor_id)

    return {
      vendor,
      isAuthorised,

      OrganisationTypeMethods,
      ClassCombinations
    }
  },
  data() {
    return {
      pagination: {
        page: 1,
        rowsPerPage: 0 // 0 means all rows
      },
      newUserData: {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        consultant_type_id: null,
        type: {},
        reference: ""
      },
      consultantColumns: [
        { name: "name", required: true, label: "Name", align: "left", sortable: true },
        { name: "email", label: "Email", align: "left", field: "email", sortable: false },
        { name: "phone", label: "Phone", align: "left", field: "phone", sortable: false },
        { name: "type", required: true, label: "Type", align: "center", sortable: true },
        { name: "reference", required: true, label: "Reference", align: "left", sortable: false },
        {
          name: "active",
          required: true,
          label: "Active",
          align: "center",
          field: row => row.engagementInfo.active,
          sortable: false
        },
        {
          name: "customer",
          required: true,
          label: "Customer",
          align: "left",
          field: row => row.engagementInfo.customer,
          sortable: false
        },
        {
          name: "engagements",
          required: true,
          label: "Engagements",
          align: "center",
          field: row => row.engagementInfo.engagements,
          sortable: false
        },
        {
          name: "availability",
          required: true,
          label: "Availability Date",
          align: "center",
          field: row => row.engagementInfo.availabilityDate,
          sortable: true
        },
        { name: "2fa", label: "2FA Status", field: "2fa", align: "center" },
        { name: "actions", label: "Actions", field: "actions", align: "right" }
      ]
    }
  },
  computed: {
    isBuiltEnvironment: function() {
      return this.$store.getters["admin/getIsBuiltEnvironment"]
    },
    consultants: function() {
      let c = this.$store.getters["vendor/getConsultantsByVendor"](this.vendor_id)
      c = JSON.parse(JSON.stringify(c))
      if (Array.isArray(c) && c.length > 0) {
        c.sort((a, b) => (a.user.last_name > b.user.last_name ? 1 : b.user.last_name > a.user.last_name ? -1 : 0))
        this.$q.loading.hide()
      }
      return c
    },
    consultantTypes: function() {
      const consultantTypes = this.$store.getters["vendor/getConsultantTypes"]
      const a = []
      consultantTypes.forEach(element => {
        a.push({ value: element.id, label: element.name })
      })
      return a
    },
    allowCreateNew: function() {
      return this.newUserData.first_name.trim() !== "" &&
        this.newUserData.last_name.trim() !== "" &&
        this.newUserData.phone.trim() !== "" &&
        this.isValidEmail
    },
    isValidEmail: function() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailPattern.test(this.newUserData.email.trim())
    }
  },
  methods: {
    colorStyle: function(isSuper) {
      return {
        0: "color: white;",
        1: "color: gray;"
      }[isSuper] || "color: purple;"
    },
    getConsultants: function(force) {
      if (this.consultants.length < 1 || force) {
        this.$store.dispatch("vendor/getVendorConsultants", this.vendor_id)
      }
    },
    getConsultantTypes: function(force) {
      if (this.consultants.length < 1 || force) {
        this.$store.dispatch("vendor/getConsultantTypes")
      }
    },
    putConsultant: function() {
      const newUserData = this.newUserData
      this.$store.dispatch(
        "vendor/createConsultant",
        { data: newUserData, vendorID: this.vendor_id }
      ).then(() => {
        this.getConsultants(true) // get updated list
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
    updateConsultantType: function(val, initialValue, row) {
      this.newUserData.consultant_type_id = val.value
      this.newUserData.email = row.user.email
      this.newUserData.reference = row.reference
      this.putConsultant()
    },
    updateConsultantReference: function(val, initialValue, row) {
      this.newUserData.reference = val
      this.newUserData.email = row.user.email
      this.newUserData.consultant_type_id = row.consultant_type_id
      this.putConsultant()
    },
    canDelete: function(row) {
      return !row.engagementInfo.numEngagements
    },
    deleteButtonClick: function(row) {
      this.deleteConsultant(row.id)
    },
    resetLocalData: function() {
      this.newUserData = { first_name: "", last_name: "", email: "", phone: "" }
    },
    createUser: function() {
      this.newUserData.consultant_type_id = this.newUserData.type.value
      this.putConsultant()
      this.resetLocalData()
    },
    deleteConsultant: function(customerUserId) {
      const obj = { id: customerUserId, call: "vendor/" + this.vendor_id + "/consultants", method: "delete" }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        // call service update
        this.getConsultants(true)
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
  mounted() {
    this.getConsultantTypes(true)
    this.getConsultants(true)
  },
  watch: {
    consultants: function() {
      this.$q.loading.hide()
    },
    consultantTypes: function() {
      this.newUserData.type = this.consultantTypes[2]
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
