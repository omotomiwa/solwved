<template>
  <q-page class="row justify-center items-start q-pt-xl">
    <q-card class="login text-dark">
      <q-card-section class="bg-primary row items-center">
        <img style="width: 100%;" alt="SOWLVED logo" src="~assets/sowlve_owl_head.svg" />
        <span class="text-white text-weight-bold text-uppercase q-ml-md">SOWLVED User Registration</span>
      </q-card-section>
      <q-form class="q-gutter-md" @submit="submit">
        <q-card-section>
          <q-input
            v-model="firstName"
            filled
            label="First Name"
            stack-label
            bottom-slots
            :rules="[val => !!val || '* Required']"
            lazy-rules
            type="text"
            @keyup="inputChanged"
          >
            <template #prepend>
              <q-icon name="badge" />
            </template>
            <template #error>
              Please enter your first name
            </template>
          </q-input>
          <q-input
            v-model="lastName"
            filled
            label="Last Name"
            stack-label
            bottom-slots
            :rules="[val => !!val || '* Required']"
            lazy-rules
            type="text"
            @keyup="inputChanged"
          >
            <template #prepend>
              <q-icon name="badge" />
            </template>
            <template #error>
              Please enter your name
            </template>
          </q-input>
          <q-input
            v-model="email"
            filled
            label="Email address"
            stack-label
            bottom-slots
            :rules="[
              val => !!val || '* Required',
              val => isValidEmail(val) || 'Please enter a valid email address',
            ]"
            lazy-rules
            @keyup="inputChanged"
          >
            <template #prepend>
              <q-icon name="email" />
            </template>
            <template #error>
              Please enter a valid email address
            </template>
          </q-input>
          <q-input
            v-model="password"
            filled
            label="Password"
            stack-label
            bottom-slots
            :rules="[val => !!val || '* Required']"
            lazy-rules
            type="password"
            @keyup="inputChanged"
          >
            <template #prepend>
              <q-icon name="vpn_key" />
            </template>
            <template #error>
              Please enter your password
            </template>
          </q-input>
          <div v-if="loginInvalid">
            Sorry, those details are invalid
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            :disable="!allowSubmit"
            color="primary"
            text-color="dark"
            type="submit"
            @click="submit"
          >
            Submit
          </q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from "vue"

export default {
  name: "Register",
  setup() {
    const firstName = ref("")
    const lastName = ref("")
    const email = ref("")
    const password = ref("")

    return {
      firstName,
      lastName,
      email,
      password
    }
  },
  data() {
    return {
      loginInvalid: false,
      submittingData: false
    }
  },
  computed: {
    allowSubmit: function() {
      return this.isValidEmail(this.email) && this.password !== ""
    },
    authUser: function() {
      return this.$store.getters["auth/getAuthUser"]
    }
  },
  mounted() {
    this.$store.dispatch("auth/getCSRF")
  },
  methods: {
    isValidEmail: function() {
      const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/
      return reg.test(this.email)
    },
    inputChanged: function() {
      this.loginInvalid = false
    },
    submit: async function() {
      if (this.submittingData === false) {
        this.submittingData = true
        const valid = await this.$store.dispatch(
          "auth/register",
          {
            first_name: this.firstName,
            last_name: this.lastName,
            email: this.email,
            password: this.password,
            password_confirmation: this.password
          }
        )
        if (valid === false) {
          this.loginInvalid = true
          this.submittingData = false
        } else {
          this.loginInvalid = false
          this.submittingData = false
          // redirect to dashboard
          this.$router.push({ path: "/login" })
        }
      }
    }
  }
}
</script>

<style scoped>
.login {
  width: 400px;
  max-width: 100%;
}
</style>
