<script>
import { date } from "quasar"
import { DateMethods, StringMethods } from "src/modules/GlobalMethods.js"
import { Config } from "src/modules/StaticData.js"
import MessageAttachment from "components/common/chat/MessageAttachment.vue"

export default {
  name: "Message",
  components: { MessageAttachment },
  props: {
    note: {
      type: Object,
      default: () => ({})
    }
  },
  setup() {
    return {
      Config,
      StringMethods
    }
  },
  methods: {
    formatDate: function(d, format = null) {
      format = format ?? Config.DATE_FORMAT_DLY

      return d ? date.formatDate(DateMethods.convertDateTimeFormat(d), format) : d
    }
  }
}
</script>

<template>
  <q-chat-message
    :key="note?.id"
    text-color="dark"
    :bg-color="note?.is_from_vendor ? 'green-5' : 'yellow-5'"
    :sent="!note?.is_from_vendor"
  >
    <template v-slot:name>{{ note?.user?.fullName }}</template>
    <template v-slot:stamp>{{ formatDate(note?.created_at, Config.DATETIME_FORMAT_DMY_HM) }}</template>
    <message-attachment :message="note" v-if="(note?.files ?? []).length > 0" />
    <div style="max-width: 500px;">
      {{ note.note }}
    </div>
    <div class="flex grid-gap-2" v-if="note?.changed_status?.from?.name || note?.changed_status?.to?.name">
      <q-badge color="dark">
        {{ StringMethods.ucfirst(note?.changed_status?.from?.name) }}
      </q-badge>
      <q-icon name="fa-solid fa-right-long" />
      <q-badge color="dark">
        {{ StringMethods.ucfirst(note?.changed_status?.to?.name) }}
      </q-badge>
    </div>
  </q-chat-message>
</template>
