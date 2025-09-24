<template>
  <div class="col">
    <div v-if="localData" class="row col items-center">
      <div class="col">
        <div v-if="!isEditing" class="row items-center justify-start">
          <div class="inline-label col-6">
            {{ localData.name }}
          </div>
          <q-btn
            v-if="!showNewForm && (!childData || childData.length < 1)"
            icon="add"
            :label="newItemLabel"
            unelevated
            outline
            size="md"
            color="primary"
            class="col-auto q-ml-md"
            @click="showNewItemForm"
          />
        </div>
        <div v-if="isEditing">
          <q-input
            v-model="localData.name"
            ref="input"
            @keyup.enter="saveItem"
            stack-label
            label-color="white"
            class="q-ml-md q-mb-sm"
            dense
            color="primary"
            type="text"
            autofocus
          />
        </div>
      </div>
      <div class="col-auto row items-center">
        <div v-if="isEditing" class="q-mx-sm">
          <q-btn
            :disable="!allowSave"
            label="Save"
            color="primary"
            text-color="dark"
            size="sm"
            @click="saveItem"
          />
        </div>
        <div v-if="isEditing" class="q-mx-sm">
          <q-btn
            label="CANCEL"
            color="white"
            outline
            class="q-ml-sm"
            size="sm"
            @click="cancelEdit"
          />
        </div>
        <div v-if="!isEditing" class="q-mx-sm">
          <q-btn
            label="Edit"
            color="primary"
            text-color="dark"
            size="sm"
            @click="setEditing"
          />
        </div>
        <div v-if="!isEditing" class="q-mx-sm">
          <q-btn
            label="Delete"
            color="negative"
            size="sm"
            @click="deleteItem"
          />
        </div>
      </div>
    </div>
    <div class="q-ml-lg">
      <div v-if="childData && childData.length > 0" class="row">
        <div class="child-title col-auto">
          {{ childLabel }} :
          <q-btn
            v-if="!showNewForm"
            icon="add"
            outline
            unelevated
            size="xs"
            color="primary"
            class="q-ml-md pointer"
            @click="showNewItemForm"
          />
        </div>
      </div>
      <q-list v-if="childData && childData.length">
        <item-editor
          v-for="item in childData"
          :key="item.id"
          :data="item"
          :allow-edit-label="allowEditChild"
          :item-delete-label="childDeleteLabel"
          class="q-mb-xs"
          @update="updateChildItem"
          @delete="deleteChildItem"
        />
      </q-list>
      <q-form @submit="saveNewChildItem" v-if="showNewForm">
        <div class="row items-center">
          <q-input
            v-if="childType === 'simple'"
            v-model="newItem.name"
            ref="input"
            @keyup.enter="saveNewChildItem"
            stack-label
            label-color="white"
            class="q-ml-md q-mb-sm"
            dense
            color="primary"
            type="text"
            autofocus
          />
          <new-selector-form
            v-if="childType === 'selector'"
            v-model:option_id="newItem.optionId"
            :options="childOptionList"
            :label="newItemLabel"
            is-filterable
            filter-key="name"
            is-clearable
            dense
            classes="min-w-300"
            autofocus
            :multiple="hasMultipleSelector"
          />
          <q-btn
            label="Save"
            :disable="!allowSave"
            class="q-ml-sm"
            color="primary"
            text-color="dark"
            type="submit"
          />
          <q-btn
            label="Cancel"
            color="white"
            outline
            class="q-ml-sm"
            @click="cancelNewItem"
          />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script>
import { nextTick, ref } from "vue"
import { map as _map } from "lodash"
import ItemEditor from "src/components/ItemEditor.vue"
import NewSelectorForm from "src/components/NewSelectorForm.vue"

