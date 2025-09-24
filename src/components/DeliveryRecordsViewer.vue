<template>
  <q-card style="width: 1200px; max-width: 94%">
    <q-card-section>
      <div class="text-h6">Delivery Records for {{ consultant_name }}</div>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-list bordered separator>
        <q-item v-for="record in delivery_records" :key="record.id" class="q-py-lg">
          <q-item-section>
            <div class="row justify-between">
              <div class="col-auto">
                <span class="text-bold">Week {{ record.week }}</span>
                <span class="q-ml-sm">({{ construct_dates(record) }})</span>
              </div>
              <div class="col-auto row items-center q-py-xs">
                <q-badge align="top"
                         class="status_badge text-weight-bold q-py-xs"
                         outline
                         :color="getSubmitted(record).color"
                         :text-color="getSubmitted(record).textColor">
                  <div>{{ getSubmitted(record).label }}</div>
                  <q-icon
                    v-if="getSubmitted(record).label === 'Submitted'"
                    name="edit"
                    class="q-ml-sm cursor-pointer"
                    @click="showUnsubmitRecordDialog(record)"
                  >
                    <q-tooltip
                      class="bg-amber text-dark text-body2 shadow-4"
                      anchor="top middle"
                      self="bottom middle"
                      :offset="[10, 10]"
                    >
                      <q-icon name="warning" />
                      Unsubmit this record
                    </q-tooltip>
                  </q-icon>
                </q-badge>
                <q-badge
                  v-if="getSubmitted(record).label === 'Submitted'"
                  align="top"
                  class="status_badge text-weight-bold q-py-xs q-ml-md"
                  :color="getStatus(record).color"
                  :label="getStatus(record).label"
                  text-color="dark"
                />
              </div>
            </div>
            <div v-if="record.fallow_week_id">Fallow week: {{ fallowWeekReason(record.fallow_week_id) }}</div>
            <delivery-records-outputs-table v-else :outputs="record.outputs" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        v-close-popup
        label="OK"
        class="q-mr-lg"
        color="primary"
        text-color="dark"
      />
    </q-card-actions>
  </q-card>

  <q-dialog v-model="showUnsubmitDialogue">
    <q-card style="width: 800px; max-width: 90%">
      <div v-if="showUnsubmitMessage">
        <q-card-section v-html="unsubmitResponseMessage" />
        <q-card-actions align="right">
          <q-btn
            label="Close"
            color="primary"
            text-color="dark"
            @click="closeMessageDialogue"
          />
        </q-card-actions>
      </div>
      <div v-else>
        <q-card-section>
          <div class="text-h6 text-bold text-negative row items-center">
            <q-icon name="warning" class="q-mr-md" />
            <span>Please Confirm</span>
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-bold q-mb-md">
            You are about to unsubmit {{ consultant_name }}'s delivery record for week {{ selectedUnsubmitRecord.week }}
          </div>
          <div>
            You should only do this if there is an error in the delivery record that needs to be corrected. By setting
            the record to unsubmitted, {{ consultant_name }} will be able to correct the record and then resubmit it.
            {{ consultant_name }} will receive an email notification that this record can now be edited.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            @click="showUnsubmitDialogue = false"
            color="white"
            outline
          >
            Cancel
          </q-btn>
          <q-btn
            @click="unsubmitRecord"
            color="primary"
            text-color="dark"
            :loading="showUnsubmitDataCallLoader"
          >
            Proceed
          </q-btn>
        </q-card-actions>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { date } from "quasar"
import { ref } from "vue"
import { DateTime } from "luxon"
import { Config } from "src/modules/StaticData.js"
import { DateMethods } from "src/modules/GlobalMethods.js"
import DeliveryRecordsOutputsTable from "components/DeliveryRecordsOutputsTable.vue"

