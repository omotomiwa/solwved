<template>
  <q-page class="row justify-center items-start q-pt-xl">
    <q-card v-if="dataReady" class="login text-dark shadow-15">
      <q-card-section class="bg-grey-10 row items-center">
        <img style="width: 100%;" alt="SOWLVED logo" src="~assets/sowlve_owl_head.svg" />
        <!-- <span class="text-white text-weight-bold text-uppercase q-ml-md">SOWLVED Login</span> -->
      </q-card-section>
      <template v-if="!showTwoFactorVerification">
        <q-form class="q-gutter-md" @submit="submit">
          <q-card-section>
            <q-input
              v-model="email"
              data-cy="email"
              filled
              label="Email address"
              stack-label
              autocomplete="username"
              bottom-slots
              label-color="white"
              color="primary"
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
              <template #error> Please enter a valid email address</template>
            </q-input>
            <q-input
              v-model="password"
              data-cy="password"
              filled
              label="Password"
              stack-label
              autocomplete="current-password"
              bottom-slots
              label-color="white"
              color="primary"
              :rules="[val => !!val || '* Required']"
              lazy-rules
              hide-bottom-space
              type="password"
              @keyup="inputChanged"
            >
              <template #prepend>
                <q-icon color="white" name="vpn_key" />
              </template>
              <template #error> Please enter your password</template>
            </q-input>
            <div v-if="displayMessage" :class="loginError ? 'warning' : 'text-white'" class="q-mt-md">
              {{ message }}
            </div>
          </q-card-section>
          <q-card-actions align="between" class="q-px-md q-pb-md q-mt-none">
            <q-btn size="md" unelevated outline color="white" @click="resetPassword"> Reset Password</q-btn>
            <q-btn
              data-cy="submit"
              size="md"
              padding="sm lg"
              :disable="!allowSubmit"
              color="primary"
              text-color="dark"
              type="submit"
              @click="submit"
            >
              Login
            </q-btn>
          </q-card-actions>
        </q-form>
      </template>
      <template v-else>
        <q-form class="q-gutter-md" @submit="verify2fa">
          <q-card-section>
            <q-input
              v-model="verificationCode"
              label="MFA Code"
              label-color="white"
              color="primary"
              mask="######"
              placeholder="######"
              filled
              stack-label
              lazy-rules
              hint="Enter the code from MFA program"
            >
              <template #prepend>
                <q-icon color="white" name="lock" />
              </template>
              <template #error> Please enter a valid email address</template>
            </q-input>
            <div v-if="displayMessage" :class="loginError ? 'warning' : 'text-white'" class="q-mt-md">
              {{ message }}
            </div>
          </q-card-section>
          <q-card-actions align="between" class="q-px-md q-pb-md q-mt-none">
            <q-btn
              data-cy="submit"
              size="md"
              class="full-width"
              padding="sm lg"
              :disable="!allowVerify"
              color="primary"
              text-color="dark"
              type="submit"
            >
              Verify
            </q-btn>
          </q-card-actions>
        </q-form>
      </template>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from "vue"
import { useLocalStorage } from "src/composables/localStorage.js"
import { localStorageKey } from "src/modules/StaticData.js"

export default {
  name: "Login",
  setup() {
    const dataReady = ref(true)
    const email = ref("")
    const password = ref("")

    const { getLocalData, setLocalData } = useLocalStorage()

    return {
      dataReady,
      email,
      password,

      getLocalData,
      setLocalData
    }
  },
  data() {
    return {
      loginError: false,
      message: "",
      displayMessage: false,
      showTwoFactorVerification: false,
      verificationCode: null
    }
  },
  computed: {
    allowSubmit: function() {
      return this.isValidEmail(this.email) && this.password !== "" && !this.loginError
    },
    loggedIn: function() {
      return this.$store.getters["auth/getLoggedIn"]
    },
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    cookieReady: function() {
      return this.$store.getters["auth/getCookie"]
    },
    allowVerify: function() {
      return (this.verificationCode ?? "").replace(" ", "").length === 6
    }
  },
  watch: {
    user: function(val) {
      if (val) {
        let only_consultant = val && val.roles && val.roles.indexOf("consultant") > -1 &&
          !(
            val.roles.indexOf("vendor_admin") > -1 ||
            val.roles.indexOf("customer_admin") > -1 ||
            val.roles.indexOf("vendor_user") > -1 ||
            val.roles.indexOf("customer_user") > -1
          )
        if (val.email_verified_at) {
          let path = this.getLocalData(localStorageKey.PAGE)
          let query = this.getLocalData(localStorageKey.PAGE_QUERY)
          let defaultPath = only_consultant ? "/consultant" : "/"
          this.$router.push({ path: path || defaultPath, query: query || {} })
        } else {
          this.$router.push({ path: "/profile" })
        }
      }
    },
    cookieReady: function(newVal) {
      if (newVal === true) {
        this.checkExistingLogin()
      }
    }
  },
  mounted: function() {
    this.$store.dispatch("auth/getCSRF")
    this.resetMessage()
    if (this.cookieReady) {
      this.checkExistingLogin()
    }
  },
  methods: {
    isValidEmail: function() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailPattern.test(this.email)
    },
    inputChanged: function() {
      this.resetMessage()
    },
    submit: async function() {
      this.$store.dispatch(
        "auth/apiLogin",
        { email: this.email, password: this.password }
      ).then(data => {
        if ("two_factor" in data && !!data.two_factor) {
          this.showTwoFactorVerification = true
        } else {
          this.loginError = false
          this.message = "Login successful, fetching your details..."
          this.displayMessage = true
          // login successful, get user
          this.$store.dispatch("auth/getUser")
        }
      }).catch(e => {
        let errorMessage = JSON.parse(e.response) ?? e
        this.$q.notify({
          type: "negative",
          message: errorMessage.message
        })
      })
    },
    resetPassword: function() {
      this.$router.push({ path: "/login/forgotten-password" })
    },
    checkExistingLogin: async function() {
      if (this.user) {
        this.$router.push({ path: "/" })
      } else {
        this.$store.dispatch("auth/getUser").then(() => {
          this.$router.push({ path: "/" })
        }).catch(() => {
          this.dataReady = true
        })
      }
    },
    resetMessage: function() {
      this.loginError = false
      this.message = ""
      this.displayMessage = false
    },
    verify2fa: function() {
      this.$store.dispatch(
        "auth/verify2fa",
        { code: this.verificationCode }
      ).then(() => {
        this.$q.notify({
          type: "positive",
          textColor: "dark",
          message: "Login successful"
        })
        // login successful, get user
        this.$store.dispatch("auth/getUser")
      }).catch(e => {
        this.$q.notify({
          type: "negative",
          message: e.message || e || "Fail to disable 2FA"
        })
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
