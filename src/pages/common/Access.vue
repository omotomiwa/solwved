<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <page-header :title="pageTitle" :sub-title="pageSubTitle" :breadcrumbs="breadcrumbs" />
      <div v-if="is_authorised">
        <div class="q-pa-md">
          <q-dialog v-model="show_dialog">
            <q-card style="width: 1200px; max-width: 80vw;">
              <q-card-section>
                <div class="row q-col-gutter-sm q-mb-md">
                  <div class="col-12">
                    <div class="text-h6">Edit</div>
                    <q-separator class="q-my-md" />
                  </div>
                  <q-input
                    v-model="editedItem.first_name"
                    label="First Name"
                    class="col-12 col-sm-6 col-md-4"
                    label-color="white"
                    color="primary"
                    outlined autofocus
                  />
                  <q-input
                    v-model="editedItem.last_name"
                    label="Last Name"
                    class="col-12 col-sm-6 col-md-4"
                    label-color="white"
                    color="primary"
                    outlined
                  />
                  <q-input
                    v-model="editedItem.phone"
                    label="Phone"
                    class="col-12 col-sm-6 col-md-4"
                    label-color="white"
                    color="primary"
                    outlined
                  />
                  <div v-if="entityName === 'vendor'" class="col-12">
                    <div class="flex no-wrap max-w-full">
                      <new-selector-form
                        v-model:option_id="new_customer"
                        default-class="no-right-radius"
                        label="Customer"
                        :options="allCustomers"
                        filter-key="name"
                        classes="max-w-select"
                        multiple is-filterable
                      />
                      <q-btn icon="add" class="no-left-radius" padding="xs lg" outline @click="addCustomer">
                        <q-tooltip anchor="top middle" self="bottom middle">
                          Click to add customers
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
                <div v-if="entityName === 'vendor'">
                  <q-table
                    v-model:pagination="accessPagination"
                    :rows="accessCustomer"
                    :columns="accessCustomerColumns.columns"
                    :visible-columns="accessCustomerColumns.visible_columns"
                    :entity="entityName"
                    row-key="organisation_id"
                    :loading="loading"
                    table-class="alternate-color"
                    separator="cell"
                    color="primary"
                    table-header-class="text-weight-bolder text-primary"
                    flat bordered
                  >
                    <template #loading>
                      <q-inner-loading showing color="primary" />
                    </template>
                    <template #header="props">
                      <tr class="text-primary text-weight-bolder">
                        <template v-for="col in props.cols" :key="col?.name">
                          <template v-if="col?.rowspan === -1">
                            <q-th
                              v-if="'parent_row' in col"
                              :rowspan="Math.max(col?.rowspan || 1, 1)"
                              :colspan="Math.max(col?.parent_row?.colspan || 1, 1)"
                            >
                              {{ col?.parent_row?.label }}
                            </q-th>
                          </template>
                          <q-th
                            v-else
                            :rowspan="Math.max(col?.rowspan || 1, 1)"
                            :colspan="Math.max(col?.colspan || 1, 1)"
                            :class="{ 'text-left': col.name === 'customer' }"
                          >
                            {{ col.label }}
                          </q-th>
                        </template>
                      </tr>
                      <tr class="text-primary text-weight-bolder">
                        <template
                          v-for="(col,index) in props.cols.filter(c => c.rowspan === -1)"
                          :key="col?.name"
                        >
                          <q-th
                            :props="props"
                            :class="{'cell-left-border': index === 0 && props.cols.indexOf(col) > 0}"
                          >
                            {{ col.label }}
                          </q-th>
                        </template>
                      </tr>
                    </template>
                    <template v-slot:body="props">
                      <q-tr :props="props">
                        <q-td key="customer" :props="props">
                          {{ props.row?.customer }}
                        </q-td>
                        <q-td :key="UserAccessTypes.REPORTS.value" :props="props">
                          <q-checkbox v-model="props.row[UserAccessTypes.REPORTS.value]" dense />
                        </q-td>
                        <q-td :key="UserAccessTypes.DELIVERY.value" :props="props">
                          <q-checkbox v-model="props.row[UserAccessTypes.DELIVERY.value]" dense />
                        </q-td>
                        <q-td :key="UserAccessTypes.DOCUMENT_MANAGER.value" :props="props">
                          <q-checkbox v-model="props.row[UserAccessTypes.DOCUMENT_MANAGER.value]" dense />
                        </q-td>
                        <q-td :key="UserAccessTypes.SERVICE_CATALOGUE_VIEW.value" :props="props">
                          <q-checkbox v-model="props.row[UserAccessTypes.SERVICE_CATALOGUE_VIEW.value]" dense />
                        </q-td>
                        <q-td :key="UserAccessTypes.SERVICE_CATALOGUE_MANAGER.value" :props="props">
                          <q-checkbox v-model="props.row[UserAccessTypes.SERVICE_CATALOGUE_MANAGER.value]" dense />
                        </q-td>
                      </q-tr>
                    </template>
                  </q-table>
                </div>
              </q-card-section>
              <q-card-actions align="right" class="q-mb-md q-mr-sm">
                <q-btn
                  :loading="submitting"
                  color="primary"
                  text-color="dark"
                  label="Save"
                  v-close-popup
                  @click="addRow"
                >
                  <template v-slot:loading>
                    <q-spinner-pie />
                  </template>
                </q-btn>
                <q-btn
                  :loading="closing"
                  class="q-ml-sm"
                  color="white"
                  label="Cancel"
                  outline v-close-popup
                >
                  <template v-slot:loading>
                    <q-spinner-box />
                  </template>
                </q-btn>
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
        <q-table
          v-model:pagination="pagination"
          :rows="users"
          :columns="usercolumns"
          :entity="entityName"
          row-key="id"
          :loading="loading"
          table-class="alternate-color"
          table-header-class="text-weight-bolder text-primary"
          color="primary"
        >
          <template #loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template #body="props">
            <q-tr :props="props">
              <q-td key="fullName" :props="props">
                {{ props.row.user?.fullName }}
              </q-td>
              <q-td key="phone" :props="props">
                {{ props.row.user?.phone }}
              </q-td>
              <q-td key="email" :props="props">
                <div class="text-pre-wrap">
                  {{ props.row.user?.email }}
                </div>
              </q-td>
              <q-td key="admin" :props="props">
                <q-toggle
                  v-model="props.row.admin"
                  icon="star"
                  :false-value="0"
                  :true-value="1"
                  color="blue"
                  unchecked-icon="clear"
                  :disable="!isAdmin"
                  @update:model-value="val => adminToggle(props.row, val)"
                />
              </q-td>
              <q-td key="roles" :props="props">
                <q-badge v-if="props.row.customers_count" color="blue">
                  {{ props.row.customers_count }}
                </q-badge>
              </q-td>
              <q-td key="2fa" :props="props">
                <template v-if="props.row?.user?.twoFactorEnabled?.status">
                  <q-badge
                    v-if="props.row?.user?.twoFactorEnabled?.isEnabled"
                    color="positive"
                    text-color="dark"
                    round
                  >
                    <q-icon name="fa-solid fa-check" class="q-mr-xs" />
                    Enabled
                  </q-badge>
                  <q-badge
                    v-else
                    color="primary"
                    text-color="dark"
                    round
                  >
                    <q-icon name="fa-solid fa-hourglass-half" class="q-mr-xs" />
                    Not Confirmed
                  </q-badge>
                </template>
              </q-td>
              <q-td key="actions" :props="props">
                <q-btn
                  v-if="isAdmin"
                  color="opaque"
                  icon="edit"
                  size="sm"
                  padding="xs"
                  flat dense rounded
                  @click="editItem(props.row)"
                />
                <q-btn
                  v-if="canDelete(props.row)"
                  color="negative"
                  icon="delete"
                  size="sm"
                  padding="xs"
                  flat dense rounded
                  @click="buttonClick(props.row)"
                >
                  <q-tooltip> This user may be removed</q-tooltip>
                </q-btn>
                <div v-else>
                  <q-icon icon="thumb_up" />
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <div v-if="isAdmin">
          <div class="text-h6 q-mb-sm q-mt-lg">
            {{ newItemLabel }}
          </div>
          <div class="q-mb-sm">
            NB You must complete all the fields, but if the email is already registered, that existing user info will be
            used
          </div>
          <div class="row">
            <div class="col-xs-12 col-sm-6 col-lg-3 row items-center form-field">
              <q-input
                v-model="newUserData.first_name"
                class="col q-mr-sm"
                label="First name"
                label-color="white"
                type="text"
                maxlength="255"
                outlined
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-lg-3 row items-center form-field">
              <q-input
                v-model="newUserData.last_name"
                class="col q-mr-sm"
                label="Last name"
                label-color="white"
                type="text"
                maxlength="255"
                outlined
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-lg-3 row items-center form-field">
              <q-input
                v-model="newUserData.email"
                class="col q-mr-sm"
                label="Email"
                label-color="white"
                type="email"
                maxlength="255"
                outlined
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-lg-3 row items-center form-field">
              <q-input
                v-model="newUserData.phone"
                class="col q-mr-sm"
                label="Phone"
                label-color="white"
                type="text"
                maxlength="255"
                outlined
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-lg-2 row justify-start items-center">
              <q-btn
                size="md"
                label="Add user"
                color="primary"
                text-color="dark"
                :disable="!allowCreateNew"
                unelevated
                @click="createUser"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-else>You are not authorised to view this page</div>
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
              label="OK"
              color="primary"
              flat v-close-popup
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue"
import { mapGetters } from "vuex"
import { ClassCombinations, UserAccessTypes } from "src/modules/StaticData.js"
import PageHeader from "components/common/PageHeader.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

