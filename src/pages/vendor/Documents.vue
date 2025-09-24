<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Document Management</div>
      <BreadCrumb align="center" :organisation="vendor" v-if="is_authorised" />
      <div v-if="is_authorised" class="q-mt-lg">
        <div class="text-h5 q-mb-md">Documents</div>
        <q-table
          v-model:pagination="pagination"
          title="Documents"
          :rows="documents"
          :columns="documentColumns"
          row-key="name"
          :loading="loading"
          table-class="alternate-color"
          table-header-class="text-weight-bolder text-primary"
          color="primary"
        >
          <template #body="props">
            <q-tr :props="props">
              <q-td key="name" :props="props">
                {{ props.row.name }}
              </q-td>
              <q-td key="name" :props="props">
                {{ props.row.path }}
              </q-td>
              <q-td key="name" :props="props">
                {{ props.row.model }}
              </q-td>
              <q-td key="direct" :props="props">
                <media-widget v-model="props.row" :direct="true" />
              </q-td>
              <q-td key="download" :props="props">
                <media-widget v-model="props.row" :download="true" />
              </q-td>
              <q-td key="archived" :props="props">
                {{ props.row.archived }}
                <!--                <q-checkbox dense v-model="props.row.archived" />-->
              </q-td>
              <q-td key="delete" :props="props">
                <q-td key="download" :props="props">
                  <media-widget v-model="props.row" :delete-it="true" @deleteMedia="onDeleteMedia" />
                </q-td>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <media-widget v-model="newMedia" @createMedia="onCreateMedia" />
      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue"
import { ClassCombinations } from "src/modules/StaticData.js"
import BreadCrumb from "src/components/common/BreadCrumb.vue"
import MediaWidget from "components/MediaWidget.vue"

export default defineComponent({
  name: "Documents",
  components: { BreadCrumb, MediaWidget },
  props: ["vendor_id"],
  setup() {
    return {
      ClassCombinations
    }
  },
  data() {
    return {
      pagination: {
        rowsPerPage: 20 // current rows per page being displayed
      },
      loading: false,
      show_dialog: false,
      editedIndex: -1,
      editedItem: {
        id: 11,
        organisation_id: 1,
        name: "",
        path: ""
      },
      newItemLabel: "New user access",
      newUserData: { first_name: "", last_name: "", email: "", phone: "" },
      documentColumns: [
        { name: "name", align: "left", label: "Name", field: "name", sortable: true },
        { name: "path", label: "Path", align: "left", field: "path", sortable: false },
        { name: "model", label: "Model", align: "left", field: "model", sortable: false },
        { name: "direct", label: "Direct", align: "left", field: "direct", sortable: false },
        { name: "download", label: "Download", align: "left", field: "download", sortable: false },
        { name: "archived", label: "Archived", align: "center", field: "archived", sortable: false },
        { name: "delete", label: "Delete", align: "center", field: "delete", sortable: false }
      ],
      goodtogo: false,
      accept: ".pdf",
      newMedia: {
        id: null,
        organisation_id: null,
        name: "",
        model_id: 10,
        model: "contract",
        metadata: "ratecard",
        accept: ".pdf, .doc"
      },
      metadataOptions: ["contract", "contract service"]
    }
  },
  computed: {
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    is_vendor_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("vendor_admin") > -1
    },
    vendor: function() {
      return this.vendor_access.find(obj => parseInt(obj.id) === parseInt(this.vendor_id))
    },
    vendorDashboardLink: function() {
      return "/vendor/" + this.vendor_id
    },
    vendor_access: function() {
      return this.$store.getters["vendor/getVendors"]
    },
    is_authorised: function() {
      return this.is_vendor_admin
    },
    documents: function() {
      return this.$store.getters["vendor/getVendorDocuments"]
    }
  },
  mounted() {
    this.newMedia.organisation_id = this.vendor_id
    this.newMedia.model_id = 3
    this.newMedia.model = "service"
    if (this.is_vendor_admin) {
      if (!this.vendor_access || this.vendor_access.length < 1) {
        this.$store.dispatch("vendor/getVendorAccess").then(() => {
          // this.getReportsData()
          // this.getCustomers()
        }).catch(e => {
          alert(e.data.message || e.statusText)
        })
      } else {
        // this.getReportsData()
        // this.getCustomers()
      }
      this.$store.dispatch("vendor/getVendorDocuments", this.vendor_id).then(() => {
        // this.getContracts()
      }).catch(e => {
        alert(e.data.message || e.statusText)
      })
    }
  },
  methods: {
    onCreateMedia: function(obj) {
      this.newMedia.id = obj.id
      this.newMedia.name = obj.name
      this.$store.dispatch("vendor/getVendorDocuments", this.vendor_id).then(() => {
        this.newMedia.id = obj.id
        this.newMedia.organisation_id = obj.organisation_id
        this.newMedia.name = obj.name
        this.newMedia.model_id = obj.model_id
        this.newMedia.model = obj.model
      }).catch(e => {
        alert(e.data.message || e.statusText)
      })
    },
    onDeleteMedia: function() {
      this.$store.dispatch("vendor/getVendorDocuments", this.vendor_id).then(() => {
        // this.getContracts()
      }).catch(e => {
        alert(e.data.message || e.statusText)
      })
    }
  }
})
</script>

<style scoped>
.alternate-color .q-item {
  background-color: rgba(54, 76, 102, 0.2);
}

.alternate-color .q-item:nth-of-type(2n) {
  background-color: rgba(54, 76, 102, 0.1);
}
</style>
