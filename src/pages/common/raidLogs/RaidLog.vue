<template>
  <q-page :class="cc?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="full-width">
        <div class="text-h2 text-weight-bold text-center text-white">
          {{ OrganisationTypeMethods.changeRaid(isBuiltEnvironment) }} Log
        </div>
        <BreadCrumb v-if="organisation" :organisation="organisation" />
        <div v-if="isAuthorised" class="column q-mt-lg">
          <div class="row">
            <q-form class="full-width" @reset="onReset" @submit="onSubmit">
              <q-splitter
                v-model="splitter.span"
                :limits="splitter.limit"
                :disable="splitter.disabled"
                :separator-class="splitter.disabled ? 'bg-transparent' : 'bg-primary'"
                separator-style="width: 3px"
              >

                <template v-slot:before>
                  <div v-if="allowEdit" class="row q-col-gutter-sm">
                    <div class="col-12" v-if="props.raid_log_id === 'new'">
                      <div class="row">
                        <new-selector-form
                          v-model:option_id="otherOrg"
                          :options="organisations"
                          :label="otherOrganisationLabel"
                          is-filterable
                          filter-key="name"
                          default-class="full-width"
                          autofocus
                          classes="col-4"
                        />
                      </div>
                      <div class="col-12 q-mt-md" v-if="formOk">
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            Select {{ OrganisationTypeMethods.changeRaid(isBuiltEnvironment) }} Criteria
                          </div>
                          <new-selector-form
                            v-model:option_id="selectedContract"
                            :options="contracts"
                            classes="col-12 col-sm-6 col-lg-4"
                            label="Contract"
                            is-filterable
                            filter-key="reference"
                            option-label="reference"
                            default-class="full-width"
                          />
                          <new-selector-form
                            v-model:option_id="selectedService"
                            :options="services"
                            classes="col-12 col-sm-6 col-lg-4"
                            label="Service"
                            is-filterable
                            filter-key="name"
                            default-class="full-width"
                            is-option-customisable
                          >
                            <template v-slot:option="{option, events}">
                              <q-item v-bind="events">
                                <q-item-section>
                                  {{ option.name }}
                                  <sub class="text-primary">{{ option.delivery_model.name }}</sub>
                                </q-item-section>
                              </q-item>
                            </template>
                          </new-selector-form>
                          <new-selector-form
                            v-if="selectedConsultantVisible"
                            v-model:option_id="selectedConsultant"
                            :options="consultants"
                            classes="col-12 col-sm-6 col-lg-4"
                            :label="OrganisationTypeMethods.changeConsultant(isBuiltEnvironment)"
                            is-filterable
                            filter-key="name"
                            default-class="full-width"
                          />
                          <new-selector-form
                            v-if="selectedServiceLineVisible"
                            v-model:option_id="selectedServiceLine"
                            :options="serviceLines"
                            classes="col-12 col-sm-6 col-lg-4"
                            label="Service Line"
                            is-filterable
                            filter-key="name"
                            default-class="full-width"
                          />
                          <q-input
                            v-model="raidLog.title"
                            class="col-12"
                            columns="80"
                            filled
                            label="Title"
                            rows="1"
                            type="textarea"
                            label-color="white"
                            color="primary"
                          />
                          <q-input
                            v-model="raidLog.description"
                            class="col-12"
                            columns="80"
                            filled
                            label="Description"
                            rows="4"
                            type="textarea"
                            label-color="white"
                            color="primary"
                          />
                          <q-input
                            v-model="raidLog.cause"
                            class="col-12"
                            columns="80"
                            filled
                            label="Cause"
                            rows="4"
                            type="textarea"
                            label-color="white"
                            color="primary"
                          />
                          <new-selector-form
                            v-model:option_id="selectedType"
                            :disabled="!isBuiltEnvironment"
                            :options="types"
                            classes="col-12 col-sm-6 col-lg-4"
                            label="Type"
                            is-filterable
                            filter-key="name"
                            default-class="full-width"
                          />
                          <new-selector-form
                            v-model:option_id="selectedCategory"
                            :options="categorys"
                            classes="col-12 col-sm-6 col-lg-4"
                            label="Category"
                            is-filterable
                            filter-key="name"
                            default-class="full-width"
                          />
                          <new-selector-form
                            v-model:option_id="selectedImpact"
                            :options="impacts"
                            classes="col-12 col-sm-6 col-lg-4"
                            label="Impact"
                            is-filterable
                            filter-key="name"
                            default-class="full-width"
                          />
                          <div class="col-12">
                            <div class="q-py-sm"
                                 :class="{'field-bg-dark': $q.dark.isActive, 'field-bg-light': !$q.dark.isActive}">
                              <div class="row q-col-gutter-lg-x-sm items-center" style="margin: 0 !important;">
                                <span class="col-2">Impact Score</span>
                                <q-btn-toggle
                                  v-model="raidLog.impact_score"
                                  :options="arrayImpactScore"
                                  glossy
                                  push
                                  class="no-box-shadow col-auto"
                                  color="grey-5"
                                  text-color="dark"
                                  toggle-color="primary"
                                  toggle-text-color="dark"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="col-12">
                            <div class="q-py-sm"
                                 :class="{'field-bg-dark': $q.dark.isActive, 'field-bg-light': !$q.dark.isActive}">
                              <div class="row q-col-gutter-lg-x-sm items-center" style="margin: 0 !important;">
                                <span class="col-2">Probability Score</span>
                                <q-btn-toggle
                                  v-model="raidLog.probability_score"
                                  :options="arrayProbabilityScore"
                                  glossy
                                  push
                                  class="no-box-shadow"
                                  color="grey-5"
                                  text-color="dark"
                                  toggle-color="primary"
                                  toggle-text-color="dark"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="col-12">
                            <div class="q-py-sm"
                                 :class="{'field-bg-dark': $q.dark.isActive, 'field-bg-light': !$q.dark.isActive}">
                              <div class="row q-col-gutter-lg-x-sm items-center" style="margin: 0 !important;">
                                <span class="col-2">Visibility</span>
                                <q-btn-toggle
                                  v-model="raidLog.internal"
                                  :options="arrayInternal"
                                  glossy
                                  push
                                  class="no-box-shadow"
                                  color="grey-5"
                                  text-color="dark"
                                  toggle-color="primary"
                                  toggle-text-color="dark"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="col-12">
                            <div class="q-py-sm"
                                 :class="{'field-bg-dark': $q.dark.isActive, 'field-bg-light': !$q.dark.isActive}">
                              <div class="row q-col-gutter-lg-x-sm items-center" style="margin: 0 !important;">
                                <span class="col-2">Attachment</span>
                                <media-widget
                                  v-model="raidLog.attachment"
                                  allow-new-upload
                                  :show-delete="false"
                                  @createMedia="onCreateMedia"
                                  @deleteMedia="onDeleteMedia(raidLog.attachment)" />
                              </div>
                            </div>
                          </div>

                          <div class="col-12">
                            <q-btn
                              :disable="!(canSubmit || canUpdate)"
                              :loading="submitting"
                              text-color="dark"
                              color="primary"
                              :label="isEditing ? 'Update' : 'Submit'"
                              type="submit"
                            >
                              <template v-slot:loading>
                                <q-spinner-pie />
                              </template>
                            </q-btn>
                            <q-btn
                              :loading="resetting"
                              class="q-ml-sm"
                              color="primary"
                              icon="layers_clear"
                              label="Reset"
                              type="reset"
                              outline
                            >
                              <template v-slot:loading>
                                <q-spinner-grid />
                              </template>
                            </q-btn>
                            <q-btn
                              :loading="closing"
                              color="white"
                              class="q-ml-sm"
                              outline
                              :label="isEditing ? 'Go Back' : 'Cancel'"
                              @click.stop="close"
                            >
                              <template v-slot:loading>
                                <q-spinner-box />
                              </template>
                            </q-btn>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="q-pa-md">
                    <table style="width: 100%" class="table-info">
                      <tbody>
                      <tr v-if="organisationType === 'vendor'">
                        <td class="infos">Customer</td>
                        <td>
                          {{ raidLogStore?.service?.contract?.customer?.name ?? "-" }}
                        </td>
                      </tr>
                      <tr v-if="organisationType === 'customer'">
                        <td class="infos">Customer</td>
                        <td>
                          {{ raidLogStore?.service?.contract?.vendor?.name ?? "-" }}
                        </td>
                      </tr>
                      <tr>
                        <td class="infos">Contract</td>
                        <td>
                          {{ raidLogStore?.service?.contract?.reference ?? "-" }}
                        </td>
                      </tr>
                      <tr>
                        <td class="infos">Service</td>
                        <td>
                          {{ raidLogStore?.service?.name ?? "-" }}
                        </td>
                      </tr>
                      <tr v-if="raidLogStore.service_line_id">
                        <td class="infos">Service Line</td>
                        <td>
                          {{ raidLogStore?.service_line?.name ?? "-" }}
                        </td>
                      </tr>
                      <tr v-if="raidLogStore.consultant_id">
                        <td class="infos">{{ OrganisationTypeMethods.changeConsultant(isBuiltEnvironment) }}</td>
                        <td>
                          {{ raidLogStore?.consultant?.name ?? "-" }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <q-separator class="q-my-sm" />
                        </td>
                      </tr>
                      <tr>
                        <td class="infos">Title</td>
                        <td>
                          {{ raidLogStore?.title ?? "-" }}
                        </td>
                      </tr>
                      <tr>
                        <td class="infos">Description</td>
                        <td>
                          <text-with-show-more :text="raidLogStore?.description ?? '-'" />
                        </td>
                      </tr>
                      <tr>
                        <td class="infos">Cause</td>
                        <td>
                          <text-with-show-more :text="raidLogStore?.cause ?? '-'" />
                        </td>
                      </tr>
                      <tr>
                        <td class="infos">Type</td>
                        <td>
                          {{ raidLogStore?.type?.name ?? "-" }}
                        </td>
                      </tr>
                      <tr>
                        <td class="infos">Category</td>
                        <td>
                          {{ raidLogStore?.category?.name ?? "-" }}
                        </td>
                      </tr>
                      <tr>
                        <td class="infos">Impact</td>
                        <td>
                          {{ raidLogStore?.impact?.name ?? "-" }}
                        </td>
                      </tr>
                      <tr>
                        <td class="infos">Impact Score</td>
                        <td>
                          <q-chip square color="primary" text-color="dark">
                            {{ raidLogStore?.impact_score ?? 1 }}
                          </q-chip>
                        </td>
                      </tr>
                      <tr>
                        <td class="infos">Probability Score</td>
                        <td>
                          <q-chip square color="primary" text-color="dark" :icon="currentProbability?.icon">
                            {{ currentProbability?.label }}
                          </q-chip>
                        </td>
                      </tr>
                      <tr>
                        <td class="infos">Visibility</td>
                        <td>
                          <q-chip square color="primary" text-color="dark" :icon="currentVisibility?.icon">
                            {{ currentVisibility?.label }}
                          </q-chip>
                        </td>
                      </tr>
                      <tr>
                        <td class="infos">Attachment</td>
                        <td>
                          <media-widget
                            v-if="raidLogStore?.attachment?.id"
                            v-model="raidLogStore.attachment"
                            :allow-new-upload="false"
                            :show-delete="false"
                            @createMedia="onCreateMedia"
                            @deleteMedia="onDeleteMedia(raidLog.attachment)" />
                          <div v-else class="text-caption disabled">No attachment</div>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </template>

                <template v-slot:separator v-if="!splitter.disabled">
                  <q-avatar color="primary" text-color="dark" size="28px" title="Move to resize"
                            icon="drag_indicator" />
                </template>

                <template v-slot:after>
                  <div class="q-pa-md">
                    <q-virtual-scroll
                      ref="virtualListRef"
                      style="max-height: 60vh"
                      :virtual-scroll-slice-size="10"
                      :virtual-scroll-slice-ratio-before="10"
                      :items="(raidLogStore?.notes ?? [])"
                    >
                      <template v-slot:before>
                        <q-chat-message class="q-py-xl" v-if="(raidLogStore?.notes ?? []).length === 0"
                                        label="No message found" />
                      </template>
                      <template v-slot="{ item: note, index }">
                        <message-with-skeleton
                          :key="note?.id"
                          class="q-ma-md"
                          :note="note"
                          :index="index"
                          :send="note?.is_from_vendor"
                        />
                      </template>
                      <template v-slot:after>
                        <div class="q-ma-none q-pa-md sticky-bottom">
                          <div class="scroll-to-bottom">
                            <q-btn
                              v-if="showScrollToBottomBtn"
                              rounded
                              no-caps
                              no-wrap
                              class="scroll-to-bottom-btn"
                              color="primary"
                              text-color="dark"
                              size="sm"
                              @click="scrollToChatBottom"
                            >
                              <q-icon name="keyboard_arrow_down" size="sm" />
                              Jump to bottom
                            </q-btn>
                          </div>
                          <q-input
                            v-model="raidLog.note"
                            class="q-pt-sm"
                            label-color="white"
                            color="primary"
                            label="Type a new message"
                            type="textarea"
                            filled
                            autogrow
                            dense
                            stack-label
                            input-style="max-height: 100px"
                          />
                          <div class="q-my-xs q-py-sm rounded-borders"
                               :class="$q.dark.isActive ? 'field-bg-dark' : 'field-bg-light'"
                          >
                            <span class="q-mx-sm q-mb-xs text-caption">Status</span>
                            <q-btn-toggle
                              v-model="raidLog.status_id"
                              :options="newstatuses"
                              class="q-mx-sm"
                              color="grey-5"
                              text-color="dark"
                              toggle-color="primary"
                              toggle-text-color="dark"
                              push glossy dense
                            />
                          </div>
                          <p class="text-caption">
                            NB if you are updating the status, you must also include a note before submitting.
                          </p>
                          <div class="q-my-xs q-pa-sm rounded-borders"
                               :class="$q.dark.isActive ? 'field-bg-dark' : 'field-bg-light'"
                          >
                            <div class="flex">
                              <label class="q-mx-sm q-mb-xs text-caption q-mt-sm">Attach Files</label>
                              <multiple-media-widget
                                v-model="raidLog.note_attachments"
                                :extra-data="noteAttachment"
                                :accept="noteAttachment.accept"
                                :extensions="noteAttachment.accept"
                                class="q-mx-sm"
                                :max-height="100"
                                dense
                                show-delete
                                @createMedia="onCreateMultipleMedia"
                                @deleteMedia="onCreateMultipleMedia"
                              />
                            </div>
                          </div>

                          <div>
                            <div class="row q-gutter-sm">
                              <q-btn
                                label="Submit"
                                :loading="submitting"
                                :disable="!canSubmit || submitting"
                                type="submit"
                                color="primary"
                                text-color="dark"
                              >
                                <template v-slot:loading>
                                  <q-spinner-pie />
                                </template>
                              </q-btn>
                              <q-btn
                                label="Back"
                                :loading="closing"
                                @click.stop="close"
                                color="white"
                                outline
                              >
                                <template v-slot:loading>
                                  <q-spinner-box />
                                </template>
                              </q-btn>
                            </div>
                          </div>
                        </div>
                        <q-scroll-observer @scroll="scrollHandler" />
                      </template>
                    </q-virtual-scroll>
                  </div>
                </template>

              </q-splitter>
            </q-form>
          </div>
        </div>
        <div v-else class="text-negative hidden q-my-lg">You are not authorised to view this page</div>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "RaidLog",
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup>
import { QChatMessage, useQuasar } from "quasar"
import { computed, onMounted, watch, ref, nextTick } from "vue"
import { useStore } from "vuex"
import { useRoute, useRouter } from "vue-router"
import { ClassCombinations } from "src/modules/StaticData.js"
import { vendorAuth, customerAuth } from "src/modules/AuthLogic.js"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"
import { ObjectMethods } from "src/modules/GlobalMethods.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"
import MediaWidget from "components/MediaWidget.vue"
import MultipleMediaWidget from "components/MultipleMediaWidget.vue"
import MessageWithSkeleton from "components/common/chat/MessageWithSkeleton.vue"
import TextWithShowMore from "components/common/text/TextWithShowMore.vue"

const $q = useQuasar()
const store = useStore()
const route = useRoute()
const router = useRouter()

const arrayProbabilityScore = [
  { value: 1, label: "Low", icon: "directions_walk" },
  { value: 2, label: "Moderate", icon: "directions_run" },
  { value: 3, label: "High", icon: "flight" },
  { value: 4, label: "Very High", icon: "rocket" }
]

const arrayImpactScore = [
  { value: 1, label: 1 },
  { value: 2, label: 2 },
  { value: 3, label: 3 },
  { value: 4, label: 4 },
  { value: 5, label: 5 }
]

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null },
  raid_log_id: { type: String, default: null }
})

