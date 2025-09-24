<template>
  <q-badge class="transparent-badge">
    <q-icon name="warning" color="negative" class="icon" />
    <q-tooltip
      anchor="top middle"
      self="bottom middle"
      :offset="[10, 10]"
      class="bg-negative text-white row items-center"
    >
      <q-icon name="warning" color="white" class="q-mr-xs" size="sm" />
      <div class="text-body2">{{ message }}</div>
    </q-tooltip>
  </q-badge>
</template>

<script setup>
const props = defineProps({
  message: { type: String, default: "Date outside permitted range" }
})
</script>

<style scoped>
.icon {
  font-size: 2em;
}

.transparent-badge {
  background-color: transparent;
}
</style>
