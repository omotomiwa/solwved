<template>
  <q-page :class="cc?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Service Alert</div>
      <BreadCrumb align="center" :organisation="organisation" v-if="isAuthorised && organisation" />

      <div v-if="isAuthorised && alert?.id" class="column q-mt-lg">
        <div class="row items-center">
          <q-form ref="myForm" @submit="onSubmit" @reset="onReset" class="col q-col-gutter-sm">
            <q-splitter
              v-model="splitter.span"
              :limits="splitter.limit"
              :disable="splitter.disabled"
              :separator-class="splitter.disabled ? 'bg-transparent' : 'bg-primary'"
              separator-style="width: 3px"
            >

              <template v-slot:before>
                <div class="q-pa-md">
                  <table style="width: 100%" class="table-info">
                    <tbody>
                    <tr>
                      <td class="infos">Date</td>
                      <td>
                        {{
                          alert?.created_at ?
                            date.formatDate(DateMethods.convertDateTimeFormat(alert?.created_at), Config.DATE_FORMAT_DMY) :
                            "-"
                        }}
                      </td>
                    </tr>
                    <tr v-if="props.vendor_id">
                      <td class="infos">Buyer</td>
                      <td>{{ alert?.service?.contract?.customer?.name ?? "-" }}</td>
                    </tr>
                    <tr v-else>
                      <td class="infos">Vendor</td>
                      <td>{{ alert?.service?.contract?.vendor?.name ?? "-" }}</td>
                    </tr>
                    <tr>
                      <td class="infos">Contract</td>
                      <td>{{ alert?.service?.contract?.reference ?? "-" }}</td>
                    </tr>
                    <tr>
                      <td class="infos">Service</td>
                      <td>{{ alert?.service?.name ?? "-" }}</td>
                    </tr>
                    <tr v-if="alert?.service?.delivery_model_id === 2 && alert?.service_line?.name">
                      <td class="infos">Service Line</td>
                      <td>{{ alert?.service_line?.name ?? "-" }}</td>
                    </tr>
                    <tr v-if="alert?.service?.delivery_model_id === 1 && alert?.engagement?.consultant?.user?.fullName">
                      <td class="infos">Engagement</td>
                      <td>{{ alert?.engagement?.consultant?.user?.fullName ?? "-" }}</td>
                    </tr>
                    <tr v-if="alert?.project?.name">
                      <td class="infos">Project</td>
                      <td>{{ alert?.project?.name ?? "-" }}</td>
                    </tr>
                    <tr>
                      <td colspan="2">
                        <q-separator class="q-my-sm" />
                      </td>
                    </tr>
                    <tr>
                      <td class="infos">Description</td>
                      <td>
                        <text-with-show-more :text="alert?.description ?? '-'" />
                      </td>
                    </tr>
                    <tr>
                      <td class="infos">Status</td>
                      <td>
                        <q-chip square color="primary" text-color="dark">
                          {{ alert?.status?.name ? StringMethods.ucfirst(alert?.status?.name) : "-" }}
                        </q-chip>
                      </td>
                    </tr>
                    <tr v-if="alert?.created_at !== alert?.updated_at">
                      <td class="infos">Last Updated</td>
                      <td>
                        {{
                          alert.updated_at ?
                            date.formatDate(DateMethods.convertDateTimeFormat(alert?.updated_at), Config.DATETIME_FORMAT_DMY_HM) :
                            "-"
                        }}
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </template>

              <template v-slot:separator v-if="!splitter.disabled">
                <q-avatar color="primary" text-color="dark" size="28px" title="Move to resize" icon="drag_indicator" />
              </template>

              <template v-slot:after>
                <div class="q-pa-md">
                  <q-virtual-scroll
                    ref="virtualListRef"
                    style="max-height: 60vh"
                    :virtual-scroll-slice-size="10"
                    :virtual-scroll-slice-ratio-before="10"
                    :items="(alert?.notes ?? [])"
                  >
                    <template v-slot:before>
                      <q-chat-message class="q-py-xl" v-if="(alert?.notes ?? []).length === 0"
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
                          v-model="editedItem.note"
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
                            v-model="editedItem.status_id"
                            :options="toggleStatuses"
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
                        <div>
                          <div class="row q-gutter-sm">
                            <q-btn
                              label="Submit"
                              :loading="isSubmittingData"
                              :disable="!canSubmit"
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
                              :loading="isClosing"
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
      <div v-else>You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "ServiceAlert",
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup>
import { date, QChatMessage, useQuasar } from "quasar"
import { computed, nextTick, onMounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { useRoute, useRouter } from "vue-router"
import { vendorAuth, customerAuth } from "src/modules/AuthLogic.js"
import { ClassCombinations, Config } from "src/modules/StaticData.js"
import { DateMethods, StringMethods } from "src/modules/GlobalMethods.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import MessageWithSkeleton from "components/common/chat/MessageWithSkeleton.vue"
import TextWithShowMore from "components/common/text/TextWithShowMore.vue"

const store = useStore()
const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const props = defineProps({
  vendor_id: { type: String, default: null },
  customer_id: { type: String, default: null },
  service_alert_id: { type: String, default: null }
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

const splitter = ref({
  span: 50,
  disabled: false,
  limit: [40, 60]
})
const virtualListRef = ref(null)
const showScrollToBottomBtn = ref(false)
const isSubmittingData = ref(false)
const editedItem = ref({ id: props.service_alert_id, status_id: null, note: "" })
const isClosing = ref(false)

const organisationId = computed(() => parseInt(props.customer_id ? props.customer_id : props.vendor_id))
const cc = computed(() => ClassCombinations)
const alert = computed(() => store.state.vendor.serviceAlert)
const alertStatuses = computed(() => store.state.vendor.serviceAlertStatuses)
const toggleStatuses = computed(() => {
  const ns = []
  if (alertStatuses.value && alertStatuses.value.length) {
    alertStatuses.value.forEach(s => {
      ns.push({ value: s.id, label: s.name })
    })
  }
  return ns
})
const canSubmit = computed(() => !!(editedItem.value.note ?? "").replace(/^\s+|\s+$/gm, ""))
const alertListLink = computed(() => {
  if (props.vendor_id) {
    return "/vendor/" + props.vendor_id + "/service-management/service-alerts"
  } else {
    return "/customer/" + props.customer_id + "/service-management/service-alerts"
  }
})

watch(alert, val => {
  store.dispatch("contract/viewContract", alert.value.service.contract_id)
  //set the local data
  editedItem.value.status_id = val.status.id
})
watch(() => alert.value?.notes,
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

function onReset() {
  //uploader.value.reset()
  editedItem.value.note = " "
  return 0
}

function onSubmit() {
  saveNote()
  editedItem.value.note = " "
}

async function saveNote() {
  isSubmittingData.value = true
  let routePath = route.path.split("/").filter(v => v)
  const obj = {
    data: {
      service_alert_id: alert.value.id,
      organisation_id: organisationId.value,
      status_id: editedItem.value.status_id,
      note: {
        organisation_id: organisationId.value,
        content: editedItem.value.note,
        is_from_vendor: routePath[0] === "vendor"
      }
    },
    call: "servicealerts",
    method: "post"
  }
  await store.dispatch("admin/datacallDt", obj).then(() => {
    $q.notify({
      message: "Service Alert has been updated",
      position: "top"
    })
    getAlert()
  }).catch(e => {
    $q.notify({
      color: "red-4",
      textColor: "white",
      message: e.data.message || e.statusText || e
    })
  }).finally(() => {
    isSubmittingData.value = false
  })
}

function getAlert() {
  store.dispatch("vendor/getServiceAlert", props.service_alert_id)
}

function close() {
  isClosing.value = true
  setTimeout(() => {
    isClosing.value = false
    router.push({ path: alertListLink.value })
  }, 400)
}

onMounted(() => {
  store.commit("auth/setBadge", props.vendor_id ? "vendor" : "customer")
  getAlert()
  store.dispatch("vendor/getServiceAlertStatuses")
})
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
