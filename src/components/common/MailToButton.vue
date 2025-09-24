<template>
  <q-btn
    :label="props.label"
    :href="mailToString"
    icon="mail"
    dense
    unelevated
    class="q-px-md"
    :color="props.color"
    :text-color="props.textColor"
    :padding="props.padding"
    :size="props.size"
    :outline="props.outline"
  />
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  label: { type: String, default: "Request New" },
  email: { type: String, default: "support@sowlved.com" },
  subject: { type: String, default: "Service design request" },
  message: { type: String, default: "Dear SOWLVED, I would like to make a request for a service design" },
  color: { type: String, default: "primary" },
  textColor: { type: String, default: "dark" },
  outline: { type: Boolean, default: true },
  padding: { type: String, default: "xs md" },
  size: { type: String, default: "sm" }
})

const mailToString = computed(() => {
  return `mailto:${encodeURIComponent(props.email)}?subject=${encodeURIComponent(
    props.subject
  )}&body=${encodeURIComponent(props.message)}`
})
</script>