export default {
  name: "DeliveryRecordsViewer",
  components: { DeliveryRecordsOutputsTable },
  props: {
    engagement: { type: Object, default: () => ({}) },
    startDate: { type: String },
    endDate: { type: String },
    vendorId: { type: String }
  },
  emits: ["refresh"],
  setup() {
    const input = ref(null)

    return {
      input
    }
  },
  data() {
    return {
      showUnsubmitDialogue: false,
      showUnsubmitMessage: false,
      unsubmitResponseMessage: "",
      selectedUnsubmitRecord: false,
      showUnsubmitDataCallLoader: false
    }
  },
  computed: {
    delivery_records: function() {
      const records = []
      if (this.engagement && this.engagement.delivery_records && this.engagement.delivery_records.length) {
        // filter according to the given dates
        for (let index = 0; index < this.engagement.delivery_records.length; index++) {
          const r = JSON.parse(JSON.stringify(this.engagement.delivery_records[index]))
          let r_start_date = new Date(DateMethods.convertDateFormat(r.start_date)).getTime()
          let start_date = new Date(DateMethods.convertDateFormat(this.startDate)).getTime()
          let r_end_date = new Date(DateMethods.convertDateFormat(r.end_date)).getTime()
          let end_date = new Date(DateMethods.convertDateFormat(this.endDate)).getTime()

          if (r_start_date >= start_date && r_end_date <= end_date) {
            // assign the project name as a string
            const projects = this.engagement.projects
            for (let j = 0; j < r.outputs.length; j++) {
              const output = r.outputs[j]
              const project = projects.find(element => element.id === output.project_id)
              if (project && project.name) {
                output.project = project.name
              }
            }
            records.push(r)
          }
        }
      }
      //now order them in decending order
      records.sort((a, b) => {
        let a_start_date = DateTime.fromISO(DateMethods.convertDateFormat(a.start_date, "/", "-"))
        let b_start_date = DateTime.fromISO(DateMethods.convertDateFormat(b.start_date, "/", "-"))

        if (a_start_date < b_start_date) {
          return 1
        } else if (a_start_date > b_start_date) {
          return -1
        }
        return 0
      })
      return records
    },
    consultant_name: function() {
      if (this.engagement && this.engagement.consultant && this.engagement.consultant.user) {
        return this.engagement.consultant.user.first_name + " " + this.engagement.consultant.user.last_name
      }
      return ""
    }
  },
  methods: {
    construct_dates: function(record) {
      return [
        date.formatDate(DateMethods.convertDateFormat(record.start_date), Config.DATE_FORMAT_DMY),
        date.formatDate(DateMethods.convertDateFormat(record.end_date), Config.DATE_FORMAT_DMY)
      ].filter(val => val).join(" - ") ?? "-"
    },
    getStatus: function(record) {
      let color = "swlvd-green"
      let label = "Pending report"
      if (record.status === "accepted") {
        label = "Reported"
      } else if (record.status === "approved") {
        label = "Client Approved"
      }
      return { color: color, label: label }
    },
    getSubmitted: function(record) {
      let color = "negative"
      let label = "Not Submitted"
      let textColor = "white"
      if (parseInt(record.submitted) === 1) {
        color = "primary"
        label = "Submitted"
        textColor = "dark"
      }
      return { color, label, textColor }
    },
    getPatchResponseMessage: function() {
      return (
        "Delivery record for week " +
        this.selectedUnsubmitRecord.week +
        " set to \"unsubmitted\".<br>" +
        this.consultant_name +
        " will now be able to edit the record"
      )
    },
    fallowWeekReason: function(id) {
      const reasons = { 1: "Unwell", 2: "Leave" }
      return reasons[id]
    },
    showUnsubmitRecordDialog: function(record) {
      this.selectedUnsubmitRecord = record
      this.showUnsubmitDialogue = true
    },
    closeMessageDialogue: function() {
      this.showUnsubmitDialogue = false
      this.showUnsubmitMessage = false
      this.$emit("refresh")
    },
    unsubmitRecord: function() {
      this.showUnsubmitDataCallLoader = true
      this.$store.dispatch(
        "vendor/unsubmitDeliveryRecord",
        { vendorId: this.vendorId, deliveryRecordId: this.selectedUnsubmitRecord.id }
      ).then(() => {
        this.unsubmitResponseMessage = this.getPatchResponseMessage()
        this.showUnsubmitMessage = true
        this.showUnsubmitDataCallLoader = false
      }).catch(e => {
        console.log("error patching record: " + e)
        this.unsubmitResponseMessage = "Sorry, there was an error updating this record. Please contact support"
        this.showUnsubmitDataCallLoader = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.accepted {
  background-color: $positive;
}

.status_badge {
  font-size: 1rem;
}
</style>
