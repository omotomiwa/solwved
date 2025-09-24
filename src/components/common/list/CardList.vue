<script>
export default {
  name: "CardList",
  components: {},
  props: {
    list: { type: Array, default: () => [] },
    hasLabel: { type: Boolean, default: false },
    hasCaption: { type: Boolean, default: false },
    labelKey: { type: String, default: "label" },
    captionKey: { type: String, default: "children" },
    childrenKey: { type: String, default: "children" },
    maxColumns: { type: Number, default: 1 },
    bordered: { type: Boolean, default: false },
    separator: { type: Boolean, default: false },
    borderedRecursive: { type: Boolean, default: false },
    separatorRecursive: { type: Boolean, default: false },
    isParent: { type: Boolean, default: false },
    dense: { type: Boolean, default: false },
    draggable: { type: Boolean, default: false },
    removable: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
    hasMenu: { type: Boolean, default: false }
  },
  emits: ["onDragStart", "removeElement"],
  data() {
    return {
      expanded: null
    }
  },
  computed: {
    hasChildren: function() {
      return this.list.filter(item => item[this.captionKey] && item[this.captionKey].length > 0).length > 0
    },
    getListStyle: function() {
      let style = ""
      let columns = 1
      if (this.isParent) {
        if (this.$q.screen.gt.md) {
          columns = 3
        } else if (this.$q.screen.md) {
          columns = 2
        }

        if (columns > this.maxColumns) {
          columns = this.maxColumns
        }

        style += "display: grid;"
        style += "grid-template-columns: repeat( " + columns + ", 1fr );"
        style += "grid-gap: 0.75rem;"
      }
      return style
    }
  },
  methods: {
    remove: function(item) {
      this.$emit("removeElement", item)
    }
  }
}
</script>

<template>
  <div>
    <template v-if="hasChildren || isParent">
      <q-list v-if="(list ?? []).length > 0"
              :bordered="bordered ?? false"
              :separator="separator || separatorRecursive"
              :dense="dense ?? false"
              class="rounded-borders"
              :style="getListStyle"
      >
        <q-item v-for="(item,index) of list"
                :key="index"
                :id="item.id"
                class="bg-dark border-dark-028 rounded-borders"
                :class="{'cursor-pointer': draggable ?? false}"
                :clickable="clickable ?? false"
                :draggable="draggable ?? false"
                v-ripple
                @dragstart="e => $emit('onDragStart',{e, item})"
        >
          <q-item-section top class="full-height">
            <q-item-label class="text-primary">
              {{ item[this.labelKey] }}
              <q-badge
                v-if="item?.is_new"
                text-color="dark"
                align="top"
                class="font-size-10 q-py-none q-px-xs"
              >
                New
              </q-badge>
            </q-item-label>

            <card-list
              :list="(item[childrenKey] ?? [])"
              :label-key="labelKey"
              :dense="true"
              :removable="removable ?? false"
              :has-menu="hasMenu ?? false"
              @removeElement="remove"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </template>
    <q-list v-else
            :bordered="bordered ?? false"
            :separator="separator || separatorRecursive"
            :dense="dense ?? false"
            class="rounded-borders"
    >
      <template v-if="list.length > 0">
        <q-item
          v-for="(item,index) of list"
          :key="index"
          :id="item.id"
          class="q-py-sm"
          :class="{'cursor-pointer': hasMenu ?? false}"
        >
          <q-item-section avatar class="min-w-auto">
            <q-icon color="primary" name="fa-solid fa-circle" size="8px" />
          </q-item-section>

          <q-item-section top>
            <q-item-label class="line-height-1-75" caption>
              {{ item[this.labelKey] }}
              <q-badge
                v-if="item?.is_new"
                text-color="dark"
                align="top"
                class="font-size-10 q-py-none q-px-xs"
              >
                New
              </q-badge>
            </q-item-label>
            <q-menu v-if="hasMenu"
                    fit context-menu auto-close
            >
              <q-item clickable>
                <q-item-section>Edit</q-item-section>
              </q-item>
              <q-item v-if="removable" clickable @click="remove(item)">
                <q-item-section>Delete</q-item-section>
              </q-item>
            </q-menu>
          </q-item-section>
        </q-item>
      </template>
      <q-item v-else class="q-py-sm" disable>
        <q-item-label class="line-height-1-75" caption>No Item found</q-item-label>
      </q-item>
    </q-list>
  </div>
</template>
