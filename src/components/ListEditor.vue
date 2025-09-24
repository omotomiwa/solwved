<template>
  <div class="q-mb-xl">
    <q-list
      v-if="data && data.length"
      bordered
      separator
    >
      <q-item
        v-for="item in data"
        :key="item.id"
      >
        <item-editor
          :data="item"
          :label-property="labelProperty"
          :allow-edit-label="allowEditLabel"
          :edit-action="editAction"
          :item-delete-label="itemDeleteLabel"
          @update="updateItem"
          @delete="deleteItem"
          @edit="onEditItem(item)"
        />
      </q-item>
    </q-list>
    <q-separator />
    <q-item class="q-mt-md q-pt-none q-pb-md column row-sm items-sm-center q-px-none">
      <q-input
        v-if="showNewForm"
        ref="nameInput"
        v-model="newItem.name"
        class="col-12 col-sm-3"
        outlined
        color="primary"
        type="text"
        label="Organisation Name"
        @keyup.enter="saveNewItem"
      />

      <new-selector-form
        v-if="showNewForm"
        v-model:option_id="newItem.org_type"
        :options="organisation_types"
        classes="col-12 col-sm-3 q-pl-none q-pl-sm-sm q-pt-sm q-pt-sm-none"
        label="Organisation type"
        is-filterable
        filter-key="name"
        default-class="full-width"
      />

      <new-selector-form
        v-if="showNewForm"
        :options="currencies"
        option-label="name"
        is-filterable
        filter-key="name"
        label="Currency"
        classes="col-12 col-sm-3 q-pl-none q-pl-sm-sm q-pt-sm q-pt-sm-none"
        v-model:option_id="newItem.currency_id"
        is-option-customisable
        is-selected-option-customisable
      >
        <template v-slot:option="{ option, events }">
          <q-item v-bind="events">
            <q-item-section>
              {{ option.name }} ( {{ option.symbol }} )
            </q-item-section>
          </q-item>
        </template>

        <template v-slot:selected-item="{ option }">
          {{ option.name }} ( {{ option.symbol }} )
        </template>
      </new-selector-form>

      <div class="col-12" :class="{'col-sm-3': showNewForm}">
        <q-btn
          v-if="!showNewForm"
          label="Add New"
          color="primary"
          text-color="dark"
          @click="showNewItemForm"
        />
        <q-btn
          v-if="showNewForm"
          class="col-auto q-ml-none q-ml-sm-sm q-mt-sm q-mt-sm-none"
          :disable="!allowSave || saving"
          label="Save"
          color="primary"
          text-color="dark"
          :loading="saving"
          @click="saveNewItem"
        />
        <q-btn
          v-if="showNewForm"
          class="col-auto q-ml-sm q-mt-sm q-mt-sm-none"
          :disable="saving"
          label="Cancel"
          color="white"
          outline
          :loading="saving"
          @click="cancelNewItem"
        />
      </div>
    </q-item>
  </div>
</template>

<script>
import { nextTick, ref } from "vue"
import ItemEditor from "src/components/ItemEditor.vue"
import NewSelectorForm from "src/components/NewSelectorForm.vue"

export default {
  name: "ListEditor",
  components: { ItemEditor, NewSelectorForm },
  props: {
    data: { type: Object },
    dataCall: { type: String },
    editAction: { type: String, default: "inline" },
    allowEditLabel: { type: Boolean, default: true },
    labelProperty: { type: String, default: "name" },
    itemDeleteLabel: { type: String, default: "DELETE" }
  },
  emits: ["listUpdate", "editItem"],
  setup() {
    const nameInput = ref(null)

    return {
      nameInput
    }
  },
  data() {
    return {
      showNewForm: false,
      newItem: {
        name: "",
        org_type: 1,
        currency_id: null
      },
      saving: false
    }
  },
  computed: {
    allowSave: function() {
      const s = this.newItem.name.trim()
      return s.length >= 3
    },
    currencies: function() {
      return this.$store.getters["common/getCurrencies"]
    },
    organisation_types: function() {
      return this.$store.getters["admin/getOrganisationTypes"] ?? []
    }
  },
  mounted() {
    this.getOrganisationTypes()
    this.resetNewItemForm()
  },
  methods: {
    getOrganisationTypes: function() {
      this.$store.dispatch("admin/getOrganisationTypes")
    },
    showNewItemForm: async function() {
      this.showNewForm = true
      await nextTick()
      this.nameInput.focus()
    },
    resetNewItemForm: function() {
      this.newItem.name = ""
      this.newItem.org_type = 1
    },
    cancelNewItem: function() {
      this.resetNewItemForm()
      this.showNewForm = false
    },
    onEditItem: function(item) {
      this.$emit("editItem", item)
    },
    saveNewItem: function() {
      if (this.allowSave && !this.saving) {
        const obj = { data: this.newItem, call: this.dataCall, method: "post" }
        this.saving = true
        this.$store.dispatch("admin/datacallDt", obj).then(() => {
          // call service update
          this.$emit("listUpdate")
          this.saving = false
          this.resetNewItemForm()
        }).catch(e => {
          this.saving = false
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

      const obj = { data: _data, id: _id, call: this.dataCall, method: "patch" }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        // call service update
        this.$emit("listUpdate")
      }).catch(e => {
        alert(e.data.message || e.statusText)
      })
    },
    deleteItem: function(data) {
      const obj = { id: data, call: this.dataCall, method: "delete" }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        // call service update
        this.$emit("listUpdate")
      }).catch(e => {
        if (e.response && e.response.data && e.response.data.error) {
          this.$store.dispatch(
            "auth/setDataCallNotice",
            { show: true, title: "Data call error", message: e.response.data.error }
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
