<template>
  <q-stepper
    ref="stepper"
    v-model="step"
    color="primary"
    animated
  >
    <q-step
      :name="1"
      title="Select a request"
      icon="calendar_month"
      :done="step > 1"
      style="min-height: 200px;"
    >
      <q-table
        flat
        :grid="$q.screen.xs"
        selection="none"
        :rows="rows"
        :columns="columns"
        row-key="id"
        :pagination="initialPagination"
        hide-pagination
        class="bordered"
        table-header-class="text-weight-bolder text-primary"
        color="primary"
      >
        <template #body-cell-action="props">
          <q-td :props="props">
            <div>
              <q-btn
                color="primary"
                label="VIEW"
                size="sm"
                icon="edit"
                outline
                @click="editRequest(props.row)"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </q-step>

    <q-step
      :name="2"
      title="Modify capabilities...?"
      icon="assignment"
      style="min-height: 200px;"
    >
      <q-card style="width: 800px">
        <q-card-section>
          <div>
            <q-table
              v-model:pagination="pagination"
              :rows="capabilityRows"
              :columns="capabilityColumns"
              :entity="entityName"
              row-key="name"
              :loading="loading"
              table-class="alternate-color"
              :full-width="true"
              table-header-class="text-weight-bolder text-primary"
              color="primary"
            >
              <template #loading>
                <q-inner-loading showing color="primary" />
              </template>
              <template #body-cell-action="props">
                <q-td :props="props">
                  <div>
                    <q-btn
                      color="green"
                      label="VIEW / EDIT"
                      size="sm"
                      icon="edit"
                      @click="editCapability(props.row)"
                    />
                    <q-btn
                      color="red"
                      label="DELETE"
                      size="sm"
                      icon="remove"
                      style="margin-left: 10px"
                      @click="deleteCapability(props.row)"
                    />
                  </div>
                </q-td>
              </template>
            </q-table>
          </div>
          <new-customer-requests-capability-form
            v-show="showNewCapabilityForm"
            :capabilities="capabilities"
            :customer_request_id="customerRequestId"
            service
            class="q-mb-xl"
            @cancel="showNewCapabilityForm=false"
            @refresh="refreshRequests"
          />
        </q-card-section>
        <q-btn
          v-if="!showNewCapabilityForm"
          label="Create New Capability"
          style="margin-left: 10px"
          class="q-mt-md"
          color="primary"
          text-color="dark"
          size="sm"
          @click="createNewCapability"
        />
        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            label="Cancel"
            color="cancel"
          />
          <q-btn
            v-close-popup
            flat
            label="Save"
            color="green"
          />
        </q-card-actions>
      </q-card>
    </q-step>

    <q-step
      :name="3"
      title="Notations"
      caption="Optional"
      icon="add_comment"
      :done="step > 2"
      style="min-height: 200px;"
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
    </q-step>

    <q-step
      :name="4"
      title="Modify request"
      icon="add_comment"
      style="min-height: 200px;"
    >
      Thank you for your interest in our company. We would be more than happy to help you with your customer request.

      We will soon be able to give you a more accurate estimate of the cost and time frame.

      Thank you!
    </q-step>

    <template #navigation>
      <q-stepper-navigation>
        <q-btn
          v-if="step !== 4"
          label="Continue"
          @click="$refs.stepper.next()"
        />
        <q-btn
          v-else
          label="Finish"
          @click="finish()"
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
        class="bg-purple-8 text-white q-px-lg"
      >
        Select a request...
      </q-banner>
      <q-banner
        v-else-if="step === 2"
        class="bg-orange-8 text-white q-px-lg"
      >
        Select the capabilities...
      </q-banner>
      <q-banner
        v-else-if="step === 3"
        class="bg-green-8 text-white q-px-lg"
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

  <q-dialog
    v-model="show_dialog"
    :full-width="true"
  >
    <q-card style="width: 1200px">
      <q-btn
        v-if="!showNewCapabilityForm"
        label="Create New Capability"
        style="margin-left: 10px"
        class="q-mt-md"
        color="primary"
        text-color="dark"
        size="sm"
        @click="createNewCapability"
      />
      <q-card-actions align="right">
        <q-btn
          v-close-popup
          flat
          label="Cancel"
          color="cancel"
        />
        <q-btn
          v-close-popup
          flat
          label="Save"
          color="green"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { date } from "quasar"
