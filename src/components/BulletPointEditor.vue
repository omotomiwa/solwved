<template>
  <ul class="bullet-list">
    <draggable :list="sortedItems" item-key="id" @change="reorderItems" handle=".handle" :disabled="!editable">
      <template #item="{ element: item }">
        <li class="q-mb-xs bullet-row">
          <q-input
            v-model="item.content"
            dense
            filled
            label-color="white"
            color="primary"
            autogrow
            class="bullet-row__input q-ml-sm"
            @keyup="onItemContentChange"
            :readonly="!editable"
          >
            <template v-slot:before v-if="editable">
              <q-icon class="handle" name="drag_indicator" style="cursor: grab;" />
            </template>
            <template v-slot:prepend>
              <span style="width:20px;" class="text-primary text-subtitle1">{{ item.position }}:</span>
            </template>
          </q-input>
          <q-icon
            name="delete"
            color="negative"
            class="bullet-row__trash q-ml-sm"
            size="sm"
            @click="deleteItem(item)"
            v-if="editable"
          />
        </li>
      </template>
    </draggable>
  </ul>
  <!-- <ul
    v-if="editable"
    class="bullet-list"
  >
    <li
      v-for="(item, index) in sortedItems"
      :key="item.position"
      class="q-mb-xs bullet-row"
    >
      <select
        v-model="item.position"
        class="col bullet-row__select"
        @update:model-value="value => reorderItems(item, index + 1)"
      >
        <option
          v-for="(item, index) in sortedItems"
          :key="index"
          :value="index + 1"
        >
          {{ index + 1 }}
        </option>
      </select>
      <q-input
        v-model="item.content"
        dense
        filled
        autogrow
        class="bullet-row__input q-ml-sm"
        @keyup="onItemContentChange"
      />
      <q-icon
        name="delete"
        color="negative"
        class="bullet-row__trash q-ml-sm"
        size="sm"
        @click="deleteItem(item)"
      />
    </li>
  </ul>
  <ol
    v-else
    style="padding-left:24px;"
  >
    <li
      v-for="(item, index) in sortedItems"
      :key="index"
      class="q-mb-xs"
    >
      {{ item.content }}
    </li>
  </ol> -->
  <div v-if="editable">
    <div class="row items-center">
      <q-input
        v-model="newItemText"
        label="Create New"
        stack-label
        label-color="white"
        color="primary"
        filled
        autogrow
        class="col-12"
      />
    </div>
    <div class="row items-center justify-end">
      <q-btn
        label="Add New Item"
        unelevated
        size="sm"
        color="primary"
        class="col-auto q-mt-xs"
        outline
        :class="enableNewButton? '':'faded'"
        @click="addNewItem"
      >
        <q-tooltip
          v-if="!enableNewButton"
          anchor="bottom middle"
          self="top middle"
          class="row align-center"
          :offset="[10, 10]"
          :delay="750"
          transition-show="scale"
          transition-hide="scale"
        >
          <q-icon
            name="tips_and_updates"
            size="sm"
            class="q-mr-sm"
          />
          <span class="bullet-tooltip">New item can't be blank</span>
        </q-tooltip>
      </q-btn>
    </div>
  </div>
  <div
    v-if="showBlankMessage"
    class="nocontent-message"
  >
    {{ blankMessage }}
  </div>
</template>

<script>
import { computed, defineComponent, nextTick, ref, watch } from "vue"
import draggable from "vuedraggable"

export default defineComponent({
  name: "BulletPointEditor",
  components: {
    draggable
  },
  props: {
    items: { type: Array, default: () => [] },
    editable: { type: Boolean, default: false },
    blankMessage: { type: String, default: "There are no items to display" }
  },
  emits: ["addNewItem", "onDeleteItem", "onItemsChange"],
  setup(props, { emit }) {
    const newItemText = ref("")

    const sortedItems = computed(function() {
      const sorted = [...props.items].sort(function(a, b) {
        return a.position - b.position
      })
      // failsafe to ensure no position skipped, especially after a delete
      for (let index = 0; index < sorted.length; index++) {
        sorted[index].position = index + 1
      }
      return sorted
    })
    const showBlankMessage = computed(function() {
      return props.editable === false && props.items.length < 1
    })
    const enableNewButton = computed(function() {
      return newItemText.value.trim().length > 0
    })

    watch(sortedItems, async function(newVal, oldVal) {
      if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        await nextTick()
        emit("onItemsChange", newVal)
      }
    }, { deep: true })

    const addNewItem = () => {
      if (newItemText.value.trim().length > 0) {
        emit("addNewItem", newItemText.value)
        newItemText.value = ""
      }
    }

    // function reorderItems (item, oldPosition) {
    const reorderItems = event => {
      const item = event.moved.element
      const oldPosition = event.moved.oldIndex + 1
      const newPosition = event.moved.newIndex + 1
      const items = sortedItems.value
      for (let index = 0; index < items.length; index++) {
        const i = items[index]
        if (i === item) {
          i.position = newPosition
        } else if (newPosition < oldPosition) {
          if (i.position >= newPosition && i.position < oldPosition) {
            i.position += 1
          }
        } else if (newPosition > oldPosition) {
          if (i.position <= newPosition && i.position > oldPosition) {
            i.position -= 1
          }
        }
      }
    }

    const onItemContentChange = () => {
      emit("onItemsChange", sortedItems.value)
    }

    const deleteItem = item => {
      emit("onDeleteItem", item)
    }

    return {
      newItemText,

      sortedItems,
      showBlankMessage,
      enableNewButton,

      addNewItem,
      reorderItems,
      onItemContentChange,
      deleteItem
    }
  }
})
</script>

<style scoped>
.bullet-list {
  padding-left: 0;
  margin-left: 0;
}

.bullet-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
}

.bullet-row__trash {
  flex: 0 0 20px;
  cursor: pointer;
}

.bullet-row__select {
  flex: 0 0 40px;
}

.bullet-row__input {
  flex: 1 1 auto;
}

.faded {
  opacity: 0.75;
}

.bullet-tooltip {
  font-size: 0.9rem;
}
</style>
