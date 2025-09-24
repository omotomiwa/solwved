<template>
  <div>
    <div>
      <q-stepper
        ref="stepper"
        v-model="step"
        vertical
        color="primary"
        animated
        flat
      >
        <q-step
          :name="1"
          :title="contractSelectionTitle"
          icon="calendar_month"
          :done="step > 1"
        >
          <new-selector-form
            v-model:option_id="selectedContract"
            classes="row items-center q-col-gutter-sm"
            :options="contracts"
            is-filterable
            filter-key="reference"
            option-label="reference"
            label="Contract"
            default-class="col-12 col-md-4"
          />
          <q-stepper-navigation>
            <q-btn
              color="primary"
              text-color="dark"
              label="Continue"
              @click="step = 2"
            />
          </q-stepper-navigation>
        </q-step>
        <q-step
          :name="2"
          :title="serviceSelectionTitle"
          icon="calendar_month"
          :done="step > 2"
          style="min-height: 2px;"
        >
          <new-selector-form
            v-model:option_id="selectedService"
            classes="row items-center q-col-gutter-sm"
            :options="services"
            is-filterable
            filter-key="name"
            label="Service"
            default-class="col-12 col-md-4"
            @valChange="selectService"
          />
          <q-stepper-navigation>
            <q-btn
              color="primary"
              text-color="dark"
              label="Continue"
              @click="step = 3"
            />
            <q-btn
              flat
              color="primary"
              text-color="dark"
              label="Back"
              class="q-ml-sm"
              @click="step = 1"
            />
          </q-stepper-navigation>
        </q-step>
        <q-step
          :name="3"
          :done="step > 3"
          :title="requestSelectionTitle"
          icon="assignment"
          style="min-height: 2px;"
        >
          <new-selector-form
            v-model:option_id="selectedRequest"
            classes="row items-center q-col-gutter-sm"
            :options="requests"
            is-filterable
            filter-key="value"
            option-label="value"
            label="Request"
            default-class="col-12 col-md-4"
            @valChange="selectService"
          />
          <q-stepper-navigation>
            <q-btn
              color="primary"
              text-color="dark"
              label="Continue"
              @click="onRequestStepComplete"
            />
            <q-btn
              flat
              color="primary"
              text-color="dark"
              label="Back"
              class="q-ml-sm"
              @click="step = 2"
            />
          </q-stepper-navigation>
        </q-step>
        <q-step
          v-if="service && selectedRequestRecord"
          :name="4"
          :done="step > 4"
          :title="engagementSelectionTitle"
          icon="assignment"
          style="min-height: 2px;"
        >
          <new-selector-form
            v-model:option_id="selectedEngagement"
            :options="engagements"
            classes="row items-center q-col-gutter-sm"
            is-filterable
            filter-key="value"
            option-label="value"
            label="Engagement"
            default-class="col-12 col-md-4"
          />
          <q-stepper-navigation>
            <q-btn
              color="primary"
              text-color="dark"
              label="Continue"
              @click="step = 5"
            />
            <q-btn
              flat
              color="primary"
              text-color="dark"
              label="Back"
              class="q-ml-sm"
              @click="step = 3"
            />
          </q-stepper-navigation>
        </q-step>
        <q-step
          :name="5"
          title="Alert description"
          caption="Optional"
          icon="add_comment"
          :done="step > 5"
          style="min-height: 2px;"
        >
          <div class="col-xs-12 col-sm-12 col-md-12">
            <q-input
              v-model="localRecord.notes"
              type="textarea"
              borderless
              outlined
              label="Alert Description"
              label-color="white"
            />
          </div>
          <q-stepper-navigation>
            <q-btn
              color="primary"
              text-color="dark"
              label="Continue"
              @click="step = 6"
            />
            <q-btn
              flat
              color="primary"
              text-color="dark"
              label="Back"
              class="q-ml-sm"
              @click="onDescriptionStepBack"
            />
          </q-stepper-navigation>
        </q-step>
        <q-step
          :name="6"
          title="Create alert"
          icon="add_comment"
          style="min-height: 200px;"
        >
          <q-btn
            label="Submit Alert"
            color="positive"
            size="md"
            :disable="!allowSave"
            @click="saveAlert"
          />
        </q-step>

        <template #navigation>
          <q-stepper-navigation>
            <q-btn
              v-if="step !== 6"
              label="Continue"
              @click="$refs.stepper.next()"
            />
            <q-btn
              class="q-ml-sm"
              label="Cancel"
              color="grey"
              size="md"
              @click="cancel"
            />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </div>
  </div>
</template>

<script>
import { ref } from "vue"
import { DateTime } from "luxon"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import NewSelectorForm from "components/NewSelectorForm.vue"

