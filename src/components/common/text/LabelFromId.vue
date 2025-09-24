<script>
export default {
  name: "LabelFromId",
  props: {
    id: { type: String, required: true },
    list: { type: Array, required: true },
    labelKey: { type: String, required: true }
  },
  computed: {
    label: function() {
      const item = this.list.find(i => i.id === this.id)
      return item?.[this.labelKey] ?? ""
    }
  }
}
</script>

<template>
  <span>{{ label }}</span>
</template>
