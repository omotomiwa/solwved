<template>
  <q-page class="row justify-center items-start q-pt-xl">
    <q-card class="login text-dark shadow-15">
      <q-card-section class="bg-grey-10 row items-center">
        <img style="width: 100%;" alt="SOWLVED logo" src="~assets/sowlve_owl_head.svg" />
        <p class="text-white text-weight-bold text-uppercase q-ml-md text-center q-mt-md" style="width:100%;">
          Forgotten Password
        </p>
      </q-card-section>
      <q-card-section v-if="!passwordReset" class="row items-center text-white">
        <div class="text-subtitle">
          Please enter your email address and we will send you a link to reset your password
        </div>
      </q-card-section>
      <q-card-section>
        <q-form v-if="!passwordReset" class="q-gutter-md" @submit="submit">
          <q-card-section>
            <q-input
              v-model="email"
              filled
              label="Email address"
              stack-label
              label-color="white"
              color="primary"
              outlined
              bottom-slots
              :rules="[
                val => !!val || '* Required',
                val => isValidEmail(val) || 'Please enter a valid email address',
              ]"
              lazy-rules
              @keyup="inputChanged"
            >
              <template #prepend>
                <q-icon color="white" name="email" />
              </template>
              <template #error>
                Please enter a valid email address
              </template>
            </q-input>
          </q-card-section>
        </q-form>
      </q-card-section>
      <q-card-section v-if="displayMessage" :class="passwordReset? 'q-pa-md':'q-py-none q-my-none'">
        <div :class="error? 'warning':'text-white'">
          {{ message }}
        </div>
      </q-card-section>
      <q-card-actions v-if="!passwordReset" align="between" class="q-px-md q-pb-md q-mt-none">
        <q-btn
          to="/login"
          unelevated
          outline
          color="white"
          padding="sm lg"
        >
          Back to login
        </q-btn>
        <q-btn
          :disable="!allowSubmit"
          color="primary"
          text-color="dark"
          padding="sm lg"
          type="submit"
          @click="submit"
        >
          Request Reset
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from "vue"

export default {
  name: "ForgottenPassword",
  setup() {
    const email = ref("")
    const error = ref("")
    const message = ref("")
    const displayMessage = ref("")

    return {
      email,
      error,
      message,
      displayMessage
    }
  },
  computed: {
    allowSubmit: function() {
      return this.isValidEmail(this.email) && this.password !== "" && !this.error
    },
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    passwordReset: function() {
      return this.$store.getters["auth/getPasswordResetStatus"]
    }
  },
  watch: {
    user: function(val) {
      if (val) {
        this.$router.push({ path: "/" })
      }
    }
  },
  methods: {
    resetMessage: function() {
      this.error = false
      this.message = ""
      this.displayMessage = false
    },
    isValidEmail: function() {
      const reg = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      return reg.test(this.email)
    },
    inputChanged: function() {
      this.resetMessage()
    },
    submit: async function() {
      this.$store.dispatch(
        "auth/forgottenPassword",
        { email: this.email }
      ).then(() => {
        this.message = "Thank you, please now check your email and follow the instructions to reset your password"
        this.error = false
        this.displayMessage = true
      }).catch(e => {
        this.error = true
        this.message = e
        this.displayMessage = true
      })
    }
  }
}
</script>

<style scoped>
.login {
  width: 400px;
  max-width: 100%;
}

.warning {
  color: red;
}
</style>
