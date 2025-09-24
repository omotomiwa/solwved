<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <page-header title="Document Management" :breadcrumbs="breadcrumbs" />
      <div v-if="is_authorised" class="q-mt-lg">
        <div class="q-pa-md q-gutter-sm">
          <q-input filled v-model="filter" label="Filter">
            <template v-slot:append>
              <q-icon v-if="filter !== ''"
                      name="clear"
                      class="cursor-pointer"
                      @click="resetFilter" />
            </template>
          </q-input>
          <q-tree
            node-key="id"
            accordion
            selected-color="primary"
            :nodes="documentList"
            :filter="filter"
            v-model:selected="selectedFile"
            v-model:expanded="expanded"
          >
            <template v-slot:header-default="prop">
              <div class="row items-center">
                <q-icon :name="prop.node.icon || 'star'" class="q-mr-sm text-weight-medium" />
                <div class="text-weight-medium text-h5">{{ prop.node.label }}</div>
              </div>
            </template>

            <template v-slot:header-generic="prop">
              <div class="row items-center">
                <q-icon :name="prop.node.icon || 'star'" class="q-mr-sm text-weight-medium" />
                <div class="text-weight-medium text-h5">
                  <u>{{ prop.node.label }}</u>
                </div>
                <q-badge v-if="prop.node.badge"
                         class="q-ml-sm"
                         rounded
                         color="primary"
                         text-color="dark"
                         :label="prop.node.badge" />
              </div>
            </template>

            <template v-slot:header-export="prop">
              <div class="border-gray q-px-md q-py-xs full-width">
                <div class="row items-center">
                  <q-icon :name="prop.node.icon || 'star'" class="q-mr-md" />
                  <div class="flex column" :class="{'dimmed': prop.node.archived === 1}">
                    <div class="text-weight-light" :class="{'text-strike': prop.node.archived === 1}">
                      {{ prop.node.label }}
                    </div>
                    <div v-if="prop.node.metadata || prop.node.model"
                         class="text-weight-light text-caption">
                      File Type: {{ StringMethods.ucfirst(prop.node.metadata || prop.node.model) }}
                    </div>
                    <div class="text-weight-light text-caption">
                      Last Updated: {{ prop.node.updated_at }}
                    </div>
                  </div>
                  <template v-if="prop.node.file_download_url">
                    <div class="q-ml-md flex q-gutter-sm">
                      <q-btn
                        v-if="prop.node.is_previewable"
                        :disable="prop.node.process.preview.disabled"
                        round
                        color="primary"
                        text-color="dark"
                        @click="previewFile(prop.node)"
                        icon="fa-regular fa-eye"
                        size="sm"
                      >
                        <q-tooltip class="bg-primary text-dark"
                                   anchor="top middle"
                                   self="bottom middle"
                                   :offset="[10, 10]">
                          Click to preview
                        </q-tooltip>
                      </q-btn>
                      <q-btn
                        :loading="prop.node.process.download.loading"
                        round
                        color="positive"
                        text-color="dark"
                        @click="downloadFile(prop.node)"
                        icon="cloud_download"
                        size="sm"
                      >
                        <q-tooltip class="bg-positive text-dark"
                                   anchor="top middle"
                                   self="bottom middle"
                                   :offset="[10, 10]">
                          Click to download
                        </q-tooltip>
                      </q-btn>
                      <q-btn
                        round
                        color="blue"
                        @click="shareFile(prop.node)"
                        icon="share"
                        size="sm"
                      >
                        <q-tooltip class="bg-blue"
                                   anchor="top middle"
                                   self="bottom middle"
                                   :offset="[10, 10]">
                          Click to copy share URL
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </q-tree>
        </div>
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
      <preview-dialog :show-dialog="showDialog"
                      :file-type="selectedItem?.file_type"
                      :file="selectedItem?.file_preview_url"
                      @close="closePopup">
        <template #description v-if="selectedItem?.metadata">
          {{ StringMethods.ucfirst(selectedItem?.metadata) }}
        </template>
      </preview-dialog>
    </div>
  </q-page>
</template>

<script>
import { copyToClipboard } from "quasar"
import { defineComponent } from "vue"
import { ClassCombinations, UserAccessTypes } from "src/modules/StaticData.js"
import { ObjectMethods, StringMethods } from "src/modules/GlobalMethods.js"
import { AccessManagementMethods } from "src/modules/HelperMethods.js"
import PageHeader from "components/common/PageHeader.vue"
import PreviewDialog from "components/common/dialog/PreviewDialog.vue"

