<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Global User Management</div>
      <div v-if="is_super_admin" class="text-h6 breadcrum text-center">
        <router-link class="breadcrum" to="/admin"> Super Admin Dashboard</router-link>
        <span> / Users</span>
      </div>
      <div class="q-pa-md">
        <q-dialog v-model="show_dialog" @hide="close">
          <q-card>
            <q-card-section>
              <div class="text-h6">Edit</div>
            </q-card-section>
            <q-card-section>
              <div class="row">
                <q-input color="primary" v-model="editedItem.first_name" label="First Name" autofocus />
                <q-input color="primary" v-model="editedItem.last_name" label="Last Name" />
                <q-input color="primary" v-model="editedItem.phone" label="Phone" />
                <q-input color="primary" v-model="editedItem.email" label="Email" />
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                v-close-popup
                flat
                label="OK"
                color="primary"
                text-color="dark"
                @click="addRow"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <q-btn
          outline
          color="primary"
          label="Add user"
          @click="show_dialog = true"
        />
        <q-table
          v-model:pagination="pagination"
          :rows="users"
          :columns="usercolumns"
          row-key="name"
          class="bordered no-shadow"
          table-header-class="text-weight-bolder text-primary"
          color="primary"
        >
          <template #body="props">
            <q-tr :props="props">
              <q-td key="first_name" :props="props" :style="colorStyle(props.row?.linkInfo?.isSuper)">
                {{ props.row.first_name }}
                <q-popup-edit
                  v-slot="service"
                  v-model="props.row.first_name"
                  buttons
                  color="primary"
                  title="First Name"
                >
                  <q-input
                    color="primary"
                    v-model="service.value"
                    type="text"
                    autocomplete="off"
                    maxlength="255"
                    dense autofocus counter
                    @keyup.enter="service.set"
                  />
                </q-popup-edit>
              </q-td>
              <q-td key="last_name" :props="props">
                {{ props.row.last_name }}
                <q-popup-edit
                  v-slot="service"
                  v-model="props.row.last_name"
                  buttons
                  color="primary"
                  title="Last Name"
                >
                  <q-input
                    v-model="service.value"
                    type="text"
                    color="primary"
                    autocomplete="off"
                    maxlength="255"
                    dense autofocus counter
                    @keyup.enter="service.set"
                  />
                </q-popup-edit>
              </q-td>
              <q-td key="phone" :props="props">
                {{ props.row.phone }}
                <q-popup-edit
                  v-model="props.row.phone"
                  color="primary"
                  title="Update phone"
                  buttons
                  persistent
                >
                  <q-input
                    v-model="props.row.phone"
                    type="text"
                    color="primary"
                    autocomplete="off"
                    dense autofocus counter
                    hint="Use buttons to close"
                  />
                </q-popup-edit>
              </q-td>
              <q-td key="email" :props="props">
                <div class="text-pre-wrap">
                  {{ props.row.email }}
                </div>
                <q-popup-edit
                  v-model="props.row.email"
                  v-slot="service"
                  maxlength="255"
                  color="primary"
                  title="Update Email"
                  buttons
                >
                  <q-input
                    color="primary"
                    autocomplete="off"
                    v-model="service.value"
                    type="email"
                    dense autofocus
                  />
                </q-popup-edit>
              </q-td>
              <q-td key="num_vendors" :props="props">
                <q-badge v-if="props.row?.linkInfo?.numVendors" color="primary" outline>
                  {{ props.row.linkInfo.numVendors }}
                </q-badge>
              </q-td>
              <q-td key="num_customers" :props="props">
                <q-badge v-if="props.row?.linkInfo?.numCustomers" color="secondary" outline>
                  {{ props.row.linkInfo.numCustomers }}
                </q-badge>
              </q-td>
              <q-td key="num_consultants" :props="props">
                <q-badge v-if="props.row?.linkInfo?.numConsultants" color="accent" outline>
                  {{ props.row.linkInfo.numConsultants }}
                </q-badge>
              </q-td>
              <q-td key="num_engagements" :props="props">
                <q-badge v-if="props.row?.linkInfo?.numEngagements" color="warning" outline>
                  {{ props.row.linkInfo.numEngagements }}
                </q-badge>
              </q-td>
              <q-td key="2fa" :props="props">
                <template v-if="props.row?.twoFactorEnabled?.status">
                  <q-badge v-if="props.row?.twoFactorEnabled?.isEnabled" round color="positive" text-color="dark">
                    <q-icon name="fa-solid fa-check" class="q-mr-xs" />
                    Enabled
                  </q-badge>
                  <q-badge v-else round color="primary" text-color="dark">
                    <q-icon name="fa-solid fa-hourglass-half" class="q-mr-xs" />
                    Not Confirmed
                  </q-badge>
                </template>
              </q-td>
              <q-td key="actions" :props="props">
                <div class="flex-inline q-gutter-xs">
                  <q-btn color="opaque"
                         icon="edit"
                         size="sm"
                         padding="xs"
                         flat
                         dense
                         rounded
                         @click="editItem(props.row)"
                  />
                  <q-btn v-if="canDelete(props.row)"
                         icon="delete"
                         color="negative"
                         size="sm"
                         padding="xs"
                         flat
                         dense
                         rounded
                         @click="buttonClick(props.row)"
                  >
                    <q-tooltip>This user may be deleted</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <div class="text-h6 q-mb-sm q-mt-lg">
          {{ newItemLabel }}
        </div>
        <div class="row">
          <div class="col-12">
            <q-banner rounded class="q-my-md bg-negative text-dark q-mx-auto col" dense>
              <template v-slot:avatar>
                <q-icon name="warning" color="dark" />
              </template>
              You must complete all the fields, but if the email is already registered, the existing user's info will be
              used
            </q-banner>
          </div>
          <div class="col-xs-12 col-sm-6 col-lg-2 row items-center">
            <q-input
              v-model="newUserData.first_name"
              class="col q-mr-sm"
              color="primary"
              autocomplete="off"
              dense
              outlined
              label="First name"
              stack-label
              label-color="white"
              type="text"
              maxlength="255"
            />
          </div>
          <div class="col-xs-12 col-sm-6 col-lg-2 row items-center">
            <q-input
              v-model="newUserData.last_name"
              class="col q-mr-sm"
              color="primary"
              autocomplete="off"
              dense
              outlined
              label="Last name"
              stack-label
              label-color="white"
              type="text"
              maxlength="255"
            />
          </div>
          <div class="col-xs-12 col-sm-6 col-lg-3 row items-center">
            <q-input
              v-model="newUserData.email"
              class="col q-mr-sm"
              color="primary"
              autocomplete="off"
              dense
              outlined
              label="Email"
              stack-label
              label-color="white"
              type="email"
              maxlength="255"
            />
          </div>
          <div class="col-xs-12 col-sm-6 col-lg-2 row items-center">
            <q-input
              v-model="newUserData.phone"
              class="col q-mr-sm"
              color="primary"
              dense
              autocomplete="off"
              outlined
              label="Phone"
              stack-label
              label-color="white"
              type="text"
              maxlength="255"
            />
          </div>
          <div class="col-xs-12 col-sm-6 col-lg-2 row justify-start items-center">
            <q-btn
              size="md"
              label="Add user"
              color="primary"
              text-color="dark"
              :disable="!allowCreateNew"
              @click="createUser"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue"
