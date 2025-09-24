<template>
  <q-page class="row justify-center items-start q-pt-xl">
    <q-card class="login text-dark shadow-15">
      <q-card-section class="bg-grey-10 row items-center">
        <img style="width: 100%;" alt="SOWLVED logo" src="~assets/sowlve_owl_head.svg" />
        <p class="text-white text-weight-bold text-uppercase q-ml-md text-center q-mt-md" style="width:100%;">
          Password Reset
        </p>
      </q-card-section>
      <q-card-section class="col items-center">
        <div class="text-white q-mb-md">
          Please enter your email and a new password below
        </div>
        <div class="text-white">
          Password requirements check:
          <ul>
            <li class="row items-center">
              <q-icon
                class="q-mr-sm"
                :color="isMinCharacters? 'green': 'red'"
                :name="isMinCharacters? 'check_circle': 'cancel'"
              />
              Minimum of 8 characters
            </li>
            <li class="row items-center">
              <q-icon
                class="q-mr-sm"
                :color="hasUppercaseCharacter? 'green': 'red'"
                :name="hasUppercaseCharacter? 'check_circle': 'cancel'"
              />
              At least one uppercase letter
            </li>
            <li class="row items-center">
              <q-icon
                class="q-mr-sm"
                :color="hasNumericCharacter? 'green': 'red'"
                :name="hasNumericCharacter? 'check_circle': 'cancel'"
              />
              At least one number
            </li>
            <li class="row items-center">
              <q-icon
                class="q-mr-sm"
                :color="hasSpecialCharacter? 'green': 'red'"
                :name="hasSpecialCharacter? 'check_circle': 'cancel'"
              />
              At least one special character
            </li>
            <li
              v-if="passwordConfirmation !==''"
              class="row items-center"
            >
              <q-icon
                class="q-mr-sm"
                :color="passwordsMatch? 'green': 'red'"
                :name="passwordsMatch? 'check_circle': 'cancel'"
              />
              Passwords must match
            </li>
          </ul>
        </div>
      </q-card-section>
      <q-form class="q-gutter-md" @submit="submit">
        <q-card-section>
          <q-input
            v-model="email"
            filled
            label="Email address"
            autocomplete="username"
            label-color="white"
            color="primary"
            stack-label
            bottom-slots
            :rules="[
              val => !!val || '* Required',
              val => isValidEmail(val) || 'Please enter a valid email address',
            ]"
            lazy-rules
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
            autocomplete="new-password"
            label-color="white"
            color="primary"
            stack-label
            bottom-slots
            :rules="[val => !!val || '* Required']"
            lazy-rules
            type="password"
          >
            <template #prepend>
              <q-icon name="vpn_key" />
            </template>
            <template #error>
              Please enter a new password
            </template>
          </q-input>
          <q-input
            v-model="passwordConfirmation"
            filled
            label="Password Confirmation"
            autocomplete="new-password"
            label-color="white"
            color="primary"
            stack-label
            bottom-slots
            :rules="[val => !!val || '* Required']"
            lazy-rules
            type="password"
          >
            <template #prepend>
              <q-icon name="vpn_key" />
            </template>
            <template #error>
              Please confirm your new password
            </template>
          </q-input>
        </q-card-section>
      </q-form>
      <q-card-section v-if="displayMessage" class="q-py-none q-my-none">
        <div :class="resetError? 'warning':''">
          {{ message }}
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-px-md q-pb-md q-mt-none">
        <q-btn
          :disable="!allowSubmit"
          class="q-ml-xs-none q-ml-sm-sm"
          color="primary"
          text-color="dark"
          size="md"
          type="submit"
          @click="submit"
          padding="sm lg"
        >
          Submit
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from "vue"

export default {
  name: "ResetPassword",
  props: ["token"],
  setup() {
    const email = ref("")
    const password = ref("")
    const passwordConfirmation = ref("")

    return {
      email,
      password,
      passwordConfirmation
    }
  },
  data() {
    return {
      displayMessage: false,
      resetError: false, /* Show message as warning in red, or not */
      message: ""
    }
  },
  computed: {
    allowSubmit: function() {
      return this.isValidEmail(this.email) && this.validPassword && this.password === this.passwordConfirmation
    },
    validPassword: function() {
      // Other checks are done server side
      return this.isMinCharacters && this.hasUppercaseCharacter && this.hasNumericCharacter && this.hasSpecialCharacter
    },
    passwordsMatch: function() {
      return this.password === this.passwordConfirmation
    },
    isMinCharacters: function() {
      return this.password.length > 7
    },
    hasUppercaseCharacter: function() {
      let a = false
      const s = this.password.split("")
      for (let index = 0; index < s.length; index++) {
        const element = s[index]
        if (element === element.toUpperCase() && element.match(/[A-Z]/i)) {
          a = true
          break
        }
      }
      return a
    },
    hasNumericCharacter: function() {
      let a = false
      const s = this.password.split("")
      for (let index = 0; index < s.length; index++) {
        const element = s[index]
        if (!isNaN(parseInt(element))) {
          a = true
          break
        }
      }
      return a
    },
    hasSpecialCharacter: function() {
      let a = false
      const s = this.password.split("")
      for (let index = 0; index < s.length; index++) {
        const element = s[index]
        if (element.match(/[^a-zA-Z\d\s:]/i)) {
          a = true
          break
        }
      }
      return a
    }
  },
  mounted: function() {
    this.displayMessage = false
    this.message = ""
    this.resetError = false
  },
  methods: {
    isValidEmail: function() {
      const reg = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      return reg.test(this.email)
    },
    submit: function() {
      const self = this
      this.$store.dispatch(
        "auth/resetPassword",
        {
          email: this.email,
          password: this.password,
          password_confirmation: this.passwordConfirmation,
          token: this.token
        }
      ).then(() => {
        this.message = "Password changed! Redirecting you to the login..."
        this.resetError = false
        this.displayMessage = true
        setTimeout(function() {
          self.$router.push({ path: "/login" })
        }, 1500)
      }).catch(e => {
        this.resetError = true
        this.message = e
        if (e.includes("password reset token")) {
          this.message = "This password reset token has already been used and is now invalid. Redirecting you to request a new password reset..."
          setTimeout(function() {
            self.$router.push({ path: "/login/forgotten-password" })
          }, 5000)
        }
        this.displayMessage = true
      })
    }
  }
}
</script>

<style scoped>
.login {
  width: 600px;
  max-width: 100%;
}

.warning {
  color: red;
}

ul {
  list-style-type: none;
  padding-left: 0;
  margin-left: 0;
}
</style>
