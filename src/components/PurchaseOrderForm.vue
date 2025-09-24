<template>
  <div class="col-grow">
    <div class="row q-col-gutter-xs">
      <q-input
        label="PO Reference"
        :model-value="reference"
        class="col-12 col-sm-6 col-md-4 col-lg-2"
        dense
        outlined
        stack-label
        label-color="white"
        color="primary"
        type="text"
        autofocus
        @update:model-value="value => $emit('update:reference', value)"
      />
      <currency-input
        class="col-12 col-sm-6 col-md-4 col-lg-2"
        :model-value="amount"
        label="Value"
        :prefix="currency_symbol"
        dense
        @update:model-value="value => $emit('update:amount', value)"
      />
      <q-input
        class="col-12 col-sm-6 col-md-4 col-lg-2"
        v-model="startDate"
        dense
        outlined
        type="text"
        label="Start Date"
        :mask="Config.DATE_MASK"
        hide-bottom-space
        stack-label
        :rules="[checkDate]"
        @update:model-value="() => $emit('update:start_date', startDate)"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
              ref="startDatePopup"
            >
              <q-date
                first-day-of-week="1"
                v-model="startDate"
                text-color="dark"
                :mask="Config.DATE_FORMAT_DMY"
                today-btn
                no-unset
                @update:model-value="emitAndUpdateStartDate"
              >
                <div class="row items-center justify-end">
                  <q-btn
                    v-close-popup
                    label="Close"
                    color="primary"
                    text-color="dark"
                    flat
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-input
        class="col-xs-6 col-sm-6 col-md-4 col-lg-2"
        v-model="endDate"
        dense
        outlined
        type="text"
        label="End Date"
        :mask="Config.DATE_MASK"
        hide-bottom-space
        stack-label
        :rules="[checkDate]"
        @update:model-value="() => $emit('update:end_date', endDate)"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
              ref="endDatePopup"
            >
              <q-date
                first-day-of-week="1"
                v-model="endDate"
                text-color="dark"
                :mask="Config.DATE_FORMAT_DMY"
                today-btn
                no-unset
                @update:model-value="emitAndUpdateEndDate"
              >
                <div class="row items-center justify-end">
                  <q-btn
                    v-close-popup
                    label="Close"
                    color="primary"
                    text-color="dark"
                    flat
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-toggle
        :model-value="approved"
        checked-icon="check"
        color="green"
        unchecked-icon="clear"
        label="Approved"
        :false-value="0"
        :true-value="1"
        class="col-12 col-sm-6 col-md-4 col-lg-2"
        @update:model-value="value => $emit('update:approved', value)"
      />
      <q-toggle
        v-if="canBreakdownPurchaseOrders"
        :model-value="partitioned"
        checked-icon="list"
        color="primary"
        icon-color="dark"
        unchecked-icon="clear"
        label="Milestones"
        :false-value="0"
        :true-value="1"
        class="col-12 col-sm-6 col-md-4 col-lg-2"
        :disable="disableMilestoneToggle"
        @update:model-value="value => $emit('update:partitioned', value)"
      >
        <q-tooltip
          v-if="disableMilestoneToggle"
          anchor="top middle"
          self="bottom right"
          :delay="500"
          class="bg-grey2 row items-center"
        >
          <q-icon name="info" size="sm" class="q-mr-sm" />
          <span>
          To revert to a simple PO please first remove all the milestones
        </span>
        </q-tooltip>
      </q-toggle>
    </div>
  </div>
  <div v-if="partitioned && milestones.length" class="q-pt-md q-pl-md">
    <purchase-order-milestone-form
      v-for="(milestone, index) in milestones"
      :key="index"
      :model-value="milestone"
      class="q-mb-xs"
      @update:model-value="value => $emit('updateMilestone', value)"
      @delete="deleteMilestone(index)"
    />
    <div class="q-mb-md q-mt-md text-weight-bold row" :class="messageColour">
      <span>
        Milestones sub total: {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, milestonesSubTotal) }} |&nbsp;
      </span>
      <span v-if="remainingPoBudget >= 0" :class="remainingPoBudget > 0 ? 'text-positive' : ''">
        Remaining PO budget to allocate {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, remainingPoBudget)
        }}
      </span>
      <span v-else>
        Milestones are {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, -remainingPoBudget) }} over budget
      </span>
    </div>
    <q-btn
      class="q-px-md q-mt-xs"
      label="Add Milestone"
      dense
      color="primary"
      outline
      size="md"
      @click="addNewMilestone"
    />
  </div>
</template>

<script>
import { nextTick, ref } from "vue"
import { CurrencyMethods, DateMethods } from "src/modules/GlobalMethods.js"
import { Config, RulesRegex } from "src/modules/StaticData.js"
import PurchaseOrderMilestoneForm from "src/components/PurchaseOrderMilestoneForm.vue"
import CurrencyInput from "src/components/CurrencyInput.vue"

export default {
  name: "PurchaseOrderForm",
  components: { CurrencyInput, PurchaseOrderMilestoneForm },
  props: {
    badge: { type: String, default: "customer" },
    reference: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    start_date: { type: String, default: null },
    end_date: { type: String, default: null },
    approved: { type: Number, default: 0 },
    partitioned: { type: Number, default: 0 },
    milestones: { type: Array, default: () => [] },
    service: { type: Object, default: () => ({}) },
    canBreakdownPurchaseOrders: { type: Boolean, default: false }
  },
  emits: [
    "update:reference",
    "update:amount",
    "update:start_date",
    "update:end_date",
    "update:approved",
    "update:partitioned",
    "addMilestone",
    "updateMilestone",
    "milestoneDeleted"
  ],
  setup(_, { emit }) {
    const input = ref(null)

    const startDate = ref(null)
    const endDate = ref(null)

    const startDatePopup = ref(null)
    const endDatePopup = ref(null)

    function emitAndUpdateStartDate() {
      nextTick(() => {
        if (startDatePopup.value) startDatePopup.value.hide()
        emit("update:start_date", startDate.value)
      })
    }

    function emitAndUpdateEndDate() {
      nextTick(() => {
        if (endDatePopup.value) endDatePopup.value.hide()
        emit("update:end_date", endDate.value)
      })
    }

    return {
      input,
      startDate,
      endDate,
      startDatePopup,
      endDatePopup,

      emitAndUpdateStartDate,
      emitAndUpdateEndDate,

      CurrencyMethods,
      Config
    }
  },
  mounted() {
    this.startDate = this.start_date ?? null
    this.endDate = this.end_date ?? null
  },
  computed: {
    disableMilestoneToggle: function() {
      return this.milestones.length > 0
    },
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    currency_symbol: function() {
      return this.organisation?.currency?.symbol ?? Config.CURRENCY_SYMBOL
    },
    milestonesSubTotal: function() {
      let b = 0
      if (this.milestones.length) {
        this.milestones.forEach(milestone => {
          b += Number(milestone.amount)
        })
      }
      return b
    },
    remainingPoBudget: function() {
      return this.amount - this.milestonesSubTotal
    },
    messageColour: function() {
      return this.remainingPoBudget < 0 ? "text-negative" : ""
    }
  },
  methods: {
    addNewMilestone: function() {
      this.$emit("addMilestone")
    },
    deleteMilestone: function(index) {
      this.$emit("milestoneDeleted", index)
    },
    checkDate: function(val) {
      if ((val ?? "").trim().length > 0 && !RulesRegex.date.test(DateMethods.convertDateFormat(val))) {
        return "Please enter the valid date"
      }
      return true
    }
  }
}
</script>