const emit = defineEmits(["update", "close"])

const mounted = ref(false)
const organisationType = ref(null)
const otherOrganisationType = ref(null)
const otherOrganisationLabel = ref(null)
const organisationId = ref(null)
const submitting = ref(false)
const resetting = ref(false)
const closing = ref(false)
const loading = ref(["mount", "org"])
const showScrollToBottomBtn = ref(false)

const actionAttachmentListKey = ref(0)

const selectedCustomer = ref(false)
const selectedVendor = ref(false)
const selectedContract = ref(null)
const selectedService = ref(null)
const selectedServiceLine = ref(0)
const selectedConsultant = ref(0)

const selectedType = ref(0)
const selectedCategory = ref(0)
const selectedImpact = ref(0)
const selectedStatus = ref(0)
const selectedOutcome = ref(0)

const allowEdit = ref(true)
const allowEditExtra = ref(false)
const allowViewExtra = ref(true)

const routeParams = ref({
  customerId: null,
  contractId: null,
  serviceId: null
})

const splitter = ref({
  span: 50,
  disabled: false,
  limit: [40, 60]
})

const virtualListRef = ref(null)

const otherOrg = ref(null)

const raidLog = ref({
  id: null,
  customer_id: null,
  service_id: null,
  service_line_id: null,
  consultant_id: null,
  title: "",
  description: "",
  cause: "",
  internal: true,
  impact_score: 1,
  impact_id: 1,
  probability_score: null,
  actions: "",
  status_id: 1,
  outcome_id: null,
  organisation_id: null,
  attachment: {
    metadata: "attachment"
  },
  action_attachment: {
    metadata: "action_attachment"
  },
  action_attachment_list: [],
  fileList: {
    delete: { attachment: [], action_attachment: [] }
  },
  note: "",
  note_attachments: []
})