import { defineComponent, ref } from "vue"
import { Config } from "src/modules/StaticData.js"
import NewCustomerRequestsCapabilityForm from "components/CustomerRequestsCapabilityForm.vue"

export default defineComponent({
  name: "CustomerRequestsTable",
  components: { NewCustomerRequestsCapabilityForm },
  props: ["requests", "capabilities", "competencies"],
  emits: ["cancel", "refresh", "select"],
  setup() {
    const selectedRecords = ref([])
    const columns = ref([
      {
        name: "request_date",
        label: "Request Date",
        field: "request_date",
        align: "center",
        format: val => date.formatDate(val, Config.DATE_FORMAT_DMY)
      },
      { name: "requester", label: "Requester", field: "requester", align: "left" },
      { name: "start_date", label: "Start Date", field: "start_date", align: "center" },
      { name: "end_date", label: "End Date", field: "end_date", align: "center" },
      { name: "notes", label: "Notes", field: "notes", align: "left" },
      { name: "status", label: "Status", field: "status", align: "left" },
      { name: "action", label: "Actions", field: "action", align: "center" }
    ])
    const capabilityColumns = ref([
      { name: "capability", label: "Capability", field: "capability", align: "left" },
      { name: "competency", label: "Competency", field: "competency", align: "left" },
      { name: "budget_per_unit", label: "Budget", field: "budget_per_unit", align: "right" },
      { name: "notes", label: "Notes", field: "notes", align: "left" },
      { name: "action", label: "Actions", field: "action", align: "center" }
    ])
    const statusText = ref(["Submitted", "Approved", "Rejected", "Default"])
    const step = ref(1)

    const requestIndex = 0
    const capabilityRows = []

    return {
      selectedRecords,
      columns,
      capabilityColumns,
      statusText,
      initialPagination: {
        rowsPerPage: 0
      },
      step,

      capabilityRows,
      requestIndex
    }
  },
  data() {
    return {
      show_dialog: false,
      showNewRequestForm: false,
      showNewCapabilityForm: false,
      customerRequestId: 0
    }
  },
  computed: {
    rows: function() {
      const r = []
      if (this.requests.length) {
        for (let index = 0; index < this.requests.length; index++) {
          const request = this.requests[index]
          const item = {
            id: request.id,
            index: index,
            status: this.statusText[request.status],
            request_date: request.request_date,
            requester: request.requester.fullName,
            start_date: request.start_date,
            end_date: request.end_date,
            notes: request.notes,
            numCapabilities: request.capabilities.length,
            action: this.buildEditLink(request)
          }

          r.push(item)
        }
      }
      return r
    }
  },
  methods: {
    buildEditLink: function(record) {
      return this.$route.path + "/" + record.id
    },
    editRequest: function(item) {
      this.requestIndex = item.index
      this.customerRequestId = item.id
      this.calculateCapabilityRows()
      // this.show_dialog = true
      // const link = this.buildEditLink(item.id)
      // this.$router.push({ path: item.action })
      // this.$emit('select')
      this.step = 2
    },
    deleteRequest: function(item) {
      const obj = {
        call: "customerrequests" + "/" + item.id,
        method: "delete"
      }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        // call service update
        this.$emit("refresh")
        // this.cancel()
      }).catch(e => {
        alert(e.data.message || e.statusText)
      })
    },
    calculateCapabilityRows: function() {
      const r = []

      const capabilities = this.requests[this.requestIndex].capabilities
      for (let index = 0; index < capabilities.length; index++) {
        const capability = capabilities[index]
        const item = {
          id: capability.id,
          index: index,
          capability: capability.capability.name,
          competency: capability.competency.name,
          budget: capability.budget,
          notes: capability.notes,
          action: this.buildEditLink(capability)
        }

        r.push(item)
      }
      this.capabilityRows = r
    },
    editCapability: function(item) {
      this.requestIndex = item.index
      this.calculateCapabilityRows()
      this.show_dialog = true
    },
    createNewCapability: function() {
      this.showNewCapabilityForm = true
    },
    refreshRequests: function() {
      this.$emit("refresh")
    }
  }
})
</script>

<style>
.bordered {
  border: 1px solid rgba(0, 0, 0, 0.24);
}

.bordered tr.selected {
  background-color: rgba(76, 175, 80, 0.04);
}

.bordered .q-table th {
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