import { ClassCombinations } from "src/modules/StaticData.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"

export default defineComponent({
  name: "Users",
  setup() {
    return {
      ClassCombinations
    }
  },
  data() {
    return {
      pagination: {
        rowsPerPage: 20 // current rows per page being displayed
      },
      show_dialog: false,
      editedIndex: -1,
      editedItem: { id: 0, first_name: "", last_name: "", phone: 0, email: "" },
      newItemLabel: "New user access",
      newUserData: { first_name: "", last_name: "", email: "", phone: "" }
    }
  },
  computed: {
    isBuiltEnvironment: function() {
      // return this.$store.getters["admin/getIsBuiltEnvironment"]
      return false
    },
    usercolumns: function() {
      return [
        { name: "first_name", required: true, label: "First Name", align: "left", field: "first_name", sortable: true },
        { name: "last_name", align: "left", label: "Last Name", field: "last_name", sortable: true },
        { name: "phone", label: "Phone", align: "left", field: "phone", sortable: false },
        { name: "email", label: "Email", align: "left", field: "email", sortable: false },
        {
          name: "num_vendors",
          required: true,
          label: "Vendors",
          align: "center",
          field: row => row?.linkInfo?.numVendors,
          sortable: false
        },
        {
          name: "num_customers",
          required: true,
          label: "Customers",
          align: "center",
          field: row => row?.linkInfo?.numCustomers,
          sortable: false
        },
        {
          name: "num_consultants",
          required: true,
          label: OrganisationTypeMethods.changeConsultant(this.isBuiltEnvironment, { isPlural: true }),
          align: "center",
          field: row => row?.linkInfo?.numConsultants,
          sortable: false
        },
        {
          name: "num_engagements",
          required: true,
          label: "Engagements",
          align: "center",
          field: row => row?.linkInfo?.numEngagements,
          sortable: false
        },
        { name: "2fa", label: "2FA Status", field: "2fa", align: "center" },
        { name: "actions", label: "Actions", field: "actions", align: "center" }
      ]
    },
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    is_super_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("super_admin") > -1
    },
    users: function() {
      let c = this.$store.getters["admin/getUsers"]
      c = JSON.parse(JSON.stringify(c))
      if (Array.isArray(c) && c.length > 0) {
        c.sort((a, b) => (a.last_name > b.last_name ? 1 : b.last_name > a.last_name ? -1 : 0))
      }
      return c
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
  mounted() {
    if (this.is_super_admin) {
      this.getUsers()
    }
  },
  methods: {
    colorStyle: function(isSuper) {
      const colors = {
        0: "color: white;",
        1: "color: gray;"
      }

      return colors[isSuper] || "color: purple;"
    },
    getUsers: function(force) {
      if (this.users.length < 1 || force) {
        this.$q.loading.show()
        const obj = { call: "users", method: "get" }
        this.$store.dispatch("admin/datacallDt", obj).then(() => {
          this.$q.loading.hide()
        }).catch(() => {
          this.$q.loading.hide()
        })
      }
    },
    createUser: function() {
      const userData = {}
      for (const key in this.newUserData) {
        if (Object.hasOwnProperty.call(this.newUserData, key)) {
          userData[key] = this.newUserData[key].trim()
        }
      }
      const obj = { data: userData, call: "users", method: "post" }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
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
    updateUser: function() {
      const userData = {}
      for (const key in this.editedItem) {
        if (Object.hasOwnProperty.call(this.newUserData, key)) {
          userData[key] = this.editedItem[key].trim()
        }
      }
      const obj = { data: this.editedItem, call: "users/" + this.editedItem.id, method: "put" }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
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
    deleteUser: function(customerUserId) {
      const obj = { id: customerUserId, call: "users", method: "delete" }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        // call service update
        this.getUsers(true)
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
    canDelete: function(row) {
      return !(
        this.user.id === row.id ||
        row?.linkInfo?.num_vendors ||
        row?.linkInfo?.num_customers ||
        row?.linkInfo?.num_consultants ||
        row?.linkInfo?.num_engagements
      )
    },
    buttonClick: function(row) {
      this.deleteUser(row.id)
    },
    addRow: function() {
      if (this.editedIndex > -1) {
        this.updateUser(this.editedItem)
        Object.assign(this.users[this.editedIndex], this.editedItem)
      } else {
        this.users.push(this.editedItem)
      }
      this.close()
    },
    deleteItem: function(item) {
      const index = this.data.indexOf(item)
      confirm("Are you sure you want to delete this item?") && this.data.splice(index, 1)
    },
    editItem: function(item) {
      this.editedIndex = this.users.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.show_dialog = true
    },
    close: function() {
      this.show_dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.newUserData)
        this.editedIndex = -1
      }, 300)
    }
  }
})
</script>
