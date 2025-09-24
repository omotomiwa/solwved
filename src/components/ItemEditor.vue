<template>
  <div class="col">
    <div v-if="localData" class="row col items-center">
      <div class="col">
        <div v-if="!isEditing" class="inline-label">
          {{ localData.name }}
        </div>
        <div v-if="isEditing">
          <new-selector-form
            v-if="showParentSelector && parentOptions.length"
            v-model:option_id="localData.parent_id"
            is-filterable
            filter-key="name"
            :options="parentOptions"
            label=""
            autofocus
          />
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
          />
        </div>
      </div>
      <div class="col-auto row items-center">
        <div v-if="isEditing">
          <q-btn
            :disable="!allowSave"
            label="Save"
            class="q-ml-sm"
            color="primary"
            text-color="dark"
            size="sm"
            @click="saveItem"
          />
        </div>
        <div v-if="isEditing">
          <q-btn
            label="CANCEL"
            color="white"
            outline
            class="q-ml-sm"
            size="sm"
            @click="cancelEdit"
          />
        </div>
        <div v-if="!isEditing && allowEditLabel">
          <q-btn
            label="Edit"
            class="q-ml-sm"
            color="primary"
            text-color="dark"
            size="sm"
            @click="setEditing"
          />
        </div>
        <div v-if="!isEditing">
          <q-btn
            :label="itemDeleteLabel"
            color="negative"
            size="sm"
            @click="deleteItem"
            class="q-mx-sm"
          />
        </div>
      </div>
    </div>
    <div v-if="localData && localData.children && localData.children.length" class="row col items-center">
      <q-list class="col" bordered separator>
        <q-item v-for="item in localData.children" :key="item.id">
          <item-editor
            :data="item"
            :label-property="labelProperty"
            :allow-edit-label="allowEditLabel"
            :edit-action="editAction"
            :item-delete-label="itemDeleteLabel"
            @update="updateChildItem"
            @delete="deleteChildItem"
          />
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script>
import { nextTick, ref } from "vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

export default {
  name: "ItemEditor",
  components: {
    NewSelectorForm
  },
  props: {
    data: { type: Object },
    allowEditLabel: { type: Boolean, default: true },
    editAction: { type: String, default: "inline" },
    labelProperty: { type: String, default: "name" },
    itemDeleteLabel: { type: String, default: "DELETE" },
    showParentSelector: { type: Boolean, default: false },
    parentOptions: { type: Array, default: () => [] }
  },
  emits: ["update", "delete", "edit"],
  setup() {
    const input = ref(null)

    return {
      input
    }
  },
  data() {
    return {
      localData: null,
      isEditing: false
    }
  },
  computed: {
    hasChanged: function() {
      return this.data[this.labelProperty] !== this.localData.name
    },
    allowSave: function() {
      return !(this.localData.name.length < 2 && this.hasChanged)
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
        name: this.data[this.labelProperty]
      }
      if (this.data.children !== undefined) {
        this.localData.children = this.data.children
      }
      if (this.data.parent_id !== undefined && parseInt(this.data.parent_id) !== 0) {
        this.localData.parent_id = this.data.parent_id
      }
    },
    setEditing: async function() {
      if (this.editAction === "inline") {
        this.isEditing = true
        await nextTick()
        this.input.focus()
      } else if (this.editAction === "event") {
        this.$emit("edit")
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
    updateChildItem: function(data) {
      this.$emit("update", data)
    },
    deleteItem: function() {
      this.$emit("delete", this.localData.id)
    },
    deleteChildItem: function(id) {
      this.$emit("delete", id)
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