export default {
  name: "ItemEditorWithChild",
  components: { ItemEditor, NewSelectorForm },
  props: {
    data: { type: Object },
    serviceId: { type: Number },
    childProperty: { type: String, default: "none" },
    childLabel: { type: String, default: "Categories" },
    childDataCall: { type: String, default: "servicelines" },
    childType: { type: String, default: "simple" },
    hasMultipleSelector: { type: Boolean, default: false },
    newItemLabel: { type: String, default: "New Project" },
    newItemParentProperty: { type: String, default: "service_name_id" },
    newItemParentPropertyValue: { type: Number, default: 0 },
    childOptions: { type: Array, default: () => [] },
    defaultChildItem: { type: Object, default: null }
  },
  emits: ["update", "delete", "edit", "serviceUpdate"],
  setup() {
    const input = ref(null)

    return {
      input
    }
  },
  data() {
    return {
      showNewForm: false,
      localData: null,
      isEditing: false,
      newItem: {
        name: "",
        service_id: this.serviceId,
        [this.newItemParentProperty]: this.newItemParentPropertyValue,
        optionId: null
      }
    }
  },
  computed: {
    hasChanged: function() {
      return this.data.name !== this.localData.name
    },
    allowSave: function() {
      return !(this.localData.name.length < 2 && this.hasChanged)
    },
    childData: function() {
      return this.data[this.childProperty] !== undefined ? this.data[this.childProperty] : false
    },
    allowEditChild: function() {
      return this.childType !== "selector"
    },
    childDeleteLabel: function() {
      return this.allowEditChild ? "Delete" : "Remove"
    },
    childOptionList: function() {
      let children = _map(this.childData || [], "output_id")
      return this.childOptions.filter(val => !children.includes(val.id)) ?? []
    }
  },
  watch: {
    data: function() {
      this.setLocalData()
      this.isEditing = false
    }
  },
  mounted() {
    this.setLocalData()
  },
  methods: {
    setLocalData: function() {
      this.localData = {
        id: this.data.id,
        name: this.data.name
      }
      if (!this.localData.name) {
        this.localData.name = "."
      }
    },
    setEditing: async function() {
      this.isEditing = true
      await nextTick()
      if (this.input) {
        this.input.focus()
      }
    },
    cancelEdit: function() {
      this.isEditing = false
      this.setLocalData()
    },
    saveItem: function() {
      if (this.allowSave) {
        this.$emit("update", this.localData)
        this.isEditing = false
      }
    },
    deleteItem: function() {
      this.$emit("delete", this.localData.id)
    },
    showNewItemForm: async function() {
      this.showNewForm = true
      await nextTick()
      if (this.input) {
        this.input.focus()
      }
    },
    resetNewItemForm: function() {
      this.newItem.name = ""
      this.newItem.optionId = null
      this.newItem[this.newItemParentProperty] = this.newItemParentPropertyValue
    },
    cancelNewItem: function() {
      this.resetNewItemForm()
      this.showNewForm = false
    },
    updateChildItem: function(data) {
      const _data = JSON.parse(JSON.stringify(data))
      const _id = data.id
      const obj = {
        data: _data,
        id: _id,
        call: this.childDataCall,
        method: "put"
      }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        // call service update
        this.$emit("serviceUpdate")
      }).catch(e => {
        alert(e.data.message || e.statusText)
      })
    },
    deleteChildItem: function(data) {
      const obj = { id: data, call: this.childDataCall, method: "delete" }
      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        // call service update
        this.$emit("serviceUpdate")
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
    },
    saveNewChildItem: function() {
      // do a dispatch and then an emit
      if (this.childProperty === "deliverables") {
        delete this.newItem.name
        delete this.newItem.service_id
        this.newItem.output_id = this.newItem.optionId
        this.newItem.capability_id = this.newItemParentPropertyValue
      }

      const obj = {
        data: this.newItem,
        call: this.childDataCall,
        method: "post"
      }

      if (this.childProperty === "projects") {
        obj.data = { programme_id: this.data.id }
        obj.call = this.childDataCall + "/" + this.newItem.optionId
        obj.method = "patch"
      }

      this.$store.dispatch("admin/datacallDt", obj).then(() => {
        // call service update
        this.$emit("serviceUpdate")
        this.resetNewItemForm()
        this.showNewForm = false
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

.child-title {
  font-size: smaller;
  /*
    border-bottom: 1px solid rgba(0,0,0,0.2);
    margin-bottom: 4px;
    padding-bottom: 4px;
    */
  font-style: italic;
}
</style>
