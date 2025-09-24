<template>
  <div>
    <div class="q-pa-md">
      <table style="width: 100%">
        <tbody>
        <tr v-if="contract">
          <td class="infos">Contract</td>
          <td>{{ contract.reference }}</td>
        </tr>
        <tr v-if="contract">
          <td class="infos">Vendor</td>
          <td>{{ contract.vendor.name }}</td>
        </tr>
        <tr v-if="service.id">
          <td class="infos">Service</td>
          <td>{{ service.name }}</td>
        </tr>
        <tr v-if="dmodel.from && dmodel.to !== today">
          <td class="infos">Date range</td>
          <td>{{ dmodel.from }} - {{ dmodel.to }}</td>
        </tr>
        <tr v-if="localRecord.notes">
          <td class="infos">Notes</td>
          <td>{{ localRecord.notes }}</td>
        </tr>
        </tbody>
      </table>

      <q-stepper
        ref="stepper"
        v-model="step"
        vertical
        color="primary"
        animated
      >
        <q-step
          :name="1"
          title="Choose new or existing contract"
          icon="calendar_month"
          :done="step > 1"
        >
          <div class="row items-center q-col-gutter-sm">
            <new-selector-form
              v-model:option_id="selectedContract"
              classes="col-12 col-md-4"
              :options="contracts"
              is-filterable
              filter-key="reference"
              option-label="reference"
              label="Contract"
              default-class="full-width"
            />
            <q-btn
              class="col-md-2 q-ml-sm"
              label="New Contract"
              color="positive"
              size="md"
              @click="newContract"
            />
          </div>
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
          title="Choose service"
          icon="calendar_month"
          :done="step > 1"
          style="min-height: 2px;"
        >
          <div class="row items-center q-col-gutter-sm">
            <new-selector-form
              v-model:option_id="selectedService"
              classes="col-12 col-md-4"
              :options="services"
              is-filterable
              filter-key="name"
              label="Category"
              default-class="full-width"
              @valChange="selectService"
            />
            <q-btn
              class="col-md-2 q-ml-sm"
              label="New Service"
              color="positive"
              size="md"
              @click="newService"
            />
          </div>

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
          title="When should the request start and complete...?"
          icon="calendar_month"
          :done="step > 1"
          style="min-height: 2px;"
        >
          <div>For each request you create, you control the time the activity will start and end.</div>
          <q-date
            first-day-of-week="1"
            v-model="dmodel"
            range
          />
          <q-stepper-navigation>
            <q-btn
              color="primary"
              text-color="dark"
              label="Continue"
              @click="step = 4"
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
          :name="4"
          title="What capabilities...?"
          icon="assignment"
          style="min-height: 2px;"
        >
          <new-customer-requests-capability-form
            :capabilities="service.capabilities"
            :service_request_id="serviceRequestId"
            service
            class="q-mb-xl"
            @cancel="showNewCapabilityForm=false"
            @refresh="refreshRequests"
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
          title="Notations"
          caption="Optional"
          icon="add_comment"
          :done="step > 2"
          style="min-height: 2px;"
        >
          Notes may be any text or they may target a shared set of keywords.
          <div class="col-xs-12 col-sm-12 col-md-12">
            <q-input
              v-model="localRecord.notes"
              type="textarea"
              borderless
              outlined
              label="Notes"
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
              @click="step = 4"
            />
          </q-stepper-navigation>
        </q-step>

        <q-step
          :name="6"
          title="Create request"
          icon="add_comment"
          style="min-height: 200px;"
        >
          <q-btn
            label="Submit Request"
            color="positive"
            size="md"
            :disable="!allowSave"
            @click="saveRequest"
          />

          <div>
            Thank you for your request. We are happy to help you with your customer service request.
            <br>
            We will soon be able to give you a more accurate estimate of the cost and time frame.

            Thank you!
          </div>
        </q-step>

        <template #navigation>
          <q-stepper-navigation>
            <q-btn
              v-if="step !== 6"
              label="Continue"
              @click="$refs.stepper.next()"
            />
            <q-btn
              v-if="step > 1"
              flat
              color="primary"
              text-color="dark"
              label="Back"
              class="q-ml-sm"
              @click="$refs.stepper.previous()"
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

        <template #message>
          <q-banner
            v-if="step === 1"
            class="bg-blue-8 text-white q-px-lg"
          >
            Request on existing contract or new contract?
          </q-banner>
          <q-banner
            v-else-if="step === 2"
            class="bg-purple-8 text-white q-px-lg"
          >
            Choose existing service or new service
          </q-banner>
          <q-banner
            v-else-if="step === 3"
            class="bg-orange-8 text-white q-px-lg"
          >
            Select the span in days the service request will start and complete
          </q-banner>
          <q-banner
            v-else-if="step === 4"
            class="bg-cyan-8 text-white q-px-lg"
          >
            Select the capabilities for this request
          </q-banner>
          <q-banner
            v-else-if="step === 5"
            class="bg-blue-14 text-white q-px-lg"
          >
            Any notes or comments...
          </q-banner>
          <q-banner
            v-else
            class="bg-blue-8 text-white q-px-lg"
          >
            The final step is creating the request...
          </q-banner>
        </template>
      </q-stepper>
    </div>
  </div>
