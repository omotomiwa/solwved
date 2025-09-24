<script setup>
const props = defineProps({
  value: String,
  label: String
})
</script>

<template>
  <div class="row items-baseline">
    <div class="headline-number q-mr-sm text-primary">{{ props.value }}</div>
    <div class="summary-body"><span class="text-weight-bold">{{ props.label }}</span></div>
  </div>
</template>

<style scoped lang="scss">
.headline-number {
  font-size: 1.8rem;
  font-weight: 600;
  color: $primary;
  line-height: 1.2;
  min-width: 3rem;
}

.summary-body {
  font-size: 1.2rem;
}
</style>