const fileList = ref({
  delete: { attachment: [], action_attachment: [] }
})

let organisation
let isAuthorised
if (props.vendor_id) {
  const obj = vendorAuth(props.vendor_id)
  organisation = obj.vendor
  isAuthorised = obj.isAuthorised
} else if (props.customer_id) {
  const obj = customerAuth(props.customer_id)
  organisation = obj.customer
  isAuthorised = obj.isAuthorised
}

onMounted(() => {
  onDeleteMedia(raidLog.value.attachment)
  onDeleteMedia(raidLog.value.action_attachment)
  store.dispatch(
    "common/getSelectors",
    { model: "raidlog" }
  )
  mounted.value = true
  organisationType.value = props.customer_id ? "customer" : "vendor"
  otherOrganisationType.value = !props.customer_id ? "Customer" : "Vendor"
  otherOrganisationLabel.value = "Select " + otherOrganisationType.value

  if (props.vendor_id) {
    organisationType.value = "vendor"
    organisationId.value = props.vendor_id
  }

  if (props.customer_id) {
    organisationType.value = "customer"
    organisationId.value = props.customer_id
  }

  if (organisationId.value) {
    raidLog.value.attachment.organisation_id = organisationId.value
    raidLog.value.action_attachment.organisation_id = organisationId.value
  }

  // If there is a service_id param use it to init the selects
  routeParams.value = {
    customerId: route.query.customer_id ? parseInt(route.query.customer_id) : null,
    contractId: route.query.contract_id ? parseInt(route.query.contract_id) : null,
    serviceId: route.query.service_id ? parseInt(route.query.service_id) : null
  }

  if (props.raid_log_id === "new") {
    splitter.value = {
      span: 100,
      disabled: true,
      limit: [40, 100]
    }
    allowEdit.value = true
    allowViewExtra.value = false
    onReset()
    getContracts() //only do this call if create a new entry
  } else {
    store.dispatch("common/getRaidLog", props.raid_log_id)
    allowEdit.value = false
    allowEditExtra.value = true
  }
  raidLog.value.organisation_id = organisationId.value
  loader("mount", "remove")
})

