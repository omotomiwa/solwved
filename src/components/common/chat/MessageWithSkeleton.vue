<script>
import { QSkeleton } from "quasar"
import { h } from "vue"
import Message from "components/common/chat/Message.vue"

export default {
  name: "MessageWithSkeleton",
  components: {
    Message
  },
  props: {
    note: {
      type: Object,
      default: () => ({})
    },
    index: {
      type: Number,
      default: 1
    },
    send: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      timer: null,
      asyncContent: null
    }
  },
  beforeMount() {
    this.timer = setTimeout(() => {
      this.asyncContent = {
        name: this.send ? "me" : "Someone else",
        note: this.note
      }
    }, 1000 + (this.index * 75))
  },
  beforeUnmount() {
    clearTimeout(this.timer)
  },
  render() {
    if (this.asyncContent && typeof this.asyncContent === "object") {
      return h(Message, {
        key: this.note?.id,
        ...this.asyncContent
      })
    }

    let content = [
      h(QSkeleton, {
        class: "on-left on-right rounded",
        width: "100px",
        height: "8px"
      })
    ]
    if ((this.note?.files ?? []).length > 0) {
      content.push(
        h(QSkeleton, {
          class: "on-left on-right rounded q-mt-xs",
          width: "320px",
          height: "250px"
        }))
    }
    content.push(
      h(QSkeleton, {
        class: "on-left on-right rounded q-mt-xs",
        width: "320px",
        height: "100px"
      })
    )

    if (this.note?.changed_status?.from?.name || this.note?.changed_status?.to?.name) {
      content.push(
        h(QSkeleton, {
          class: "on-left on-right rounded q-mt-xs",
          width: "320px",
          height: "100px"
        })
      )
    }

    const message = h("div", {
      class: "column justify-center q-mx-sm items-" + (this.send ? "start" : "end")
    }, content)

    return h("div", {
      class: "row no-wrap items-center q-mx-sm justify-" + (this.send ? "start" : "end"),
      key: this.note?.id
    }, message)
  }
}
</script>
