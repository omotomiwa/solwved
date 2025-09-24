<template>
  <div>
    <div class="row items-center q-col-gutter-sm">

      <div>
        New form goeth here
      </div>

    </div>
    {{ localRecord }}
    {{ allowSave }}
    {{ contract }}
    {{ selectedContract }}
    {{ props }}
  </div>
</template>

<script>
export default {
  name: "NewContract",
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup>
import { ref, computed } from "vue"

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null }
})

// const store = useStore()

// const emits = ['cancel', 'refresh'];

const localRecord = ref({
  service_id: null,
  status: null,
  alerter_id: null,
  alert_date: "",
  start_date: "",
  end_date: "",
  notes: ""
})

// const showNewCapabilityForm = ref(false)
const selectedContract = ref(false)

const allowSave = computed(() => {
  // return (this.dmodel.from !== '' && this.dmodel.to !== '')
  return false
})

/*
watch(service_id, (currentValue, oldValue) => {
  getService()
})
*/

/*
watch(props.contracts, (currentValue, oldValue) => {
  // selectedContract = currentValue.id
})
*/

/*
function cancel () {
  this.$emit('cancel')
  this.resetForm()
}
*/
</script>

<style lang="scss" scoped>
table {
  border: 1px solid #1C6EAA;
  background-color: white;
  border-collapse: collapse;
  padding: 100px;
}

.infos {
  padding: 2px;
  background: rgb(2, 0, 36);
  background: linear-gradient(270deg, rgba(2, 0, 36, 1) 0%, rgba(9, 121, 86, 0.14936396922050066) 0%, rgba(0, 212, 255, 1) 100%);
}

.infosdata {
  padding-left: 10px
}

.alternate-color .q-item {
  background-color: rgba(54, 76, 102, 0.2);
}

.alternate-color .q-item:nth-of-type(2n) {
  background-color: rgba(54, 76, 102, 0.1);
}
</style>