const noteAttachment = computed(() => {
  return {
    organisation_id: organisationId.value,
    name: "raidlog",
    model_id: props.raid_log_id,
    model: "raid_log",
    metadata: "note_attachment",
    accept: ".png, .jpg, .jpeg, .webp, .svg, .gif, .pdf, .doc, .docx, .xls, .xlsx"
  }
})
const isBuiltEnvironment = computed(() => store.getters["admin/getIsBuiltEnvironment"])
const isEditing = computed(() => props.raid_log_id !== "new")
const dataReady = computed(() => {
  return mounted.value && (
    selectedCustomer.value ||
    selectedVendor.value ||
    (customers.value.length > 0 && contracts.value.length > 0)
  )
})
const cc = computed(() => ClassCombinations)
const selectors = computed(() => store.getters["common/getSelectors"])
const raidLogStore = computed(() => {
  let data = {}
  if (props.raid_log_id !== "new") {
    data = ObjectMethods.decouple(store.getters["common/getRaidLog"])
  }
  if ("notes" in data) {
    data.notes = (data.notes ?? []).map(note => {
      let files = []
      files.push(...(note?.attachments ?? []))
      files.push(...(note?.meta_attachments ?? []))
      files = files.filter(val => val)

      return {
        ...note,
        files: files
      }
    })
  }
  return data
})
const formOk = computed(() => contracts.value.length && (selectedCustomer.value || selectedVendor.value))
const statuses = computed(() => selectors.value.statuses)
const newstatuses = computed(() => {
  const ns = []
  if (statuses.value && statuses.value.length) {
    statuses.value.forEach(s => {
      ns.push({
        value: s.id,
        label: s.name
      })
    })
  }
  return ns
})
const types = computed(() => selectors.value.types)
const categorys = computed(() => selectors.value.categorys)
const impacts = computed(() => selectors.value.impacts)
const outcomes = computed(() => selectors.value.outcomes)
const newoutcomes = computed(() => {
  const ns = []
  outcomes.value.forEach(s => {
    ns.push({
      value: s.id,
      label: s.name
    })
  })
  return ns
})
const arrayInternal = computed(() => {
  const ai = []
  ai.push(
    { value: false, label: "Customer & Vendor", icon: "public" },
    { value: true, label: organisationType.value, icon: "check" }
  )

  return ai
})
const currentProbability = computed(() => (arrayProbabilityScore ?? []).find(val => val.value === (raidLogStore.value?.probability_score ?? 1)))
const currentVisibility = computed(() => (arrayInternal.value ?? []).find(val => val.value === (!!raidLogStore.value?.internal)))
const canSubmit = computed(() => !!(
  (raidLog.value.title || "").trim() &&
  (raidLog.value.description || "").trim() &&
  (raidLog.value.cause || "").trim()
))
const canUpdate = computed(() => !!(raidLog.value.note || "").trim())
const consultants = computed(() => {
  const d = { id: 0, name: "n/a" }
  const c = store.getters["common/getServiceConsultantEngagements"]
  return [d, ...c]
})
const allContracts = computed(() => store.getters["contract/getContracts"])
const customers = computed(() => {
  const c = []
  const ids = []
  allContracts.value.forEach(contract => {
    const customer = contract.customer
    if (!ids[customer.id]) {
      c.push({
        id: customer.id,
        name: customer.name
      })
    }
    ids[customer.id] = 1
  })
  return c
})
const vendors = computed(() => {
  const c = []
  const ids = []
  allContracts.value.forEach(contract => {
    const vendor = contract.vendor
    if (!ids[vendor.id]) {
      c.push({
        id: vendor.id,
        name: vendor.name
      })
    }
    ids[vendor.id] = 1
  })
  return c
})
const organisations = computed(() => {
  let orgs = []
  if (props.vendor_id) {
    orgs = [...customers.value]
  }

  if (props.customer_id) {
    orgs = [...vendors.value]
  }

  return orgs
})
const contracts = computed(() => {
  const cs = []
  if (props.customer_id) {
    if (selectedVendor.value !== false) {
      const c = allContracts.value.find(contract => contract.vendor_id === selectedVendor.value)
      cs.push(c)
    }
  }
  if (props.vendor_id) {
    if (selectedCustomer.value !== false) {
      const c = allContracts.value.find(contract => contract.customer_id === selectedCustomer.value)
      cs.push(c)
    }
  }
  return cs
})
const services = computed(() => {
  let cs = []
  if (selectedContract.value) {
    const s = contracts.value.find(contract => contract.id === selectedContract.value)
    if (s && s.services) {
      cs = s.services
    }
  }
  return cs
})
const serviceLines = computed(() => {
  let sl = []
  if (selectedService.value) {
    if (services.value.length) {
      const s = services.value.find(service => service.id === selectedService.value)
      sl = s.service_lines ? s.service_lines : []
    }
  }
  return sl
})
const selectedServiceRecord = computed(() => {
  return selectedService.value
    ? services.value.find(service => service.id === selectedService.value)
    : {}
})
const raidLogLink = computed(() => {
  return "/" + organisationType.value + "/" + organisationId.value + "/service-management/raid"
})
const selectedServiceLineVisible = computed(() => {
  return selectedServiceRecord.value && selectedServiceRecord.value?.delivery_model?.name === "Professional Services"
})
const selectedConsultantVisible = computed(() => {
  return selectedServiceRecord.value && selectedServiceRecord.value?.delivery_model?.name === "Contingent Labour"
})

