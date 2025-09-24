<template>
  <div :class="containerClass">
    <q-list v-if="data && data.length && propertyType === 'simple'" bordered separator>
      <q-item v-for="item in data" :key="item.id">
        <item-editor
          :data="item"
          :label-property="labelProperty"
          :allow-edit-label="allowEditLabel"
          :item-delete-label="itemDeleteLabel"
          @update="updateItem"
          @delete="deleteItem"
        />
      </q-item>
    </q-list>
    <q-list v-if="data && data.length && propertyType === 'with_children'" bordered separator>
      <q-item v-for="item in data" :key="item.id">
        <item-editor-with-child
          :data="item"
          :child-property="childProperty"
          :child-type="childType"
          :child-label="childLabel"
          :child-options="childOptions"
          :new-item-label="newChildItemLabel"
          :new-item-parent-property="newItemParentProperty"
          :new-item-parent-property-value="item.id"
          :child-data-call="childDataCall"
          :service-id="serviceId"
          :has-multiple-selector="hasMultipleSelector"
          @update="updateItem"
          @delete="deleteItem"
          @service-update="$emit('serviceUpdate')"
        />
      </q-item>
    </q-list>
    <div v-if="data && data.length && propertyType === 'purchase_order'">
      <purchase-order-table
        :purchase-orders="data"
        :service="service"
        :capabilities="capabilities"
        :can-breakdown-purchase-orders="canBreakdownPurchaseOrders"
        :show-totals="showPurchaseOrderTotals"
        @update="updateItem"
        @delete="deleteItem"
      />
    </div>
    <div class="col-auto row items-center q-py-sm q-px-md q-px-md-none">
      <purchase-order-form
        v-if="showNewForm && propertyType === 'purchase_order'"
        v-model:reference="newItem['reference']"
        v-model:start_date="newItem['start_date']"
        v-model:end_date="newItem['end_date']"
        v-model:amount="newItem['amount']"
        v-model:approved="newItem['approved']"
        v-model:partitioned="newItem['partitioned']"
        :service="service"
        :can-breakdown-purchase-orders="canBreakdownPurchaseOrders"
      />
      <q-form @submit="showNewItemForm" class="row items-center"
              :class="!(showNewForm && propertyType === 'purchase_order') ? 'col-grow' : 'col-shrink'">
        <div v-if="propertyType === 'simple' || propertyType === 'with_children'" class="col-grow">
          <q-input
            v-model="newItem.name"
            :label="newItemLabel"
            v-if="showNewForm"
            ref="nameInput"
            dense
            outlined
            stack-label
            label-color="white"
            color="primary"
            type="text"
            autofocus
            @keyup.enter="saveNewItem"
          />
        </div>
        <div v-if="allowNew && isBelowMaxItems" class="q-mt-sm q-mt-sm-none col-shrink">
          <q-btn
            v-if="!showNewForm"
            :label="newItemLabel"
            color="primary"
            text-color="dark"
            size="md"
            type="submit"
          />
          <q-btn
            v-if="showNewForm"
            :disable="!allowSave"
            label="Save"
            size="sm"
            class="q-ml-sm col-auto"
            color="primary"
            text-color="dark"
            @click="saveNewItem"
          />
          <q-btn
            v-if="showNewForm"
            label="Cancel"
            color="white"
            outline
            size="sm"
            class="q-ml-sm col-auto"
            @click="cancelNewItem"
          />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script>
import { nextTick, ref } from "vue"
import ItemEditor from "src/components/ItemEditor.vue"
import ItemEditorWithChild from "src/components/ItemEditorWithChild.vue"
import PurchaseOrderForm from "src/components/PurchaseOrderForm.vue"
import PurchaseOrderTable from "src/components/PurchaseOrderTable.vue"

