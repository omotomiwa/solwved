<template>
  <div>
    <div class="text-h4 q-my-md">Deliverables</div>
    <template v-if="nestedDeliverables?.length > 0">
      <q-expansion-item
        v-for="deliverable in nestedDeliverables"
        :key="deliverable.id"
        :label="deliverable.name"
        :caption="deliverable.children.length + ' Sub Deliverable' + (deliverable.children.length === 1 ? '' : 's')"
        header-class="q-mb-md accordion-header-bg"
        switch-toggle-side
        expand-separator
      >
        <div class="q-mb-sm">
          <span class="text-bold">Deliverable: </span>{{ deliverable.name }}
        </div>
        <div v-if="deliverable.children.length">
          <div v-for="child in deliverable.children" :key="child.id" class="q-pa-xs q-pl-md q-mb-xs">
            {{ child.name }}
          </div>
        </div>
      </q-expansion-item>
    </template>
    <template v-else>
      <div class="text-primary q-mb-sm q-ml-md">No deliverables</div>
    </template>
  </div>
</template>
<script setup>
import { computed } from "vue"

const props = defineProps({
  deliverables: { type: Array, default: () => [] }
})

const nestedDeliverables = computed(() => {
  const o = []
  if (props.deliverables && props.deliverables.length) {
    const a = JSON.parse(JSON.stringify(props.deliverables))
    for (let index = 0; index < a.length; index++) {
      const output = a[index]
      if (output.children === undefined) {
        output.children = []
      }
      if (parseInt(output.parent_id) !== 0) {
        // find the item
        const parent = a.find(element => parseInt(element.id) === parseInt(output.parent_id))
        if (parent.children === undefined) {
          parent.children = []
        }
        parent.children.push(output)
      } else {
        o.push(output)
      }
    }
  }
  return o
})
</script>

