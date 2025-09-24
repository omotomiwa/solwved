<script>
import { FileMethods, StringMethods } from "src/modules/GlobalMethods.js"

export default {
  name: "MessageAttachment",
  props: {
    message: {
      type: Object,
      required: true,
      default: () => ({})
    },
    maxFileCount: {
      type: Number,
      default: 3
    }
  },
  setup() {
    return {
      StringMethods,
      FileMethods
    }
  },
  data() {
    return {
      showMore: false
    }
  },
  computed: {
    hasMore: function() {
      return (this.message.files.length ?? []) > this.maxFileCount
    },
    files: function() {
      return this.showMore ? (this.message.files ?? []) : (this.message.files ?? []).slice(0, this.maxFileCount)
    }
  },
  methods: {
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
  <div>
    <p class="text-caption q-mb-none">
      Attached Files
      <q-badge color="dark" text-color="light" :label="(message?.files ?? []).length" />
      :
    </p>
    <q-list v-if="files.length > 0" separator bordered :dark="false">
      <q-item v-for="(a,index) of files" :key="index">
        <q-item-section>
          <div
            title="Download"
            class="cursor-pointer flex items-center grid-gap-3 text-dark"
            :class="{'text-strike dimmed': a.archived === 1}"
            @click="downloadFile(a)"
          >
            <q-icon :name="a.icon" />
            <div class="column">
              <p class="q-mb-none" :title="a.name">{{ FileMethods.shortName(a.name) }}</p>
              <p class="q-mb-none text-caption">{{ a.updated_at }}</p>
            </div>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    <q-btn
      v-if="hasMore"
      class="q-mt-sm"
      color="dark"
      dense flat
      size="md"
      @click="showMore = !showMore"
    >
      <div class="q-mr-xs">{{ showMore ? "Show Less" : "Show More" }}</div>
      <q-icon :name="showMore ? 'fa-solid fa-caret-up' : 'fa-solid fa-caret-down'" />
    </q-btn>
  </div>
</template>