</template>

<script>
import { ref } from "vue"
import { DateTime } from "luxon"
import NewCustomerRequestsCapabilityForm from "components/CustomerRequestsCapabilityForm.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

export default {
  name: "CustomerRequestWizard",
  components: { NewCustomerRequestsCapabilityForm, NewSelectorForm },
  props: {
    requestRecord: { type: Object },
    contracts: { type: Array }
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
      request_date: DateTime.now().toISODate(),
      service_requester_id: null,
      service_owner_id: null,
      localRecord: {
        service_id: null,
        status: null,
        requester_id: null,
        request_date: "",
        start_date: "",
        end_date: "",
        notes: ""
      },
      showNewCapabilityForm: false,
      capabilities: [],
      selectedContract: false,
      selectedService: false
    }
  },
  computed: {
    allowSave: function() {
      return this.dmodel.from !== "" && this.dmodel.to !== ""
    },
    contract: function() {
      return this.contracts.find(obj => {
        return parseInt(obj.id) === parseInt(this.selectedContract)
      })
    },
    services: function() {
      let services = []
      if (this.contract) {
        services = this.contract.services
      }
      return services
    },
    service: function() {
      return this.$store.getters["contract/getServicesById"](this.selectedService)
    },
    cachedCustomerRequestCapabilities: function() {
      return this.$store.getters["contract/getCustomerRequestCapabilities"]
    },
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
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
    if (this.requestRecord) {
      this.localRecord.service_id = this.requestRecord.service_id
      this.localRecord.status = this.requestRecord.status
      this.localRecord.requester_id = this.requestRecord.requester_id
      this.localRecord.request_date = this.requestRecord.request_date
      this.localRecord.start_date = this.requestRecord.start_date
      this.localRecord.end_date = this.requestRecord.end_date
      this.localRecord.notes = this.requestRecord.notes
    }
    if (this.contracts.length) {
      this.selectedContract = this.contracts[0].id
    }
  },
  methods: {
    saveRequest: function() {
      const obj = {
        data: {
          contract_id: this.selectedContract,
          service_id: this.selectedService,
          start_date: this.dmodel.from,
          end_date: this.dmodel.to,
          notes: this.localRecord.notes,
          capabilities: this.cachedCustomerRequestCapabilities,
          organisation_id: this.organisation?.id
        },
        call: "customerrequests"
      }
      obj.method = "post"

      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        // call service update
        this.$emit("refresh")
        alert("Thank you, your Customer Request has been accepted!")
        this.$router.push({ path: "/customer/" + this.customer_id + "/service-requests/active" })
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
    finish: function() {
      this.saveRequest()
      this.$emit("refresh")
      this.cancel()
    }
  }
}
</script>

<style lang="scss" scoped>
table {
  border: 1px solid #1C6EAA;
  background-color: white;
  border-collapse: collapse;
  padding: 100px;
}

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
