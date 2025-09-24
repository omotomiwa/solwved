<script>
import { date } from "quasar"
import { Config } from "src/modules/StaticData.js"
import { DateMethods, StringMethods } from "src/modules/GlobalMethods.js"
import MessageWithSkeleton from "components/common/chat/MessageWithSkeleton.vue"

export default {
  name: "NoteChat",
  components: { MessageWithSkeleton },
  props: {
    noteList: {
      type: Array,
      default: () => []
    }
  },
  setup() {
    return {
      StringMethods,
      Config
    }
  },
  computed: {
    chatList: function() {
      return this.noteList.map(note => {
        return {
          ...note,
          files: [
            ...(note.attachments ?? []),
            ...(note.meta_attachments ?? [])
          ]
        }
      })
    }
  },
  methods: {
    formatDate: function(d, format = null) {
      format = format ?? Config.DATE_FORMAT_DLY

      return d ? date.formatDate(DateMethods.convertDateTimeFormat(d), format) : d
    },
    downloadFile: function(attachment) {
      this.$store.$api.request({
        url: "api/media/" + attachment.media.organisation_id + "/" + attachment.media.id,
        method: "GET",
        responseType: "blob"
      }).then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", attachment.original_name)
        document.body.appendChild(link)
        link.click()
      })
    }
  }
}
</script>

<template>
  <div v-if="chatList.length > 0">
    <message-with-skeleton
      v-for="note in chatList"
      :key="note.id"
      :note="note"
    />
  </div>
</template>