watch(dataReady, newVal => {
  if (newVal) {
    $q.loading.hide()
  }
})
watch(otherOrg, newVal => {
  onSelectOrg(newVal)
})
watch(organisations, newVal => {
  if (routeParams.value?.customerId && newVal.filter(val => val.id === routeParams.value?.customerId).length > 0) {
    otherOrg.value = routeParams.value?.customerId
  }
})
watch(contracts, newVal => {
  if (routeParams.value?.contractId && newVal.filter(val => val.id === routeParams.value?.contractId).length > 0) {
    selectedContract.value = routeParams.value?.contractId
  } else {
    setFirstItem(selectedContract, newVal)
  }
})
watch(allContracts, newVal => {
  setFirstItem(selectedContract, newVal)
})
watch(services, newVal => {
  if (routeParams.value?.serviceId && newVal.filter(val => val.id === routeParams.value?.serviceId).length > 0) {
    selectedService.value = routeParams.value?.serviceId
  } else {
    setFirstItem(selectedService, newVal)
    selectedServiceLine.value = 0
    selectedConsultant.value = consultants.value[0]
    selectedServiceLine.value = 1
  }
})
watch(selectedConsultantVisible, newVal => {
  if (newVal) {
    //we need to load the consultants engaged on this service
    store.dispatch("common/getServiceConsultantEngagements", selectedService.value)
  }
})
watch(consultants, newVal => {
  setFirstItem(selectedConsultant, newVal)
})
watch(serviceLines, newVal => {
  setFirstItem(selectedServiceLine, newVal)
})
watch(statuses, newVal => {
  setFirstItem(selectedStatus, newVal)
})
watch(types, newVal => {
  setFirstItem(selectedType, newVal)
})
watch(categorys, newVal => {
  setFirstItem(selectedCategory, newVal)
})
watch(impacts, newVal => {
  setFirstItem(selectedImpact, newVal)
})
watch(outcomes, newVal => {
  setFirstItem(selectedOutcome, newVal)
})
watch(raidLogStore, () => {
  //set the selected values for the form
  selectedCustomer.value = raidLogStore.value.service.contract.customer.id
  selectedVendor.value = raidLogStore.value.service.contract.vendor.id

  if (props.vendor_id) {
    otherOrg.value = selectedCustomer.value
  } else if (props.customer_id) {
    otherOrg.value = selectedVendor.value
  }

  // copy all the values from the store to a local record for editing
  raidLog.value.id = raidLogStore.value.id
  raidLog.value.title = raidLogStore.value.title
  raidLog.value.description = raidLogStore.value.description
  raidLog.value.cause = raidLogStore.value.cause
  raidLog.value.type_id = raidLogStore.value.type_id
  raidLog.value.category_id = raidLogStore.value.category_id
  raidLog.value.impact_id = raidLogStore.value.impact_id
  raidLog.value.impact_score = raidLogStore.value.impact_score
  raidLog.value.probability_score = raidLogStore.value.probability_score
  raidLog.value.status_id = raidLogStore.value.status_id
  raidLog.value.actions = raidLogStore.value.actions
  raidLog.value.outcome_id = raidLogStore.value.outcome_id
  raidLog.value.organisation_id = organisationId.value

  raidLog.value.attachment = raidLogStore.value.attachment
  raidLog.value.action_attachment = raidLogStore.value.action_attachment
  raidLog.value.action_attachment_list = raidLogStore.value.action_attachment_list
  raidLog.value.fileList = []
  raidLog.value.note_attachments = []

  if (raidLogStore.value.status.name === "Closed") {
    allowEditExtra.value = false
    allowViewExtra.value = true
  }
})
watch(loading, newVal => {
  if (newVal.length > 0) {
    $q.loading.show()
  } else {
    $q.loading.hide()
  }
})