export default {
  name: "ServicePropertyEditor",
  components: { ItemEditor, ItemEditorWithChild, PurchaseOrderForm, PurchaseOrderTable },
  props: {
    serviceId: { type: Number },
    service: { type: Object },
    data: { type: Object },
    dataCall: { type: String },
    accessType: { type: String, default: "admin" },
    allowEditLabel: { type: Boolean, default: true },
    allowNew: { type: Boolean, default: true },
    labelProperty: { type: String, default: "name" },
    propertyType: { type: String, default: "simple" },
    childProperty: { type: String, default: "none" },
    childLabel: { type: String, default: "Please change" },
    childType: { type: String, default: "simple" },
    childDataCall: { type: String },
    newItemParentProperty: { type: String },
    itemDeleteLabel: { type: String, default: "DELETE" },
    showParentSelector: { type: Boolean, default: false },
    newItemLabel: { type: String, default: "ADD NEW" },
    newChildItemLabel: { type: String, default: "ADD NEW CHILD" },
    options: { type: Array, default: () => [] },
    childOptions: { type: Array, default: () => [] },
    capabilities: { type: Array, default: () => [] },
    canBreakdownPurchaseOrders: { type: Boolean, default: false },
    singleItemOnly: { type: Boolean, default: false },
    showPurchaseOrderTotals: { type: Boolean, default: true },
    hasMultipleSelector: { type: Boolean, default: false }
  },
  emits: ["serviceUpdate"],
  setup() {
    const nameInput = ref(null)

    return {
      nameInput
    }
  },
  data() {
    return {
      showNewForm: false,
      newItem: { name: "", service_id: this.serviceId }
    }
  },
  computed: {
    allowSave: function() {
      if (this.propertyType === "simple" || this.propertyType === "with_children") {
        const s = this.newItem.name.trim()
        return s.length >= 3
      } else if (this.propertyType === "purchase_order") {
        const s = this.newItem.reference.trim()
        return s.length >= 3
      }
      return false
    },
    isBelowMaxItems: function() {
      return !(this.propertyType === "purchase_order" && this.singleItemOnly && this.data.length)
    },
    badge: function() {
      return this.$store.getters["auth/getBadge"]
    },
    containerClass: function() {
      // return "q-mb-xl"
      return this.propertyType === "purchase_order" && this.singleItemOnly ? "" : "q-mb-sm"
    }
  },
  mounted() {
    this.resetNewItemForm()
    //auto open Purchase Order Form here?
  },
  methods: {
    showNewItemForm: async function() {
      this.showNewForm = true
      if (this.propertyType === "simple") {
        await nextTick()
        this.nameInput.focus()
      }
    },
    resetNewItemForm: function() {
      this.newItem.name = ""
      if (this.showParentSelector) {
        this.newItem.parent_id = 0
      }
      if (this.propertyType === "purchase_order") {
        this.newItem = {
          reference: "",
          service_id: this.serviceId,
          start_date: this.service.start_date,
          end_date: this.service.end_date,
          amount: 0,
          approved: 0,
          partitioned: 0
        }
      }
    },
    cancelNewItem: function() {
      this.resetNewItemForm()
      this.showNewForm = false
    },
    saveNewItem: function() {
      if (this.allowSave) {
        const obj = { data: this.newItem, call: this.dataCall, method: "post" }
        this.$store.dispatch("admin/datacallDt", obj).then(() => {
          this.$emit("serviceUpdate")
          this.cancelNewItem()
        }).catch(e => {
          alert(e.data.message || e.statusText)
        })
      }
    },
    updateItem: function(data) {
      const _data = JSON.parse(JSON.stringify(data))
      const _id = data.id
      if (_data.children !== undefined) {
        delete _data.children
      }

      this.$q.loading.show({
        message: ""
      })

      const obj = { data: _data, id: _id, call: this.dataCall, method: "patch" }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        this.$emit("serviceUpdate")
      }).catch(e => {
        alert(e.data.message || e.statusText)
        this.$q.loading.hide()
      })
    },
    deleteItem: function(data) {
      const obj = { id: data, call: this.dataCall, method: "delete" }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        this.$emit("serviceUpdate")
      }).catch(e => {
        console.log(e)
        if (e.response && e.response.data && e.response.data.error) {
          this.$store.dispatch(
            "auth/setDataCallNotice",
            { show: true, title: "Data call error", message: e.response.data.error }
          )
        } else if (e.status === 422 && e.data && e.data.error) {
          this.$store.dispatch(
            "auth/setDataCallNotice",
            { show: true, title: "Disallowed data call", message: e.data.error }
          )
        } else {
          this.$store.dispatch(
            "auth/setDataCallNotice",
            { show: true, title: "Data call error", message: e }
          )
        }
      })
    }
  }
}
</script>
