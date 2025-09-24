<script>
export default {
  name: "RecursiveList",
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
    dense: { type: Boolean, default: false }
  },
  computed: {
    hasChildren: function() {
      return this.list.filter(item => item[this.captionKey] && item[this.captionKey].length > 0).length > 0
    },
    getListStyle: function() {
      let style = ""
      let columns = 1
      if (!this.hasChildren) {
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
  }
}
</script>

<template>
  <div>
    <q-list v-if="(list ?? []).length > 0"
            :bordered="bordered"
            :separator="separator || separatorRecursive"
            :dense="dense"
            class="rounded-borders"
            :style="getListStyle"
    >
      <template v-if="hasChildren">
        <q-expansion-item
          v-for="(item,index) of list"
          :key="index"
        >
          <template v-slot:header>
            <q-item-section>
              <q-item-label>
                {{ item[this.labelKey] }}
              </q-item-label>
              <q-item-label caption>
                <span>Children: </span>
                <q-badge color="primary" textColor="dark">{{ (item[this.captionKey] ?? []).length }}</q-badge>
              </q-item-label>
            </q-item-section>
          </template>
          <q-card class="bg-dark-8">
            <q-separator />
            <q-card-section>
              <recursive-list :list="(item[childrenKey] ?? [])" :label-key="labelKey"
                              :bordered-recursive="borderedRecursive"
                              :separator-recursive="separatorRecursive"
                              rounded
                              :maxColumns
                              dense />
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </template>
      <template v-else>
        <q-item
          class="bg-dark list-border rounded-borders"
          v-for="(item,index) of list"
          :key="index"
          clickable
          v-ripple
        >
          {{ item[this.labelKey] }}
        </q-item>
      </template>
    </q-list>
    <div v-else class="bg-dark-8">
      <div class="border-dark-028 q-pa-sm rounded-borders dimmed bg-dark text-caption">
        No {{ childrenKey }} found
      </div>
    </div>
  </div>
</template>
