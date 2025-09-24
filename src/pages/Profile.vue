<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-narrow q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xl swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Account profile</div>
      <div class="text-h6 text-center text-white">for {{ user_name }}</div>
      <div class="q-pt-lg">

        <q-card>
          <q-tabs
            v-model="activeTab"
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
            dense
          >
            <q-tab name="profile" label="Profile" no-caps />
            <q-tab name="change_password" label="Change Password" no-caps />
            <q-tab v-if="siteConfig?.feature_enabled?.two_factor_authentication"
                   name="2fa"
                   label="Two Factor Authentication"
                   no-caps
            />
            <q-tab name="cache_service" label="Cache Service" no-caps />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <q-tab-panel name="profile">
              <div class="row items-center q-col-gutter-md">
                <q-input
                  ref="firstnameRef"
                  v-model="first_name"
                  label="First name"
                  stack-label
                  class="col-6"
                  label-color="white"
                  color="primary"
                  :rules="[val => !!val || 'First name is required']"
                />
                <q-input
                  ref="lastnameRef"
                  v-model="last_name"
                  label="Last name"
                  label-color="white"
                  color="primary"
                  stack-label
                  class="col-6"
                  :rules="[val => !!val || 'Last name is required']"
                />
                <q-input
                  ref="emailRef"
                  v-model="email"
                  label="Email"
                  label-color="white"
                  color="primary"
                  stack-label
                  class="col-6"
                  type="email"
                  bottom-slots
                  error-message="Please enter a valid email"
                  :error="!isValidEmail"
                />
                <q-input
                  v-model="phone"
                  label="Phone"
                  label-color="white"
                  color="primary"
                  class="col-6"
                  :rules="[val => !!val || 'Phone number is required']"
                />
                <div class="col-4">
                  <q-btn
                    label="Save Profile"
                    outline
                    size="md"
                    color="primary"
                    class="profile-button"
                    :disable="!allowProfileSave"
                    @click="saveProfile"
                  />
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="change_password">
              <div>
                <div class="text-body1 q-mb-sm">To change your account password, please complete the fields below</div>
                <div class="row items-center q-mb-md q-col-gutter-md">
                  <q-input v-model="current_password"
                           :type="showPassword ? 'text' : 'password'"
                           label="Current Password"
                           label-color="white"
                           autocomplete="current-password"
                           class="col-4"
                           stack-label
                           outlined
                  >
                    <template v-slot:append>
                      <q-icon
                        :name="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"
                        size="1.25rem"
                        @click="toggleShowPassword"
                      />
                    </template>
                  </q-input>
                  <q-input
                    v-model="new_password"
                    :type="showPassword ? 'text' : 'password'"
                    label="New Password"
                    autocomplete="new-password"
                    label-color="white"
                    class="col-4"
                    stack-label
                    outlined
                  >
                    <template v-slot:append>
                      <q-icon
                        :name="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"
                        size="1.25rem"
                        @click="toggleShowPassword"
                      />
                    </template>
                  </q-input>
                  <q-input
                    v-model="confirm_new_password"
                    :type="showPassword ? 'text' : 'password'"
                    label="Confirm New Password"
                    autocomplete="new-password"
                    label-color="white"
                    class="col-4"
                    stack-label
                    outlined
                  >
                    <template v-slot:append>
                      <q-icon
                        :name="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"
                        size="1.25rem"
                        @click="toggleShowPassword"
                      />
                    </template>
                  </q-input>
                  <div class="col-4">
                    <q-btn
                      :disable="!allowPasswordSave"
                      label="Update password"
                      class="profile-button"
                      color="primary"
                      size="md"
                      outline
                      @click="changePassword"
                    />
                  </div>
                </div>
                <div class="text-body1">
                  If for any reason you do not know your current password, then please log out, and select "Reset
                  password" from the login screen
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="2fa" v-if="siteConfig?.feature_enabled?.two_factor_authentication">

              <template v-if="user?.twoFactorEnabled?.status">
                <q-banner v-show="user?.twoFactorEnabled?.isEnabled" inline-actions rounded
                          class="bg-positive text-dark q-mb-sm">
                  Two Factor Authentication is setup successfully.
                  <template v-slot:action>
                    <q-icon flat name="fa-solid fa-xmark" />
                  </template>
                </q-banner>
                <q-banner v-show="!user?.twoFactorEnabled?.isEnabled" inline-actions rounded
                          class="bg-primary text-dark q-mb-sm">
                  Two Factor Authentication is enabled. Please confirm code to complete the setup.
                  <template v-slot:action>
                    <q-icon flat name="fa-solid fa-xmark" />
                  </template>
                </q-banner>
              </template>

              <div class="flex-inline items-center q-gutter-md">
                <q-btn
                  v-if="!(user?.twoFactorEnabled.isEnabled || user?.twoFactorEnabled.status)"
                  label="Enable 2FA"
                  :loading="loading.enable2fa"
                  color="primary"
                  no-caps
                  outline
                  @click="enable2FA"
                />
                <q-btn
                  v-else
                  label="Disable 2FA"
                  :loading="loading.disable2fa"
                  color="negative"
                  no-caps
                  outline
                  @click="disable2FA"
                />
                <template v-if="(user?.twoFactorEnabled.isEnabled || user?.twoFactorEnabled.status)">
                  <q-btn
                    v-if="!two_factor.show"
                    :loading="loading.setup2fa"
                    :disable="loading.disable2fa"
                    label="Setup 2FA"
                    color="primary"
                    no-caps
                    outline
                    @click="get2faImage"
                  />
                  <q-btn
                    v-if="!two_factor.show_recovery_code && user?.twoFactorEnabled?.isEnabled"
                    :loading="loading.show2faRecoveryCode"
                    :disable="loading.disable2fa"
                    label="Show Recovery Code"
                    color="primary"
                    no-caps
                    outline
                    @click="get2faRecoveryCodes"
                  />
                </template>
              </div>

              <q-slide-transition>
                <div v-if="two_factor.show || two_factor.show_recovery_code">
                  <q-separator class="q-my-md" />
                  <div v-if="two_factor.show" class="q-mt-md">
                    <q-img
                      :src="two_factor.url"
                      style="width: 150px"
                      :class="{'security-image': !two_factor.showQRCode}"
                      class="cursor-pointer"
                      placeholder-src="data:image/jpeg;base64,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"
                      @click="two_factor.showQRCode = !two_factor.showQRCode"
                    />
                    <p class="text-caption text-grey-7">Click to toggle image security</p>
                    <p class="bg-dark-07 q-pa-sm rounded-borders q-mt-md text-caption">
                      Scan the image above into a MFA program (e.g. Google Authenticator), and enter the code below to
                      verify the account.
                    </p>
                    <q-input
                      v-model="two_factor.code"
                      style="max-width: 300px"
                      label="Confirm MFA Code"
                      hint="Please enter a code"
                      filled
                    />
                    <div class="flex-inline items-center q-gutter-md q-mt-sm">
                      <q-btn
                        :loading="loading.confirm2fa"
                        label="Confirm"
                        color="primary"
                        outline
                        @click="confirm2fa"
                      />
                      <q-btn
                        label="Cancel"
                        color="white"
                        outline
                        @click="two_factor.show = false"
                      />
                    </div>
                  </div>
                  <div v-if="two_factor.show_recovery_code && user?.twoFactorEnabled?.isEnabled" class="q-mt-md">
                    <q-list v-if="two_factor.recovery_codes.length"
                            class="rounded-borders relative-position"
                            style="max-width: 325px;"
                            bordered
                    >
                      <q-btn
                        icon="fa-regular fa-clipboard"
                        class="q-pa-sm absolute-top-right z-top"
                        color="primary"
                        size="sm"
                        flat
                        dense
                        @click="copyRecoveryCodes"
                      >
                        <q-tooltip class="bg-primary text-dark">Click to copy recovery code</q-tooltip>
                      </q-btn>
                      <q-item
                        v-for="(recovery_code, index) in two_factor.recovery_codes"
                        :key="index"
                        v-ripple
                        dense
                      >
                        <q-item-section>{{ recovery_code }}</q-item-section>
                      </q-item>
                    </q-list>

                    <div class="flex-inline items-center q-gutter-md q-mt-sm">
                      <q-btn
                        :loading="loading.changeRecoveryCode"
                        label="Change Recovery Code"
                        color="primary"
                        outline
                        @click="changeRecoveryCode"
                      />
                      <q-btn
                        label="Close"
                        color="white"
                        outline
                        @click="two_factor.show_recovery_code = false"
                      />
                    </div>
                  </div>
                </div>
              </q-slide-transition>
            </q-tab-panel>

            <q-tab-panel name="cache_service">
              <div v-if="user.roles.includes('super_admin')">
                <p>
                  It will clear all the cache from cache store on server. It will help when new feature/new fields added
                  in service.
                </p>
                <q-btn
                  :loading="isClearingCache"
                  label="Clear Cache"
                  color="primary"
                  outline
                  @click="clearCache"
                />
              </div>
            </q-tab-panel>

          </q-tab-panels>
        </q-card>
      </div>
    </div>
    <q-dialog v-model="saveDataResponse">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ saveDataHeader }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">{{ saveDataMessage }}</q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            label="OK"
            color="primary"
            text-color="dark"
            flat
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="verifyEmailNotice">
      <q-card v-if="user">
        <q-card-section>
          <div class="text-h6">We need to verify your email address</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div>Click VERIFY to send a verification link to {{ user.email }}</div>
          <div>Click AMEND EMAIL to close this notice and change your email address</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            v-close-popup
            label="AMEND EMAIL"
            color="primary"
            text-color="dark"
          />
          <q-btn
            label="VERIFY"
            color="primary"
            text-color="dark"
            @click="verifyEmail"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { copyToClipboard } from "quasar"