watch(
  raidLog.value.action_attachment_list,
  () => {
    actionAttachmentListKey.value = actionAttachmentListKey.value + 1
  },
  { deep: true }
)

watch(() => raidLogStore.value?.notes,
  (val, oldVal) => {
    setTimeout(() => {
      nextTick(scrollToChatBottom)
    }, 2000 + (80 * Math.abs((val ?? []).length - (oldVal ?? []).length)))
  },
  { deep: true }
)

function scrollToChatBottom() {
  nextTick(() => {
    if (virtualListRef.value?.$el) {
      const container = virtualListRef.value.$el
      const startPosition = container.scrollTop
      const targetPosition = container.scrollHeight - container.clientHeight
      const duration = 500 // Adjust for smoother effect

      let startTime = null

      const animation = currentTime => {
        if (!startTime) startTime = currentTime
        const timeElapsed = currentTime - startTime
        const progress = Math.min(timeElapsed / duration, 1)

        container.scrollTop = startPosition + (targetPosition - startPosition) * progress

        if (timeElapsed < duration) {
          requestAnimationFrame(animation)
        }
      }
      showScrollToBottomBtn.value = false
      requestAnimationFrame(animation)
    }
  })
}

function scrollHandler(details) {
  if (details.direction === "up") showScrollToBottomBtn.value = true
}