export default defineComponent({
  name: "Access",
  components: { NewSelectorForm, PageHeader },
  props: ["vendor_id", "customer_id"],
  setup() {
    const saveDataResponse = ref()
    const saveDataHeader = ref("")
    const saveDataMessage = ref("")
    const saveError = ref(false)
    const new_customer = ref([])
    return {
      saveDataResponse,
      saveDataHeader,
      saveDataMessage,
      saveError,
      new_customer,

      model: ref(null),

      roles: [
        UserAccessTypes.REPORTS.info,
        UserAccessTypes.DELIVERY.info,
        UserAccessTypes.DOCUMENT_MANAGER.info,
        UserAccessTypes.SERVICE_CATALOGUE_VIEW.info,
        UserAccessTypes.SERVICE_CATALOGUE_MANAGER.info
      ],
      UserAccessTypes,
      ClassCombinations
    }
  },
  data() {
    return {
      pagination: {
        rowsPerPage: 20 // current rows per page being displayed
      },
      accessPagination: {
        rowsPerPage: 5 // current customer rows per page being displayed
      },
      goodtogo: false,
      loading: false,
      show_dialog: false,
      editedIndex: -1,
      editedItem: {
        first_name: "",
        last_name: "",
        phone: 0,
        email: ""
      },
      accessCustomer: [],
      newItemLabel: "New user access",
      newUserData: { first_name: "", last_name: "", email: "", phone: "", admin: 0 },
      usercolumns: [
        {
          name: "fullName",
          required: true,
          label: "Name",
          align: "left",
          field: row => row.user.fullName
        },
        { name: "phone", label: "Phone", align: "left", field: "user.phone" },
        { name: "email", label: "Email", align: "left", field: "user.email" },
        { name: "admin", label: "Admin", align: "center", field: "user.admin" },
        { name: "roles", label: "Access", align: "center", field: "user.customers_count" },
        { name: "2fa", label: "2FA Status", field: "2fa", align: "center" },
        { name: "actions", label: "Actions", field: "actions", align: "right" }
      ],
      newAddedCustomer: [],
      submitting: false,
      closing: false
    }
  },
  computed: {
    ...mapGetters({
      muser: "auth/getUser"
    }),
    accessCustomerColumns: function() {
      let column = [
        {
          name: "customer",
          label: "Customer",
          field: "customer",
          align: "left",
          required: true,
          sortable: true,
          rowspan: 2
        },
        {
          name: UserAccessTypes.REPORTS.value,
          label: UserAccessTypes.REPORTS.label,
          field: UserAccessTypes.REPORTS.value,
          align: "center",
          rowspan: 2
        },
        {
          name: UserAccessTypes.DELIVERY.value,
          label: UserAccessTypes.DELIVERY.label,
          field: UserAccessTypes.DELIVERY.value,
          align: "center",
          rowspan: 2
        },
        {
          name: UserAccessTypes.DOCUMENT_MANAGER.value,
          label: UserAccessTypes.DOCUMENT_MANAGER.label,
          field: UserAccessTypes.DOCUMENT_MANAGER.value,
          align: "center",
          rowspan: 2
        }
      ]

      if (this.organisation.has_service_catalogue) {
        column.push({
          name: UserAccessTypes.SERVICE_CATALOGUE_VIEW.value,
          label: "View",
          field: UserAccessTypes.SERVICE_CATALOGUE_VIEW.value,
          align: "center",
          rowspan: -1,
          parent_row: {
            name: UserAccessTypes.SERVICE_CATALOGUE.value,
            label: UserAccessTypes.SERVICE_CATALOGUE.label,
            field: UserAccessTypes.SERVICE_CATALOGUE.value,
            align: "center",
            colspan: 2
          }
        })
        column.push({
          name: UserAccessTypes.SERVICE_CATALOGUE_MANAGER.value,
          label: "Manager",
          field: UserAccessTypes.SERVICE_CATALOGUE_MANAGER.value,
          align: "center",
          rowspan: -1
        })
      }

      return {
        columns: column,
        visible_columns: [
          "customer",
          UserAccessTypes.REPORTS.value,
          UserAccessTypes.DELIVERY.value,
          UserAccessTypes.DOCUMENT_MANAGER.value,
          UserAccessTypes.SERVICE_CATALOGUE_VIEW.value,
          UserAccessTypes.SERVICE_CATALOGUE_MANAGER.value
        ]
      }
    },
    pageTitle: function() {
      return this.entityNameCap + " Area"
    },
    pageSubTitle: function() {
      return this.is_authorised && this.goodtogo ? "People with access to the " + this.organisation.name + " area" : ""
    },
    breadcrumbs: function() {
      let breadcrumbList = []

      if (this.is_authorised && this.goodtogo) {
        breadcrumbList.push({ route: this.dashboardLink, name: this.organisation.name })
        breadcrumbList.push({ route: this.userManagementDashboardLink, name: "User Management" })
        breadcrumbList.push({ route: "", name: "User Access" })
      }

      return breadcrumbList
    },
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    is_super_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("super_admin") > -1
    },
    entityName: function() {
      if (this.vendor_id) return "vendor"
      if (this.customer_id) return "customer"
      return "nada"
    },
    entityNameCap: function() {
      return this.entityName.replace(/^\w/, (c) => c.toUpperCase())
    },
    allowCreateNew: function() {
      return this.newUserData.first_name.trim() !== "" &&
        this.newUserData.last_name.trim() !== "" &&
        this.newUserData.phone.trim() !== "" &&
        this.isValidEmail
    },
    users: function() {
      let c = this.$store.getters["admin/getUsers"]
      c = JSON.parse(JSON.stringify(c))
      if (Array.isArray(c) && c.length > 0) {
        c.sort((a, b) => (a.last_name > b.last_name ? 1 : b.last_name > a.last_name ? -1 : 0))
      }
      return c.map(val => {
        val.access_customer = (val.access_customer ?? []).filter(val => val.access && val.access !== "")
        val.customers_count = val.access_customer.length
        return val
      })
    },
    isAdmin: function() {
      if (this.is_super_admin) return true

      const specialUser = this.users.find(obj => {
        return parseInt(obj.user.id) === parseInt(this.user.id) && obj.admin === 1
      })

      return specialUser !== undefined
    },
    isValidEmail: function() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailPattern.test(this.newUserData.email.trim())
    },
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    organisations: function() {
      return this.$store.getters["admin/getOrganisations"]
    },
    dashboardLink: function() {
      switch (this.entityName) {
        case "vendor":
          return "/" + this.entityName + "/" + this.vendor_id
        case "customer":
          return "/" + this.entityName + "/" + this.customer_id
      }
      return "nada"
    },
    userManagementDashboardLink: function() {
      return this.dashboardLink + "/user-management"
    },
    is_authorised: function() {
      if (this.is_super_admin) return true

      const result = this.users.find(obj => parseInt(obj.user.id) === parseInt(this.user.id))

      return !!result
    },
    allCustomers: function() {
      return (this.organisations ?? []).filter(val => !this.newAddedCustomer.includes(val.id))
    }
  },
  watch: {
    users: function() {
      this.goodtogo = true
      this.$q.loading.hide()
    }
  },
  mounted() {
    this.$q.loading.show()
    this.getUsers(true)
    this.getOrganisations(true)
  },
  methods: {
    resetLocalData: function() {
      this.newUserData = { first_name: "", last_name: "", email: "", phone: "", admin: 0 }
    },
    getUsers: function() {
      let querystring = ""
      switch (this.entityName) {
        case "vendor":
          querystring = "type=vendor&include=user,vendor,access_customer&filter[vendor_id]=" + this.vendor_id
          this.$store.dispatch("admin/getSpecialUsers", querystring)
          this.$store.dispatch("admin/getOrganisation", this.vendor_id)
          break
        case "customer":
          querystring = "type=customer&include=user,customer,access_customer&filter[customer_id]=" + this.customer_id
          this.$store.dispatch("admin/getSpecialUsers", querystring)
          this.$store.dispatch("admin/getOrganisation", this.customer_id)
          break
      }
    },
    getOrganisations: function(force) {
      if (this.organisations.length < 1 || force) {
        this.$store.dispatch(
          "admin/datacallDt",
          { call: "organisations", method: "get" }
        )
      }
    },
    createUser: function() {
      let formData = this.newUserData ?? {}
      formData.type = this.entityName
      formData.vendor_id = this.vendor_id
      formData.customer_id = this.customer_id
      this.$store.dispatch(
        "admin/datacallDt",
        { call: "specialUser", method: "post", data: formData }
      ).then(() => {
        this.saveDataHeader = "New Special User"
        this.saveError = false
        this.saveDataResponse = true
        this.saveDataMessage = "New user added successfully"
        this.resetLocalData()
        this.getUsers(true)
      }).catch(e => {
        this.saveError = true
        this.saveDataHeader = "Save data error"
        this.saveDataMessage = e
        this.saveDataResponse = true
      })
    },
    addRow: function() {
      if (this.editedIndex > -1) {
        this.updateUser(this.editedItem)
        Object.assign(this.users[this.editedIndex], this.editedItem)
      } else {
        this.users.push(this.editedItem)
      }
      this.close()
      this.getUsers(true)
    },
    updateUser: function() {
      const userData = {}
      let user_id = this.editedItem.id
      for (const key in this.editedItem) {
        if (Object.hasOwnProperty.call(this.newUserData, key)) {
          userData[key] = this.editedItem[key].trim()
        }
      }
      userData.accessCustomer = this.accessCustomer

      this.$store.dispatch(
        "admin/datacallDt",
        { data: userData, call: "users/" + user_id, method: "put" }
      ).then(() => {
        this.newAddedCustomer = []
        if (user_id === this.user.id) {
          this.$store.dispatch("auth/getUser")
        }
        this.getUsers(true) // get updated list
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
    editItem: function(item) {
      this.newAddedCustomer = []
      this.new_customer = []
      this.editedIndex = (this.users ?? []).indexOf(item)
      this.editedItem = Object.assign({}, item.user)
      this.accessCustomer = (item?.access_customer ?? []).map(element => {
        if (
          !this.newAddedCustomer.includes(element.organisation_id) &&
          element.access.search(UserAccessTypes.REPORTS.value) >= 0 &&
          element.access.search(UserAccessTypes.DELIVERY.value) >= 0 &&
          element.access.search(UserAccessTypes.DOCUMENT_MANAGER.value) >= 0 &&
          element.access.search(UserAccessTypes.SERVICE_CATALOGUE_VIEW.value) >= 0 &&
          element.access.search(UserAccessTypes.SERVICE_CATALOGUE_MANAGER.value) >= 0
        ) {
          this.newAddedCustomer.push(element.organisation_id)
        }
        return {
          ...element,
          access: element.access || "",
          user_id: item.user.id || "",
          [UserAccessTypes.REPORTS.value]: (element.access_list ?? []).includes(UserAccessTypes.REPORTS.value),
          [UserAccessTypes.DELIVERY.value]: (element.access_list ?? []).includes(UserAccessTypes.DELIVERY.value),
          [UserAccessTypes.DOCUMENT_MANAGER.value]: (element.access_list ?? []).includes(UserAccessTypes.DOCUMENT_MANAGER.value),
          [UserAccessTypes.SERVICE_CATALOGUE_VIEW.value]: (element.access_list ?? []).includes(UserAccessTypes.SERVICE_CATALOGUE_VIEW.value),
          [UserAccessTypes.SERVICE_CATALOGUE_MANAGER.value]: (element.access_list ?? []).includes(UserAccessTypes.SERVICE_CATALOGUE_MANAGER.value)
        }
      })
      this.show_dialog = true
    },
    close: function() {
      this.show_dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.newUserData)
        this.editedIndex = -1
      }, 300)
    },
    canDelete: function(row) {
      return this.isAdmin || this.user.id === row.user.id
    },
    buttonClick: function(row) {
      this.deleteUser(row.id)
    },
    adminToggle: function(val) {
      const userData = {
        id: val.id,
        admin: val.admin,
        type: this.entityName,
        vendor_id: this.vendor_id,
        customer_id: this.customer_id
      }
      this.$store.dispatch(
        "admin/datacallDt",
        { call: "specialUser/" + val.id, method: "put", data: userData }
      ).then(() => {
        this.saveDataHeader = "Updated User"
        this.saveError = false
        this.saveDataResponse = true
        this.saveDataMessage = "User updated successfully"
        this.resetLocalData()
        this.getUsers(true) // get updated list
      }).catch(e => {
        this.saveError = true
        this.saveDataHeader = "Save data error"
        this.saveDataMessage = e // + e.response.data.message
        this.saveDataResponse = true
      })
      return 1
    },
    deleteUser: function(userId) {
      const userData = { id: userId, type: this.entityName }
      this.$store.dispatch(
        "admin/datacallDt",
        { call: "specialUser/" + userData.id, method: "delete", data: userData }
      ).then(() => {
        this.saveDataHeader = "User Removed"
        this.saveError = false
        this.saveDataResponse = true
        this.saveDataMessage = "User access successfully removed"
        this.getUsers(true) // get updated list
      }).catch(e => {
        this.saveError = true
        this.saveDataHeader = "Removal error"
        this.saveDataMessage = e
        this.saveDataResponse = true
      })
    },
    addCustomer: function() {
      this.new_customer.map(val => {
        if (!this.newAddedCustomer.includes(val)) {
          this.newAddedCustomer.push(val)
          let org = this.organisations.filter(v => v.id === val)
          if (
            org.length > 0
            && this.accessCustomer.filter(v => v.organisation_id === org[0].id).length === 0
          ) {
            this.accessCustomer.push({
              id: null,
              user_id: this.editedItem.id,
              organisation_id: org[0].id,
              customer: org[0].name,
              [UserAccessTypes.REPORTS.value]: false,
              [UserAccessTypes.DELIVERY.value]: false,
              [UserAccessTypes.DOCUMENT_MANAGER.value]: false,
              [UserAccessTypes.SERVICE_CATALOGUE_VIEW.value]: false,
              [UserAccessTypes.SERVICE_CATALOGUE_MANAGER.value]: false
            })
          }
        }
      })
      this.new_customer = []
    }
  }
})
</script>

<style lang="scss" scoped>
.alternate-color .q-item {
  background-color: rgba(54, 76, 102, 0.2);
}

.alternate-color .q-item:nth-of-type(2n) {
  background-color: rgba(54, 76, 102, 0.1);
}

.alternate-color .q-tr {
  background-color: rgba(54, 76, 102, 0.2);
}

.alternate-color .q-tr:nth-of-type(2n) {
  background-color: rgba(54, 76, 102, 0.1);
}

.max-w-select {
  max-width: calc(min(1200px, 80vw) - 84px);
}
</style>
