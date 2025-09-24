<template>
  <div class="row items-center q-col-gutter-sm">
    <services-table
      v-if="admin"
      :services="services"
      edit-action="event"
      user-type="superadmin"
      @edit="changeService"
    />
    <new-selector-form
      v-model:option_id="localRecord.service"
      classes="col-12 col-md-6"
      filled
      :options="services"
      is-filterable
      filter-key="name"
      option-val-key="service"
      label="Service"
      default-class="full-width"
      options-selected-class="text-deep-orange"
      is-option-customisable
    >
      <template v-slot:option="{ option, events }">
        <q-item v-bind="events">
          <q-item-section avatar>
            <q-icon :name="option.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label v-html="option.name" />
            <q-item-label caption>{{ option.deliveryModel }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template #after-options>
        <q-btn
          class="q-ma-md q-px-lg q-py-sm"
          size="sm"
          dense
          color="primary"
          text-color="dark"
          label="Request New Service"
          @click="onRequestNewService"
        />
      </template>
    </new-selector-form>
    <div v-if="admin" class="row col-md-6 q-col-gutter-sm q-mt-lg">
      <q-btn
        v-show="!showNewForm"
        label="Create new Service"
        color="positive"
        size="sm"
        @click="showCreateNew"
      />
      <new-service-form
        v-show="showNewForm"
        :contract_id="contract.id"
        @cancel="hideCreateNew"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import ServicesTable from "components/ServicesTable.vue"
import NewServiceForm from "components/NewServiceForm.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

const props = defineProps({
  contract: { type: Object },
  admin: { type: Boolean, default: false },
  service: { type: Object, default: null }
})

// const store = useStore()

const emit = defineEmits(["serviceSelect"])

const localRecord = ref({
  service_id: null,
  service: null,
  status: null,
  alerter_id: null,
  alert_date: "",
  start_date: "",
  end_date: "",
  notes: ""
})
const showNewForm = ref(false)
const banner = ref(null)
let selectedService = ref((props.service) ? props.service : false)

const services = computed(() => {
  const sco = []
  const disabledIdsArray = [3, 4] // SOW or WP
  props.contract.services.forEach(s => {
    const disable = (disabledIdsArray.includes(s.delivery_model.id))
    let serviceName = s.name
    serviceName = (disable) ? serviceName + " [ Requests cannot be made from a { sow / wp } ]" : serviceName
    const icon = (disable) ? "highlight_off" : "room_service"
    sco.push({
      id: s.id,
      name: serviceName,
      deliveryModel: s.delivery_model.name,
      icon: icon,
      disable: disable,
      createdAt: s.start_date
    })
  })
  return sco
})

watch(
  () => localRecord.value.service,
  newVal => {
    emit("serviceSelect", newVal)
  }
)

onMounted(() => {
  if (props.service) {
    selectedService.value = props.service
  }
})

function changeService(selSco) {
  selectedService.value = selSco
  emit("serviceSelect", selSco)
}

function setBanner(msg) {
  banner.value = msg
}

function showCreateNew() {
  // this.resetNewContractData()
  showNewForm.value = true
  setBanner("Select stuff...")
}

function hideCreateNew() {
  // this.resetNewContractData()
  showNewForm.value = false
  setBanner(null)
}

function onRequestNewService() {
  alert("onward router to a new service request page!")
}
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
