<template>
  <q-card class="text-white q-pa-sm">
    <q-card-section>
      <div class="text-h5 q-mb-sm text-primary">Apply template to this service</div>
    </q-card-section>
    <q-card-section v-if="!creationSuccess && !creationError">
      <div class="q-mb-sm">
        The template capabilities and outputs will be replaced with current service data
      </div>
      <div>
        After applying the template you will be able to remove any items that you do not require
      </div>
    </q-card-section>
    <q-card-section v-if="creationSuccess">
      <div>
        Template <span class="text-weight-bold text-primary">{{ templateName }}</span> applied successfully
      </div>
    </q-card-section>
    <q-card-section v-else-if="creationError">
      <div class="text-negative">Sorry, there was an error applying the template</div>
    </q-card-section>
    <q-card-section>
      <div class="row items-center justify-end">
        <q-btn
          :label="creationSuccess || creationError ? 'Close' : 'Cancel'"
          color="white"
          outline
          @click="emit(creationSuccess ? 'update' : 'close')"
        />
        <q-btn
          v-if="creationSuccess"
          label="Refresh"
          class="q-ml-sm"
          color="primary"
          text-color="dark"
          @click="emit('update')"
        />
        <q-btn
          v-if="!creationSuccess && !creationError"
          label="Apply Template"
          class="q-ml-sm"
          color="primary"
          text-color="dark"
          @click="onApplyTemplateClicked"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from "vue"
import { useStore } from "vuex"
import { useQuasar } from "quasar"

const quasar = useQuasar()
const store = useStore()
const emit = defineEmits(["close", "update"])
const props = defineProps({
  serviceId: { type: String, default: null },
  templateId: { type: Number },
  organisationId: { type: Number },
  templateName: { type: String }
})

const creationSuccess = ref(false)
const creationError = ref(false)

function onApplyTemplateClicked() {
  //call the API to create the template with the templateName and the serviceId from which to clone the settings
  quasar.loading.show()
  const data = {
    service_id: props.serviceId,
    organisation_id: props.organisationId,
    template_id: props.templateId
  }
  store.dispatch("contract/applyServiceTemplate", data).then(() => {
    creationSuccess.value = true
  }).catch(() => {
    creationError.value = true
  }).finally(() => {
    quasar.loading.hide()
  })
}
</script>