export default defineComponent({
  name: "Document Management",
  components: {
    PreviewDialog,
    PageHeader
  },
  props: ["vendor_id", "customer_id"],
  setup() {
    return {
      ClassCombinations,
      StringMethods
    }
  },
  data() {
    return {
      expanded: [],
      documentList: [],
      showDialog: false,
      selectedItem: null,
      selectedFile: "",
      filter: ""
    }
  },
  computed: {
    entityName: function() {
      if (this.vendor_id) {
        return "vendor"
      }
      if (this.customer_id) {
        return "customer"
      }
      return "nada"
    },
    dashboardLink: function() {
      switch (this.entityName) {
        case "vendor":
          return "/" + this.entityName + "/" + this.vendor_id
        case "customer":
          return "/" + this.entityName + "/" + this.customer_id
      }
      return "nada"
    },
    breadcrumbs: function() {
      let breadcrumbList = []

      if (this.is_authorised) {
        breadcrumbList.push({ route: this.dashboardLink, name: this.organisation.name })
        breadcrumbList.push({ route: "", name: "Document Management" })
      }

      return breadcrumbList
    },
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    is_super_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("super_admin") > -1
    },
    users: function() {
      let c = this.$store.getters["admin/getUsers"]
      c = JSON.parse(JSON.stringify(c))
      if (Array.isArray(c) && c.length > 0) {
        c.sort((a, b) => (a.last_name > b.last_name ? 1 : b.last_name > a.last_name ? -1 : 0))
      }
      return c.map(val => {
        val.access_customer = (val.access_customer ?? []).filter(val => val.access && val.access !== "")
        val.customers_count = val.access_customer.length
        return val
      })
    },
    is_authorised: function() {
      if (this.is_super_admin) {
        return true
      }
      return AccessManagementMethods.checkAccess([UserAccessTypes.DOCUMENT_MANAGER.value], this.user)
    },
    documents: function() {
      return this.$store.getters["vendor/getVendorDocuments"]
    }
  },
  methods: {
    resetFilter: function() {
      this.filter = ""
    },
    downloadFile: function(item) {
      item.process.download.loading = true
      this.$api.request({
        url: item.file_download_url,
        method: "GET",
        responseType: "blob"
      }).then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", item.name)
        document.body.appendChild(link)
        link.click()
        link.remove()
      }).finally(() => {
        item.process.download.loading = false
      })
    },
    previewFile: function(item) {
      this.selectedItem = item
      this.showDialog = true
      item.process.preview.disabled = true
    },
    closePopup: function() {
      this.showDialog = false
      this.selectedItem.process.preview.disabled = false
      if (this.$route.query.file) {
        this.$router.push({ path: this.$route.path, replace: true })
      }
    },
    shareFile: function(item) {
      let url = window.location.origin + this.$route.path + "?file=" + item.id
      copyToClipboard(url)
        .then(() => {
          this.$q.notify({
            message: "Sharable URL copied to clipboard",
            color: "positive",
            icon: "share",
            position: "bottom",
            timeout: 2000
          })
        })
        .catch(() => {
          this.$q.notify({
            message: "Failed to copy URL",
            color: "negative",
            icon: "share",
            position: "bottom",
            timeout: 2000
          })
        })
    },
    getSelectedItem: function(items, expandIds) {
      let itemList = []

      items.map(item => {
        if ("children" in item) {
          let children = this.getSelectedItem(item.children, expandIds)
          itemList.push({
            ...item,
            children: children
          })
          if (children.length > 0) {
            expandIds.push(item.id)
          }
        } else {
          if (item.id.toString() === this.selectedFile) {
            itemList.push({
              ...item,
              isFileSelected: true
            })
            this.selectedItem = {
              ...item,
              isFileSelected: true
            }
          }
        }
      })
      return itemList.filter(item => !("children" in item) || item.children.length > 0)
    },
    setExpand: function() {
      let expandIds = []
      this.getSelectedItem(this.documentList, expandIds)
      this.expanded = expandIds
    }
  },
  watch: {
    documents: {
      handler: function(val) {
        this.documentList = ObjectMethods.decouple(val)
      },
      deep: true
    }
  },
  mounted() {
    this.$q.loading.show()
    this.$store.dispatch("vendor/getVendorDocuments", this.vendor_id || this.customer_id).then(() => {
      if (this.$route.query.file) {
        this.selectedFile = this.$route.query.file ?? ""
        this.setExpand()
        if (this.selectedItem) {
          if (this.selectedItem.is_previewable) {
            this.previewFile(this.selectedItem)
          }
        } else {
          this.$q.dialog({
            title: "Alert",
            message: "You don't have access to shared file.",
            ok: { label: "Ok", color: "primary", textColor: "dark" }
          })
        }
      }
      this.$q.loading.hide()
    }).catch(e => {
      this.$q.loading.hide()
      if (typeof e == "string") {
        this.$q.dialog({
          title: "Alert",
          message: e,
          ok: { label: "Ok", color: "primary", textColor: "dark" }
        })
      } else {
        this.$q.dialog({
          title: "Alert",
          message: e.data.message || e.statusText,
          ok: { label: "Ok", color: "primary", textColor: "dark" }
        })
      }
    })
  }
})
</script>
