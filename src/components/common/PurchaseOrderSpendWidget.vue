<template>
  <q-card style="width: 900px; max-width: 80vw">
    <q-card-section class="row items-center q-pb-none">
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>
    <q-card-section :class="loading ? 'invisible' : ''">
      <purchase-order-spend-simple
        :po-reference="props.po?.reference"
        :purchase-order-value="totalValue"
        :current-spend="totalSpend"
        :end-date="DateTime.fromISO(endDate).toFormat(config.DATE_FORMAT_DLY)"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useStore } from "vuex"
import { DateTime } from "luxon"
import { Config } from "src/modules/StaticData.js"
import PurchaseOrderSpendSimple from "src/components/charts/PurchaseOrderSpendSimple.vue"

const store = useStore()
const props = defineProps({
  po: { type: Object, default: null }
})

const totalSpend = ref(0)
const endDate = ref(null)
const loading = ref(false)

const config = computed(() => Config)
const totalValue = computed(() => parseFloat(props.po?.amount ?? 0))

onMounted(() => {
  loading.value = true
  store.dispatch("common/purchaseOrderSpend", props.po.id).then(r => {
    totalSpend.value = parseFloat(r?.total_spend ?? 0)
    endDate.value = r.end_date
    loading.value = false
  })
})
</script>
