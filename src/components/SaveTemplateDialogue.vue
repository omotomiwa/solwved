<template>
  <q-card class="text-white q-pa-md">
    <q-card-section>
      <div class="text-h5 q-mb-sm text-primary">Save this service as a template</div>
      <div v-if="!creationSuccess && !creationError">
        <div>
          All capabilities, outputs, and sub outputs will be stored as a template.
        </div>
        <div>
          You will be able use any of your saved templates to prepopulate other services that you create.
        </div>
      </div>
    </q-card-section>
    <q-card-section v-if="creationSuccess">
      <div>
        Template <span class="text-weight-bold">{{ templateName }}</span> created successfully
      </div>
      <div>
        This template is now available to select whenever you create a new service
      </div>
    </q-card-section>
    <q-card-section v-else-if="creationError">
      <div class="text-negative">Sorry, there was an error creating the template</div>
    </q-card-section>
    <q-card-section v-else>
      <div>Please give your template a name</div>
      <q-input
        v-model="templateName"
        label-color="white"
        color="primary"
        class="q-mt-sm"
        outlined
      />
    </q-card-section>
    <q-card-section>
      <div class="row items-center justify-end">
        <q-btn
          :label="creationSuccess || creationError ? 'Close' : 'Cancel'"
          color="white"
          outline
          @click="emit('close')"
        />
        <q-btn
          v-if="!creationSuccess && !creationError"
          label="Save"
          class="q-ml-sm"
          color="primary"
          text-color="dark"
          @click="onSaveTemplateClicked"
          :disable="templateName.trim().length < 3"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from "vue"
import { useStore } from "vuex"

const store = useStore()

const props = defineProps({
  serviceId: { type: String, default: null },
  organisationId: { type: Number }
})

const emit = defineEmits(["close"])

const templateName = ref("")
const creationSuccess = ref(false)
const creationError = ref(false)

function onSaveTemplateClicked() {
  //call the API to create the template with the templateName and the serviceId from which to clone the settings
  const data = {
    service_id: parseInt(props.serviceId),
    organisation_id: parseInt(props.organisationId),
    name: (templateName.value ?? '').trim()
  }
  store.dispatch("contract/createTemplateFromService", data).then(() => {
    creationSuccess.value = true
  }).catch(() => {
    alert("Error creating template")
    creationError.value = true
  })
}
</script>
