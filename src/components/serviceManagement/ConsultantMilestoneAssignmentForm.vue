<template>
  <div>
    <q-form v-if="showForm" class="row items-center q-col-gutter-sm" @submit="assignEngagement">
      <new-selector-form
        classes="col-12 col-sm-4 col-md-3"
        v-model:option_id="selectedEngagement"
        :label="OrganisationTypeMethods.changeConsultant(isBuiltEnvironment)+' Engagement'"
        is-clearable
        dense
        is-filterable
        :options="allServiceEngagements"
        filter-key="name"
        default-class="full-width"
        autofocus
        :is-emit-value="false"
      >
        <template v-slot:option="{ option, events }">
          <q-item v-bind="events" class="q-py-sm">
            <q-item-section>
              <q-item-label>{{ option.name }}</q-item-label>
              <q-item-label caption>
                {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, option.charge_rate) }} / day
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </new-selector-form>
      <q-input
        v-model="units"
        class="col-12 col-sm-4 col-md-3"
        dense
        outlined
        stack-label
        label-color="white"
        color="primary"
        type="number"
        label="Units assigned to this milestone"
      />
      <currency-input
        class="col-12 col-sm-4 col-md-3"
        dense
        label="Budget"
        :model-value="parseFloat(calculatedBudget ?? 0)"
        :prefix="currency_symbol"
        disable
      />
      <div class="col-12 col-sm-12 col-md-3">
        <q-btn
          label="Assign"
          icon="person_add"
          color="primary"
          text-color="dark"
          size="sm"
          :disable="!allowAssignEngagement"
          type="submit"
        />
        <q-btn
          class="q-ml-sm"
          label="Cancel"
          color="white"
          outline
          size="sm"
          @click="showForm = false"
        />
      </div>
    </q-form>
    <div v-if="!showForm && props.engagements.length">
      <q-btn
        label="Assign Engagement"
        icon="person_add"
        color="primary"
        text-color="dark"
        @click="showForm = true"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { useStore } from "vuex"
import { Config } from "src/modules/StaticData.js"
import { CurrencyMethods } from "src/modules/GlobalMethods.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import CurrencyInput from "src/components/CurrencyInput.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

const emit = defineEmits(["submit"])

const props = defineProps({
  request: { type: Object, default: () => ({}) },
  service: { type: Object, default: () => ({}) },
  engagements: { type: Array, default: () => [] },
  milestone: { type: Object, default: () => ({}) }
})

const store = useStore()

const showForm = ref(false)
const selectedEngagement = ref(null)
const units = ref(0)

const organisation = computed(() => store.getters["admin/getOrganisation"])
const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const currency_symbol = computed(() => organisation.value?.currency?.symbol ?? Config.CURRENCY_SYMBOL)
const allowAssignEngagement = computed(() => selectedEngagement.value !== null && units.value !== 0)
const calculatedBudget = computed(() => {
  let b = 0
  if (selectedEngagement.value) {
    b = selectedEngagement.value.charge_rate * units.value
  }
  return b
})
const allServiceEngagements = computed(() => {
  const a = []
  props.engagements.forEach(engagement => {
    const obj = {
      id: engagement.id,
      name: engagement.consultant.user.fullName,
      charge_rate: engagement.charge_rate,
      units: engagement.units,
      competency: engagement.competency.name,
      capability: engagement.request_capability.capability.name
    }

    obj.name = [
      obj.name,
      obj.capability,
      props.service?.has_competency ? obj.competency : null
    ].filter(v => v).join(" | ")

    a.push(obj)
  })
  return a
})

function assignEngagement() {
  const obj = {
    engagement_id: selectedEngagement.value.id,
    milestone_id: props.milestone.id,
    /* budget: selectedEngagement.value.charge_rate * units.value, */
    units: units.value
  }
  emit("submit", JSON.parse(JSON.stringify(obj)))
  resetFormFields()
  showForm.value = false
}

function resetFormFields() {
  selectedEngagement.value = null
  units.value = 0
}
</script>
