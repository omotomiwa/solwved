<template>
  <div v-if="hasServiceToDisplay" class="col-xs-12 col-sm-6 col-md-4 col-lg-3 row swlvd-card-row">
    <q-card v-ripple flat class="col column relative-position swlvd-card swlvd-card-bordered">
      <q-card-section>
        <div class="text-h4 text-weight-bold">{{ props.organisation.name }}</div>
      </q-card-section>
      <q-card-section class="text-white items-start q-px-none">
        <q-list>
          <q-item v-for="contract in props.organisation.contracts" :key="contract.id">
            <q-expansion-item
              dense
              dense-toggle
              expand-separator
              class="col-12"
              :disable="getNumber(filterServices(contract.services))<=0"
              popup
            >
              <template v-slot:header>
                <q-item-section>
                  <div class="text-subtitle1">{{ contract.reference }}</div>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption class="text-white">
                    {{ getNumber(filterServices(contract.services)) }} service<span
                    v-if="getNumber(filterServices(contract.services)) !== 1">s</span>
                  </q-item-label>
                </q-item-section>
              </template>
              <q-item-section>
                <q-list>
                  <q-item
                    v-for="service in filterServices(contract.services)"
                    :key="service.id"
                    :to="getServiceLink(service)"
                  >
                    <q-item-section>
                      <q-item-label class="text-white text-subtitle2">{{ service.name }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label caption class="text-white">{{ service.delivery_model.name }}</q-item-label>
                    </q-item-section>
                    <q-item-section avatar>
                      <q-icon color="white" :name="getServiceIcon(service)" size="xs" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-item-section>
            </q-expansion-item>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  organisation: { type: Object, default: null },
  viewingAsType: { type: String, default: null },
  validDeliveryModelIds: { type: Array, default: () => [] },
  validApprovalStatus: { type: Number, default: 1 }
})

const hasServiceToDisplay = computed(() => {
  for (let contract of props.organisation.contracts) {
    if (contract.services.length && filterServices(contract.services).length) {
      return true
    }
  }
  return false
})

function filterServices(services) {
  if (props.validDeliveryModelIds.length) {
    if (props.validApprovalStatus === 0) {
      return services.filter(service =>
        props.validDeliveryModelIds.includes(service.delivery_model_id) &&
        service.approved === 0 &&
        service.ready_for_approval === 1
      )
    } else {
      return services.filter(service =>
        props.validDeliveryModelIds.includes(service.delivery_model_id) &&
        service.approved === 1
      )
    }
  } else {
    if (props.validApprovalStatus === 0) {
      return services.filter(service => service.approved === 0 && service.ready_for_approval === 1)
    } else {
      return services.filter(service => service.approved === 1)
    }
  }
}

function getNumber(a) {
  if (a && a.length) {
    return a.length
  }
  return 0
}

function getServiceLink(service) {
  const serviceId = service.id
  /*
  if (service.delivery_model_id > 2 && props.viewingAsType == "customer") {
    return null
  }
  */
  if (props.validApprovalStatus === 0) {
    return "service-approvals/" + String(serviceId)
  }
  return "active-services/" + String(serviceId)
}

function getServiceIcon(service) {
  if (props.viewingAsType === "vendor") {
    return "manage_accounts"
  } else if (props.viewingAsType === "customer") {
    if (service.delivery_model_id > 2) {
      return "visibility"
    } else {
      return "visibility"
    }
  }
}
</script>
