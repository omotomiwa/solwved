<template>
  <div>
    <div class="text-h6">Capabilities</div>
    <div v-for="capability in capabilities" :key="capability.id" class="q-pa-md q-mb-sm">
      <div class="text-weight-bold capability-label">{{ capability.name }}</div>
      <div class="row">
        <div class="q-mr-lg">Deliverables:</div>
        <ul v-if="capability.capability_outputs && capability.capability_outputs.length" class="q-my-none">
          <li v-for="item in capability.capability_outputs" :key="item.id">{{ item.output.name }}</li>
        </ul>
        <div v-else>None defined</div>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  capabilities: { type: Array, default: () => [] }
})
</script>

<style scoped>
.capability-label {
  font-size: larger;
}
</style>
