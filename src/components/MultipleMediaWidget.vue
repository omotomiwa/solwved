<template>
  <div class="row">
    <div v-if="extraData">
      <div v-if="!deleteIt && extraData.metadata && mapMetadata(extraData.metadata)" class="q-mb-sm">
        {{ mapMetadata(extraData.metadata) }}
      </div>
      <q-btn
        v-if="!deleteIt"
        icon="file_upload"
        title="Upload"
        @click="show_dialog = true"
        color="primary"
        outline
        :class="{'text-caption': dense}"
        :dense="dense"
      >
        Upload File
      </q-btn>
      <q-virtual-scroll
        v-if="modelValue.length > 0"
        :style="{maxHeight: maxHeight+'px'}"
        :class="{'q-mt-md': !dense, 'q-mt-xs':dense}"
        class="relative-position"
        :items="modelValue"
        :separator="separator"
        :bordered="bordered"
        v-slot="{ item, index }"
      >
        <q-item :key="index">
          <q-item-section>
            <div class="flex justify-between items-center grid-gap-5">
              <div title="Download"
                   class="cursor-pointer flex items-center grid-gap-3"
                   :class="{'text-strike dimmed': item.archived === 1}"
                   @click="downloadFile(item)">
                <q-icon :name="item.icon" />
                <div class="column">
                  <p class="q-mb-none">{{ item.name }}</p>
                  <p v-if="!dense" class="q-mb-none text-caption">{{ item.updated_at }}</p>
                </div>
              </div>
              <div>
                <q-btn
                  v-if="item.archived === 0 && showDelete"
                  :loading="processingIds.archiving.includes(item.id)"
                  class="q-pa-sm"
                  size="sm"
                  icon="fas fa-trash-alt"
                  color="negative"
                  outline
                  title="Remove"
                  @click="archiveFile(item)"
                />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-virtual-scroll>
      <p v-if="(modelValue ?? []).length >0"
         class="text-right text-caption q-pt-sm q-pr-sm q-mb-none">
        Attachment Count: {{ (modelValue ?? []).length }}
      </p>
      <q-dialog v-model="show_dialog" style="width: 360px">
        <q-uploader
          ref="uploader"
          v-model="show_dialog"
          color="primary"
          text-color="dark"
          :extensions="extensions"
          auto-expand
          url=""
          stack-label="upload document"
          :factory="uploadFile"
          style="max-width: 100%"
          label="Max. size 10MB"
          :accept="accept"
          max-file-size="1048576000"
          multiple
          batch
        />
      </q-dialog>
      <div v-if="deleteIt && showDelete">
        <q-btn
          size="sm"
          icon="fas fa-trash-alt"
          color="negative"
          flat
          title="Remove"
          @click="deleteMedia()"
        >
          <q-tooltip> Delete this file from cloud storage</q-tooltip>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue"
import { API } from "src/modules/ApiList.js"

export default {
  name: "MultipleMediaWidget",
  props: {
    label: { type: String, default: "File" },
    accept: { type: String, default: "*" },
    extensions: { type: String, default: "*" },
    bordered: { type: Boolean, default: true },
    separator: { type: Boolean, default: true },
    download: { type: Boolean, default: false },
    deleteIt: { type: Boolean, default: false },
    showDelete: { type: Boolean, default: true },
    dense: { type: Boolean, default: false },
    maxHeight: { type: Number, default: 320 },
    modelValue: { type: Object, default: () => ({}) },
    extraData: { type: Object, default: () => ({}) }
  },
  emits: ["createMedia", "deleteMedia"],
  setup() {
    const input = ref(null)

    return {
      input
    }
  },
  data() {
    return {
      uploadPercentage: 0,
      show_dialog: false,
      apiURL: process.env.VUE_APP_API_URL,
      processingIds: {
        archiving: [],
        deleting: []
      }
    }
  },
  computed: {
    icon: function() {
      return this.modelValue?.icon || "attach_file"
    }
  },
  methods: {
    mapMetadata: function(metadata) {
      return {
        terms: "Terms",
        services: "Services",
        ratecard: "Rate Card"
      }[metadata] ?? ""
    },
    uploadFile: function(files) {
      return new Promise((resolve, reject) => {
        const fileData = new FormData()

        for (const file of files) {
          fileData.append("files[]", file)
        }

        fileData.append("organisation_id", this.extraData.organisation_id)
        fileData.append("name", "sample.jpg")
        fileData.append("model", this.extraData.model)
        fileData.append("model_id", this.extraData.model_id)
        fileData.append("metadata", this.extraData.metadata)
        this.$api.request({
          url: API.POST.multipleMedia(),
          method: "post",
          headers: {
            "Content-Type": "multipart/form-data"
          },
          data: fileData
        }).then(response => {
          this.$emit("createMedia", response.data, this.modelValue)
          resolve(response.data)
          this.show_dialog = false
          /*
        this.$q.notify({
          type: 'positive',
          message: 'Image Uploaded'
        })
         */
        }).catch(error => {
          console.error("Upload Error:", error)
          this.$q.notify({
            type: "negative",
            message: error.data.message
          })
          reject(error)
        })
      })
    },
    downloadFile: function(attached) {
      this.$api.request({
        url: attached.file_download_url,
        method: "GET",
        responseType: "blob"
      }).then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", attached.name)
        document.body.appendChild(link)
        link.click()
        link.remove()
      })
    },
    archiveFile: function(attached) {
      this.processingIds.archiving.push(attached.id)
      this.$api.request({
        url: "api/media/" + attached.organisation_id + "/" + attached.id,
        body: { archive: 1 },
        method: "PUT"
      }).then(response => {
        this.$emit("deleteMedia", response.data)
      }).finally(() => {
        this.processingIds.archiving = this.processingIds.archiving.filter(id => id !== attached.id)
      })
    },
    deleteMedia: function(attached) {
      this.processingIds.deleting.push(attached.id)
      this.$api.request({
        url: "api/media/" + attached.organisation_id + "/" + attached.id,
        method: "DELETE"
      }).then(() => {
        this.$emit("deleteMedia")
      }).finally(() => {
        this.processingIds.deleting = this.processingIds.deleting.filter(id => id !== attached.id)
      })
    }
  }
}
</script>