function loader(module, type = "add") {
  if (type === "add") {
    loading.value.push(module)
    loading.value = [...new Set(loading.value)]
  } else {
    loading.value = loading.value.filter(val => val !== module)
  }
}

function setFirstItem(dataVar, a) {
  if (a.filter(val => val).length) {
    dataVar.value = a[0].id
  }
}

function onSelectOrg(orgId) {
  otherOrg.value = orgId
  selectedContract.value = null
  if (props.customer_id) selectedVendor.value = orgId
  if (props.vendor_id) selectedCustomer.value = orgId
  //store.dispatch("common/getSelectors", { model: "raidlog" })
}

function getContracts() {
  const obj = {}
  if (organisationType.value === "vendor") {
    obj.vendorId = props.vendor_id
    obj.customerId = otherOrg.value
  } else {
    obj.customerId = props.customer_id
    obj.vendorId = otherOrg.value
  }
  obj.include = "services.requests.consultant_engagements.consultant,vendor,customer,services.delivery_model,services.requests,services.service_lines,customer_contract_owner,vendor_contract_owner"
  store.dispatch("contract/viewContracts", obj).catch(e => {
    $q.notify({
      color: "red-4",
      textColor: "white",
      icon: "cloud_done",
      message: e
    })
  }).finally(() => loader("org", "remove"))
}