import { defineComponent, ref } from "vue"
import QRCode from "qrcode"
import { ClassCombinations } from "src/modules/StaticData.js"

export default defineComponent({
  name: "Profile",
  setup() {
    const emailRef = ref(null)
    const saveDataResponse = ref()
    const saveDataHeader = ref("")
    const saveDataMessage = ref("")
    const saveError = ref(false)

    return {
      emailRef,
      saveDataResponse,
      saveDataHeader,
      saveDataMessage,
      saveError,

      ClassCombinations
    }
  },
  data() {
    return {
      activeTab: "profile",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      current_password: "",
      new_password: "",
      confirm_new_password: "",
      showPassword: false,
      emailChanged: false,
      verifyEmailNotice: false,
      isClearingCache: false,
      loading: {
        enable2fa: false,
        disable2fa: false,
        setup2fa: false,
        confirm2fa: false,
        show2faRecoveryCode: false,
        changeRecoveryCode: false
      },
      two_factor: {
        recovery_code_splitter: 50,
        showQRCode: false,
        show_recovery_code: false,
        show: false,
        svg: null,
        url: null,
        code: null,
        recovery_code: null,
        recovery_codes: []
      }
    }
  },
  computed: {
    isValidEmail: function() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailPattern.test(this.email)
    },
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    user_name: function() {
      return [
        this.user?.first_name,
        this.user?.last_name
      ].filter(val => val).join(" ")
    },
    allowNameSave: function() {
      return !(this.first_name.trim() === "" || this.last_name.trim() === "")
    },
    allowEmailSave: function() {
      return this.isValidEmail
    },
    allowPhoneSave: function() {
      return this.phone.trim() !== ""
    },
    allowProfileSave: function() {
      if (
        this.first_name.trim() === this.user.first_name &&
        this.last_name.trim() === this.user.last_name &&
        this.email.trim() === this.user.email &&
        this.phone.trim() === this.user.phone
      ) {
        return false
      } else if (this.allowNameSave && this.allowEmailSave && this.allowPhoneSave) {
        return true
      }
      return false
    },
    allowPasswordSave: function() {
      if (
        this.current_password.trim() === "" ||
        this.new_password.trim() === "" ||
        this.confirm_new_password.trim() === ""
      ) {
        return false
      }
      return this.new_password.trim() === this.confirm_new_password.trim()
    },
    siteConfig: function() {
      return this.$store.getters["site/getFeatureEnabled"]
    }
  },
  mounted() {
    this.$store.dispatch("site/getSiteConfig")
    this.first_name = this.user.first_name
    this.last_name = this.user.last_name
    this.email = this.user.email
    this.phone = this.user.phone
    if (this.$route.query.verified) {
      this.saveDataHeader = "Email Update"
      this.saveError = false
      this.saveDataResponse = true
      this.saveDataMessage = "Email verified successfully"
    } else if (!this.user.email_verified_at) {
      this.verifyEmailNotice = true
    }
  },
  methods: {
    saveProfile: function() {
      const userData = {}
      if (
        this.first_name.trim() !== "" &&
        this.last_name.trim() !== "" &&
        this.email.trim() !== "" &&
        this.phone.trim() !== ""
      ) {
        userData.first_name = this.first_name.trim()
        userData.last_name = this.last_name.trim()
        userData.email = this.email.trim()
        userData.phone = this.phone.trim()

        if (userData.email !== this.user.email) {
          this.emailChanged = true
        }

        this.saveDetails(userData)
      }
    },
    saveDetails: function(userData) {
      this.$store.dispatch("auth/updateProfile", userData).then(() => {
        this.saveDataHeader = "Profile update"
        this.saveError = false
        this.saveDataResponse = true
        this.saveDataMessage = "Profile updated successfully"
        if (this.emailChanged) {
          this.saveDataMessage = "We now need to verify your updated email address. Please check your email and click the link we have sent you."
          this.saveDataHeader = "Profile update - further action required"
        }
      }).catch(e => {
        this.saveError = true
        this.saveDataHeader = "Profile update error"
        this.saveDataMessage = e
        this.saveDataResponse = true
      })
    },
    changePassword: function() {
      if (
        this.current_password.trim() !== "" &&
        this.new_password.trim() !== "" &&
        this.new_password.trim() === this.confirm_new_password.trim()
      ) {
        const data = {
          current_password: this.current_password.trim(),
          password: this.new_password.trim(),
          password_confirmation: this.confirm_new_password.trim()
        }
        this.$store.dispatch("auth/updatePassword", data).then(() => {
          this.saveError = false
          this.saveDataHeader = "Password update"
          this.saveDataResponse = true
          this.saveDataMessage = "Password updated successfully"
        }).catch(e => {
          this.saveError = true
          this.saveDataMessage = e
          this.saveDataResponse = true
        })
      }
    },
    verifyEmail: function() {
      this.$store.dispatch("auth/emailVerification").then(() => {
        this.saveError = false
        this.saveDataHeader = "Email verification"
        this.saveDataResponse = true
        this.saveDataMessage = "Please now check your email and click on the link we have sent you"
      }).catch(e => {
        this.saveError = true
        this.saveDataMessage = e
        this.saveDataResponse = true
      })
    },
    clearCache: function() {
      this.isClearingCache = true
      this.$store.dispatch("auth/clearCache").then(data => {
        this.$q.notify({
          type: "positive",
          textColor: "dark",
          message: data.message || "Cache cleared successfully"
        })
      }).catch(e => {
        this.$q.notify({
          type: "negative",
          message: e.message || e || "Fail to clear cache"
        })
      }).finally(() => {
        this.isClearingCache = false
      })
    },
    enable2FA: function() {
      this.loading.enable2fa = true
      this.$store.dispatch("auth/enable2fa").then(() => {
        this.$store.dispatch("auth/getUser")
      }).catch(e => {
        this.$q.notify({
          type: "negative",
          message: e.message || e || "Fail to enable 2FA"
        })
      }).finally(() => {
        this.loading.enable2fa = false
      })
    },
    disable2FA: function() {
      this.loading.disable2fa = true
      this.$store.dispatch("auth/disable2fa").then(() => {
        this.$store.dispatch("auth/getUser")
      }).catch(e => {
        this.$q.notify({
          type: "negative",
          message: e.message || e || "Fail to disable 2FA"
        })
      }).finally(() => {
        this.two_factor = { show: false, svg: null, url: null }
        this.loading.disable2fa = false
      })
    },
    get2faRecoveryCodes: function() {
      this.two_factor.show = false
      this.loading.show2faRecoveryCode = true
      this.$store.dispatch("auth/get2faRecoveryCodes").then(data => {
        this.two_factor.recovery_codes = data
        this.two_factor.show_recovery_code = true
      }).catch(e => {
        this.$q.notify({
          type: "negative",
          message: e.message || e || "Fail to get 2FA recovery codes"
        })
      }).finally(() => {
        this.loading.show2faRecoveryCode = false
      })
    },
    get2faImage: function() {
      this.two_factor.show_recovery_code = false
      this.loading.setup2fa = true
      this.$store.dispatch("auth/get2faImage").then(async (data) => {
        this.two_factor = {
          ...this.two_factor,
          url: await QRCode.toDataURL(data.url),
          show: true
        }
      }).finally(() => {
        this.loading.setup2fa = false
      })
    },
    confirm2fa: function() {
      this.loading.confirm2fa = true
      this.$store.dispatch(
        "auth/confirm2fa",
        { code: this.two_factor.code }
      ).then(data => {
        this.$q.notify({
          type: "positive",
          textColor: "dark",
          message: data.message || data || "Code verification successful"
        })
        this.$store.dispatch("auth/getUser")
        this.two_factor.show = false
      }).catch(e => {
        this.$q.notify({
          type: "negative",
          message: e.message || e || "Fail to confirm 2FA code"
        })
      }).finally(() => {
        this.loading.confirm2fa = false
      })
    },
    toggleShowPassword: function() {
      this.showPassword = !this.showPassword
    },
    copyRecoveryCodes: function() {
      copyToClipboard(this.two_factor.recovery_codes).then(() => {
        this.$q.notify({
          type: "positive",
          textColor: "dark",
          message: "Recovery code copied to clipboard"
        })
      }).catch(() => {
        this.$q.notify({
          type: "negative",
          message: "Fail to copy recovery code"
        })
      })
    },
    changeRecoveryCode: function() {
      this.loading.changeRecoveryCode = true
      this.$store.dispatch("auth/changeRecoveryCode").then(data => {
        this.$store.dispatch("auth/get2faRecoveryCodes").then(data => {
          this.two_factor.recovery_codes = data
        })
        this.$q.notify({
          type: "positive",
          textColor: "dark",
          message: data.message || data || "Code changed successful"
        })
      }).catch(e => {
        this.$q.notify({
          type: "negative",
          message: e.message || e || "Fail to change recovery code"
        })
      }).finally(() => {
        this.loading.changeRecoveryCode = false
      })
    }
  }
})
</script>

<style scoped>
.profile-button {
  min-width: 100px;
}
</style>
