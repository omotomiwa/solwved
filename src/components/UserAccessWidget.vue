<template>
  <div>
    <q-table
      :grid="$q.screen.xs"
      :rows="rows"
      :columns="columns"
      :pagination="pagination"
      row-key="id"
      color="primary"
      class="bordered"
      table-header-class="text-weight-bolder text-primary"
      no-results-label="There are currently no users"
      flat
      binary-state-sort
    >
      <template #body-cell-2fa="props">
        <q-td :props="props">
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
              text-color="dark"
              color="primary"
              round
            >
              <q-icon name="fa-solid fa-hourglass-half" class="q-mr-xs" />
              Not Confirmed
            </q-badge>
          </template>
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            v-if="current_user.id !== props.row.id"
            :label="deleteLabel"
            color="negative"
            size="sm"
            padding="sm md"
            dense
            unelevated
            @click="deleteUser(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>

    <div class="text-h6 q-mb-sm q-mt-sm">
      {{ newItemLabel }}
    </div>
    <div class="q-mb-sm">
      NB You must complete all the fields, but if the email is already registered, that existing user info will be used
    </div>
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-lg-2 row items-center form-field">
        <q-input
          v-model="newUserData.first_name"
          class="col q-mr-sm"
          dense
          outlined
          label="First name"
          stack-label
          label-color="white"
          type="text"
          maxlength="255"
        />
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-2 row items-center form-field">
        <q-input
          v-model="newUserData.last_name"
          class="col q-mr-sm"
          dense
          outlined
          label="Last name"
          stack-label
          label-color="white"
          type="text"
          maxlength="255"
        />
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-3 row items-center form-field">
        <q-input
          v-model="newUserData.email"
          class="col q-mr-sm"
          dense
          outlined
          label="Email"
          stack-label
          label-color="white"
          type="email"
          maxlength="255"
        />
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-2 row items-center form-field">
        <q-input
          v-model="newUserData.phone"
          class="col q-mr-sm"
          dense
          outlined
          label="Phone"
          stack-label
          label-color="white"
          type="text"
          maxlength="255"
        />
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-2 row justify-start items-center form-field">
        <q-btn
          :disable="!allowCreateNew"
          label="Add user"
          color="primary"
          text-color="dark"
          size="md"
          unelevated
          @click="createUser"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserAccessWidget",
  props: {
    users: { type: Array },
    current_user: { type: Object },
    deleteLabel: { type: String, default: "Remove Access" },
    newItemLabel: { type: String, default: "New user access" }
  },
  emits: ["deleteUser", "createUser"],
  data() {
    return {
      xUserData: { first_name: "", last_name: "", email: "", phone: "" },
      newUserData: { first_name: "", last_name: "", email: "", phone: "" },
      userData: { ...this.users },
      goodtogo: true,
      pagination: {
        rowsPerPage: 10 // current rows per page being displayed
      }
    }
  },
  computed: {
    columns: function() {
      return [
        { name: "fullname", label: "Full Name", align: "left", sortable: true, field: row => row?.user?.fullName },
        { name: "email", label: "Email", align: "left", sortable: true, field: row => row?.user?.email },
        { name: "phone", label: "Phone", align: "left", sortable: true, field: row => row?.user?.phone },
        { name: "2fa", label: "2FA Status", field: "2fa", align: "center" },
        { name: "actions", label: "", field: "actions", align: "right" }
      ]
    },
    rows: function() {
      return this.users ?? []
    },
    allowCreateNew: function() {
      return this.newUserData.first_name.trim() !== "" && this.newUserData.last_name.trim() !== "" && this.newUserData.phone.trim() !== "" && this.isValidEmail
    },
    isValidEmail: function() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailPattern.test(this.newUserData.email.trim())
    },
    // patches properties if required
    // id is that of the user, or the consultant, or the vendor user, or the customer user
    // other props such as name are patched from the user.user unless it is a direct User model todo: marka follow up on direct user model
    proxyUsers: function() {
      const u = []
      const a = this.users
      for (let index = 0; index < a.length; index++) {
        const user = a[index]
        if (user.first_name !== undefined) {
          u.push(user)
        } else if (user.user !== undefined) {
          const cu = {
            id: user.id,
            first_name: user.user.first_name,
            last_name: user.user.last_name,
            fullName: user.user.fullName,
            email: user.user.email,
            phone: user.user.phone
          }
          u.push(cu)
        }
      }
      return u
    }
  },
  watch: {
    users: function() {
      this.resetLocalData()
      this.goodtogo = true
    }
  },
  methods: {
    resetLocalData: function() {
      this.newUserData = { first_name: "", last_name: "", email: "", phone: "" }
    },
    deleteUser: function(id) {
      this.$emit("deleteUser", id)
    },
    createUser: function() {
      this.$emit("createUser", this.newUserData)
      this.resetLocalData()
    }
  }
}
</script>

<style scoped>
.alternate-color .q-item {
  background-color: rgba(54, 76, 102, 0.2);
}

.alternate-color .q-item:nth-of-type(2n) {
  background-color: rgba(54, 76, 102, 0.1);
}
</style>
