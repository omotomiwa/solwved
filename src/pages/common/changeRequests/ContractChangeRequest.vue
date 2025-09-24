<template>
  <change-request
    :vendor_id="props.vendor_id"
    :customer_id="props.customer_id"
    :change_request_id="props.change_request_id"
    change-request-type="contract"
  />
</template>

<script>
export default {
  name: "ContractChangeRequest",
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup>
import ChangeRequest from "src/pages/common/changeRequests/ChangeRequest.vue"

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null },
  change_request_id: { type: String, default: null }
})
</script>
