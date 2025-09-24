<template>
  <div class="col">
    <div v-if="localData" class="row col items-center">
      <div class="col">
        <purchase-order-form
          v-model:reference="localData.reference"
          v-model:amount="localData.amount"
          v-model:start_date="localData.start_date"
          v-model:end_date="localData.end_date"
          v-model:approved="localData.approved"
          v-model:partitioned="localData.partitioned"
          v-model:milestones="milestones"
          :service="service"
          :can-breakdown-purchase-orders="canBreakdownPurchaseOrders"
          @add-milestone="addMilestone"
          @update-milestone="onUpdateMilestone"
          @milestone-deleted="onMilestoneDeleted"
        />
      </div>
      <div class="col-auto row items-center" :class="localData.partitioned ? 'self-start q-mt-sm' : ''">
        <div class="q-mx-sm">
          <q-btn
            size="sm"
            label="Save"
            :disable="!allowSave"
            color="primary"
            text-color="dark"
            @click="saveItem"
          />
          <q-btn
            size="sm"
            label="Cancel"
            color="white"
            outline
            class="q-ml-sm"
            @click="cancelEdit"
          />
        </div>
        <div v-if="showDeleteButton" class="q-mx-sm">
          <q-btn class="btn" label="Delete" color="negative" size="sm" @click="deleteItem" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PurchaseOrderForm from "src/components/PurchaseOrderForm.vue"

export default {
  name: "PurchaseOrderEditor",
  components: { PurchaseOrderForm },
  props: {
    data: { type: Object },
    service: { type: Object },
    capabilities: { type: Array, default: () => [] },
    canBreakdownPurchaseOrders: { type: Boolean, default: false }
  },
  emits: ["update", "delete", "edit", "cancel"],
  data() {
    return {
      localData: null,
      milestones: [],
      milestonesSnapshot: [],
      milestoneChanges: { add: [], update: [], delete: [] }
    }
  },
  computed: {
    showDeleteButton: function() {
      return !(this.service.delivery_model_id === 3 || this.service.delivery_model_id === 4)
    },
    poHasChanged: function() {
      return this.data.reference !== this.localData.reference ||
        parseFloat(this.data.amount) !== this.localData.amount ||
        this.data.start_date !== this.localData.start_date ||
        this.data.end_date !== this.localData.end_date ||
        this.data.approved !== this.localData.approved ||
        this.data.partitioned !== this.localData.partitioned
    },
    milestonesHaveChanged: function() {
      return !!(this.milestoneChanges.delete && this.milestoneChanges.delete.length) ||
        !!(this.milestoneChanges.update && this.milestoneChanges.update.length) ||
        !!(this.milestoneChanges.add && this.milestoneChanges.add.length)
    },
    allowSave: function() {
      return this.poHasChanged || this.milestonesHaveChanged ? this.areMilestonesValid : false
    },
    areMilestonesValid: function() {
      let valid = true
      if (Array.isArray(this.milestones) && this.milestones.length) {
        for (let index = 0; index < this.milestones.length; index++) {
          const milestone = this.milestones[index]
          if (
            milestone.reference.trim() === "" ||
            milestone.start_date === "" ||
            milestone.end_date === "" ||
            parseInt(milestone.amount) === 0
          ) {
            valid = false
          }
        }
      }
      return valid
    }
  },
  watch: {
    data: function() {
      this.setLocalData()
      this.milestoneChanges.delete = []
    },
    localData: {
      handler: function(val) {
        if (val.partitioned) {
          this.processMilestones()
        }
      },
      deep: true
    },
    milestones: {
      handler: function(val) {
        this.milestoneChanges.add = []
        this.milestoneChanges.update = []

        if (Array.isArray(val) && val.length) {
          for (let index = 0; index < val.length; index++) {
            const milestone = val[index]
            if (milestone.id === undefined) {
              this.milestoneChanges.add.push(milestone)
            } else if (this.isMilestoneChanged(milestone)) {
              this.milestoneChanges.update.push(milestone)
            }
          }
        }
      },
      deep: true
    }
  },
  mounted() {
    this.setLocalData()
    if (parseInt(this.data.partitioned)) {
      this.fetchMilestones()
    }
  },
  methods: {
    setLocalData: function() {
      this.localData = {
        id: this.data.id,
        reference: this.data.reference,
        start_date: this.data.start_date,
        end_date: this.data.end_date,
        amount: parseFloat(this.data.amount),
        approved: this.data.approved,
        partitioned: this.data.partitioned
      }
    },
    fetchMilestones: function() {
      this.$store.dispatch("contract/getPurchaseOrderMilestones", parseInt(this.data.id)).then(response => {
        this.milestones = response.data
        this.createMilestonesSnapshot()
        this.processMilestones()
      }).catch(e => {
        alert(e.data.message || e.statusText)
      })
    },
    processMilestones: function() {
      if (parseInt(this.localData.partitioned) === 1 && Array.isArray(this.milestones) && this.milestones.length < 1) {
        this.addMilestone()
      }
    },
    createMilestonesSnapshot: function() {
      this.milestonesSnapshot = JSON.parse(JSON.stringify(this.milestones))
      this.milestoneChanges.delete = []
    },
    addMilestone: function() {
      this.milestones.push({ reference: "", start_date: "", end_date: "", amount: 0 })
    },
    onUpdateMilestone: function() {
    },
    onMilestoneDeleted: function(index) {
      try {
        if (this.milestones[index].id !== undefined) {
          this.milestoneChanges.delete.push(this.milestones[index].id)
        }
        this.milestones.splice(index, 1)
        if (this.milestones.length < 1) {
          this.localData.milestoneed = 0
        }
      } catch (err) {
        console.error(err)
      }
    },
    isMilestoneChanged: function(milestone) {
      const s = this.milestonesSnapshot.find(elem => elem.id === milestone.id)
      const n = this.milestones.find(elem => elem.id === milestone.id)
      // test props against milestonesSnapshot
      return JSON.stringify(s) !== JSON.stringify(n)
    },
    cancelEdit: function() {
      this.isEditing = false
      this.setLocalData()
      this.milestones = JSON.parse(JSON.stringify(this.milestonesSnapshot))
      this.milestoneChanges.delete = []
      this.$emit("cancel")
    },
    saveItem: function() {
      if (this.allowSave) {
        if (this.milestonesHaveChanged) {
          const dataObj = { purchaseOrderID: parseInt(this.data.id), updates: this.milestoneChanges }
          this.$store.dispatch("contract/updatePurchaseOrderMilestones", dataObj).then(response => {
            let d = response.data
            if (d === undefined) {
              d = []
            }
            this.milestones = d
            this.createMilestonesSnapshot()
            this.processMilestones()
          }).catch(e => {
            alert(e.data.message || e.statusText)
          })
        }

        const d = JSON.parse(JSON.stringify(this.localData))
        delete d.milestones
        this.$emit("update", d)
        this.$emit("cancel")
      }
    },
    deleteItem: function() {
      this.$emit("delete", this.localData.id)
    }
  }
}
</script>

<style lang="scss" scoped>
input {
  outline: 2px solid $primary;
  border: 0 none;
  padding: 2px 6px;
  width: 100%;
}

.inline-label {
  padding: 2px 6px;
}

.btn {
  width: 65px;
}
</style>