export default {
  name: "ServiceAlertWizard",
  components: {
    NewSelectorForm
  },
  props: {
    alertRecord: { type: Object },
    contracts: { type: Array },
    vendor_id: { type: String, default: null },
    customer_id: { type: String, default: null }
  },
  emits: ["cancel", "refresh"],
  setup() {
    const input = ref(null)
    const today = DateTime.now().toISODate()

    return {
      input,

      today,
      step: ref(1),
      dmodel: ref({ from: today, to: today })
    }
  },
  data() {
    return {
      alert_date: DateTime.now().toISODate(),
      service_alerter_id: null,
      service_owner_id: null,
      localRecord: {
        service_id: null,
        status: null,
        alerter_id: null,
        alert_date: "",
        start_date: "",
        end_date: "",
        notes: ""
      },
      showNewCapabilityForm: false,
      selectedContract: false,
      selectedService: false,
      selectedRequest: null,
      selectedEngagement: null
    }
  },
  computed: {
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    isBuiltEnvironment: function() {
      return this.$store.getters["admin/getIsBuiltEnvironment"]
    },
    allowSave: function() {
      return this.dmodel.from !== "" && this.dmodel.to !== ""
    },
    contract: function() {
      return this.contracts.find(obj => {
        return parseInt(obj.id) === parseInt(this.selectedContract)
      })
    },
    services: function() {
      return this.contract ? this.contract.services : []
    },
    service: function() {
      return this.$store.getters["contract/getServicesById"](this.selectedService)
    },
    requests: function() {
      const r = [{ id: null, value: "No specific request" }]
      this.service.requests.forEach(function(f) {
        r.push({ id: f.id, value: f.request_date })
      })
      return r
    },
    selectedRequestRecord: function() {
      let r
      if (this.service && this.service.requests) {
        r = this.service.requests.find(obj => {
          return parseInt(obj.id) === parseInt(this.selectedRequest)
        })
      }
      return r
    },
    selectedEngagementRecord: function() {
      let e
      if (this.selectedRequestRecord && this.selectedRequestRecord?.consultant_engagements) {
        e = this.selectedRequestRecord.consultant_engagements.find(obj => {
          return parseInt(obj.id) === parseInt(this.selectedEngagement)
        })
      }
      return e
    },
    engagements: function() {
      const e = []
      (this.selectedRequestRecord?.consultant_engagements ?? []).forEach(function(f) {
        e.push({
          id: f.id,
          value: (
            OrganisationTypeMethods.changeConsultant(this.isBuiltEnvironment) +
            ": " +
            f.consultant.user.fullName +
            " " +
            "Charge Rate: " +
            f.charge_rate
          )
        })
      })
      return e
    },
    contractSelectionTitle: function() {
      return this.step > 1 ? "Contract: " + this.contract.reference : "Which Contract does this alert apply to?"
    },
    serviceSelectionTitle: function() {
      return this.step > 2 ? "Service: " + this.service.name : "Which Service does this alert apply to?"
    },
    requestSelectionTitle: function() {
      if (this.step > 3) {
        if (this.selectedRequestRecord && this.selectedRequestRecord.request_date) {
          return "Request: " + this.selectedRequestRecord.request_date
        }
        return "Request: No specific request"
      } else {
        return "Does this alert apply to a specific request?"
      }
    },
    engagementSelectionTitle: function() {
      if (this.step > 5) {
        if (this.selectedEngagementRecord) {
          return "Request: " + this.selectedRequestRecord.request_date
        }
        return "Engagement: No specific engagement"
      } else {
        return "Does this alert apply to a specific engagement?"
      }
    }
  },
  watch: {
    service_id: function() {
      this.getService()
    },
    contracts: function(newVal) {
      this.selectedContract = newVal.id
    },
    services: function(newVal) {
      this.selectedService = newVal.id
    },
    service_name_id: function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.service_line_id = null
      }
    }
  },
  mounted() {
    if (this.alertRecord) {
      this.localRecord.service_id = this.alertRecord.service_id
      this.localRecord.status = this.alertRecord.status
      this.localRecord.alerter_id = this.alertRecord.alerter_id
      this.localRecord.alert_date = this.alertRecord.alert_date
      this.localRecord.start_date = this.alertRecord.start_date
      this.localRecord.end_date = this.alertRecord.end_date
      this.localRecord.notes = this.alertRecord.notes
    }
    if (this.contracts.length) {
      this.selectedContract = this.contracts[0].id
    }
  },
  methods: {
    saveAlert: function() {
      const obj = {
        data: {
          service_id: this.selectedService,
          request_id: this.selectedRequest,
          engagement_id: this.selectedEngagement,
          description: this.localRecord.notes,
          organisation_id: this.organisation?.id
        },
        call: "servicealerts",
        method: "post"
      }

      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        this.$emit("refresh")
        // alert('Thank you, your Customer Alert has been accepted!')
        if (this.customer_id) {
          this.$router.push({ path: "/customer/" + this.customer_id + "/service-alerts" })
        } else {
          this.$router.push({ path: "/vendor/" + this.vendor_id + "/service-alerts" })
        }
      }).catch(e => {
        alert(e.data.message || e.statusText)
      })
    },
    getService: function() {
      if (this.selectedService) {
        this.$store.dispatch(
          "contract/service",
          { method: "get", id: this.selectedService }
        )
      }
    },
    cancel: function() {
      this.$emit("cancel")
    },
    selectService: function() {
      // get the service from the DB
      this.getService()
    },
    onRequestStepComplete: function() {
      this.step = this.selectedRequest === null ? 5 : 4
    },
    onDescriptionStepBack: function() {
      this.step = this.selectedRequest === null ? 3 : 4
    },
    finish: function() {
      this.saveAlert()
      this.$emit("refresh")
      this.cancel()
    }
  }
}
</script>

<style lang="scss" scoped>
.infos {
  padding: 2px;
  background: rgb(2, 0, 36);
  background: linear-gradient(270deg, rgba(2, 0, 36, 1) 0%, rgba(9, 121, 86, 0.14936396922050066) 0%, rgba(0, 212, 255, 1) 100%);
}

.infosdata {
  padding-left: 10px
}

.alternate-color .q-item {
  background-color: rgba(54, 76, 102, 0.2);
}

.alternate-color .q-item:nth-of-type(2n) {
  background-color: rgba(54, 76, 102, 0.1);
}
</style>
