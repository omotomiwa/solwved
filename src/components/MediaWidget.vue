<template>
  <div class="row">
    <div v-if="modelValue">
      <div v-if="!deleteIt && modelValue.metadata && mapMetadata(modelValue.metadata)" class="q-mb-sm">
        {{ mapMetadata(modelValue.metadata) }}
      </div>
      <div v-if="modelValue.name && !deleteIt" class="col">
        <div v-if="direct" class="text-bold q-mb-sm">
          <a :href="directLink" :class="{'text-strike dimmed': modelValue.archived === 1}">{{ modelValue.name }}</a>
        </div>
        <div v-else class="row items-center" style="cursor: pointer">
          <div title="Download" @click="downloadFile()" :class="{'text-strike dimmed': modelValue.archived === 1}">
            <q-icon :name="icon" />
            {{ modelValue.name }}
          </div>
          <q-btn
            v-if="allowNewUpload"
            size="sm"
            color="primary"
            outline
            icon="file_upload"
            title="Upload replacement"
            style="margin-left: 10px"
            @click="show_dialog = true"
          />
          <q-btn
            v-if="modelValue.archived === 0 && showDelete"
            size="sm"
            icon="fas fa-trash-alt"
            color="negative"
            outline
            title="Remove"
            style="margin-left: 10px"
            @click="archiveFile()"
          />
        </div>
      </div>
      <div v-else>
        <q-btn
          v-if="!deleteIt"
          icon="file_upload"
          title="Upload"
          @click="show_dialog = true"
          color="primary"
          outline
        >
          Upload File
        </q-btn>
      </div>
      <q-dialog v-model="show_dialog" style="width: 360px">
        <q-uploader
          ref="uploader"
          v-model="show_dialog"
          color="primary"
          text-color="dark"
          extensions="this.extensions"
          auto-expand
          url=""
          stack-label="upload document"
          :factory="uploadFile"
          style="max-width: 100%"
          label="Max. size 10MB"
          accept="*"
          max-file-size="1048576000"
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
  name: "MediaWidget",
  props: {
    options: { type: Array, default: () => [] },
    label: { type: String, default: "File" },
    accept: { type: String, default: ".pdf, image/*" },
    extensions: { type: String, default: ".png, .jpg, .jpeg, .webp, .svg, .gif, .pdf, .doc, .docx, .xls, .xlsx" },
    allowNewUpload: { type: Boolean, default: true },
    dense: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    direct: { type: Boolean, default: false },
    download: { type: Boolean, default: false },
    createIt: { type: Boolean, default: false },
    deleteIt: { type: Boolean, default: false },
    showDelete: { type: Boolean, default: true },
    modelValue: { type: Object, default: () => ({}) }
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
      apiURL: process.env.VUE_APP_API_URL
    }
  },
  computed: {
    organisationDetail: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    icon: function() {
      return this.modelValue?.icon || "attach_file"
    },
    directLink: function() {
      return this.apiURL + API.COMMON.mediaLink({
        organisation_id: this.modelValue.organisation_id,
        media_id: this.modelValue.id
      })
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
        this.file = files[0]
        const fileData = new FormData()
        fileData.append("file", this.file)
        fileData.append("organisation_id", this.modelValue.organisation_id || this.organisationDetail.id)
        fileData.append("name", "sample.jpg")
        fileData.append("model", this.modelValue.model)
        fileData.append("model_id", this.modelValue.model_id)
        fileData.append("metadata", this.modelValue.metadata)
        this.$api.request({
          url: API.POST.media(),
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
    downloadFile: function() {
      this.$api.request({
        url: this.modelValue.file_download_url,
        method: "GET",
        responseType: "blob"
      }).then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", this.modelValue.name)
        document.body.appendChild(link)
        link.click()
        link.remove()
      })
    },
    archiveFile: function() {
      this.$api.request({
        url: "api/media/" + this.modelValue.organisation_id + "/" + this.modelValue.id,
        body: { archive: 1 },
        method: "PUT"
      }).then(response => {
        this.$emit("createMedia", response.data)
      })
    },
    deleteMedia: function() {
      this.$api.request({
        url: "api/media/" + this.modelValue.organisation_id + "/" + this.modelValue.id,
        method: "DELETE"
      }).then(() => {
        this.$emit("deleteMedia")
      })
    }
  }
}
</script>