function setValuesForSubmit() {
  // all are q-selects - other values are directly linked to raidLog
  raidLog.value.service_id = selectedService.value
  raidLog.value.service_line_id = selectedServiceLineVisible.value ? selectedServiceLine.value : null
  raidLog.value.consultant_id = null // (selectedConsultantVisible.value) ? selectedConsultant.value : null
  raidLog.value.type_id = selectedType.value
  raidLog.value.category_id = selectedCategory.value
  raidLog.value.impact_id = selectedImpact.value
  raidLog.value.organisation_id = organisationId.value
  raidLog.value.fileList = fileList.value
}

function onSubmit() {
  if (isEditing.value) {
    updateRaidLog()
  } else {
    createNewRaidLog()
  }
}

function createNewRaidLog() {
  submitting.value = true
  setValuesForSubmit()
  store.dispatch("common/createRaidLog", raidLog.value).then(() => {
    emit("update")
    $q.notify({
      color: "green-4",
      textColor: "white",
      icon: "cloud_done",
      message: "Submitted"
    })
    setTimeout(() => {
      router.push({ path: raidLogLink.value })
    }, 1000)
  }).catch(e => {
    $q.notify({
      color: "red-4",
      textColor: "white",
      icon: "cloud_done",
      message: e
    })
  }).then(() => {
    submitting.value = false
  })
}

async function updateRaidLog() {
  submitting.value = true
  let routePath = route.path.split("/").filter(v => v)
  const obj = {
    data: {
      organisation_id: raidLog.value.organisation_id,
      status_id: raidLog.value.status_id,
      note_attachments: (raidLog.value.note_attachments ?? []).map(val => val.id),
      note: raidLog.value.note,
      is_from_vendor: routePath[0] === "vendor"
    },
    method: "patch",
    id: props.raid_log_id
  }

  await store.dispatch("common/raidLog", obj).then(() => {
    $q.notify({
      message: OrganisationTypeMethods.changeRaid(isBuiltEnvironment.value) + " Log updated",
      position: "top"
    })
    //get fresh data
    store.dispatch("common/getRaidLog", props.raid_log_id)
    raidLog.value.note = ""
  }).catch(e => {
    alert(e.data.message || e.statusText)
  }).then(() => {
    submitting.value = false
  })
}

function onCreateMedia(obj, oldObj) {
  if (obj.archived === 0) {
    if (obj.metadata === "attachment") {
      raidLog.value.attachment = obj

      if (oldObj.id) fileList.value.delete.attachment.push(oldObj.id)
    }
  } else {
    onDeleteMedia(obj)
  }
}

function onDeleteMedia(obj) {
  if (obj.metadata === "attachment") {
    raidLog.value.attachment = {
      id: null,
      organisation_id: organisationId.value ?? 0,
      name: null,
      model_id: 0,
      model: "raid_log",
      metadata: "attachment",
      accepts: ".pdf, image/*"
    }
    if (obj.id) fileList.value.delete.attachment.push(obj.id)
  }
}

function onCreateMultipleMedia(files) {
  raidLog.value.note_attachments.push(...files)
}

function onReset() {
  resetting.value = true
  if (allowEdit.value) {
    raidLog.value.id = null
    raidLog.value.title = ""
    raidLog.value.description = ""
    raidLog.value.cause = ""
    raidLog.value.internal = true
    raidLog.value.impact_id = 1
    raidLog.value.impact_score = null
    raidLog.value.probability_score = null
    raidLog.value.status_id = 1
  }
  if (allowEditExtra.value) {
    raidLog.value.actions = ""
    raidLog.value.status_id = 1
    raidLog.value.outcome_id = 1
  }

  onDeleteMedia(raidLog.value.attachment)

  raidLog.value.organisation_id = organisationId.value

  setTimeout(() => {
    resetting.value = false
  }, 500)
}

function close() {
  closing.value = true
  setTimeout(() => {
    closing.value = false
    router.push({ path: raidLogLink.value })
  }, 400)
}
</script>

<style scoped lang="scss">
.table-info {
  border-collapse: separate;
  border-spacing: 0 0.7em;
}

.infos {
  padding: 2px;
  width: 200px;
  font-weight: bold;
  align-content: start;
}

.sticky-bottom {
  position: sticky;
  opacity: 1;
  z-index: 1;
  bottom: 0;
  background: #161616;
}
</style>
