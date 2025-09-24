<script>
import { date } from "quasar"
import { DateMethods } from "src/modules/GlobalMethods.js"
import { ClassCombinations, Config, UserAccessTypes } from "src/modules/StaticData.js"
import { customerAuth, vendorAuth } from "src/modules/AuthLogic.js"
import BreadCrumb from "components/common/BreadCrumb.vue"

export default {
  name: "ServiceCatalogues",
  components: { BreadCrumb },
  inheritAttrs: false,
  props: {
    vendor_id: { type: String },
    customer_id: { type: String }
  },
  setup(props) {
    let isAuthorised = false
    let organisation = undefined

    if (props.vendor_id) {
      const vendor_auth = vendorAuth(props.vendor_id)
      isAuthorised = vendor_auth.isAuthorised
      organisation = vendor_auth.vendor
    }
    if (props.customer_id) {
      const customer_auth = customerAuth(props.customer_id)
      isAuthorised = customer_auth.isAuthorised
      organisation = customer_auth.customer
    }

    return {
      isAuthorised,
      organisation,

      ClassCombinations
    }
  },
  data() {
    return {
      isPageActive: false,
      pagination: {
        sortBy: "created_at",
        descending: true,
        rowsPerPage: 10
      },
      serviceTemplates: []
    }
  },
  computed: {
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    columns: function() {
      return [
        {
          name: "created_at",
          label: "Date",
          field: "created_at",
          align: "center",
          sortable: true,
          sortOrder: "da",
          rawSort: (a, b) => date.getDateDiff(DateMethods.convertDateTimeFormat(a), DateMethods.convertDateTimeFormat(b), "second"),
          format: val => val ? date.formatDate(DateMethods.convertDateTimeFormat(val), Config.DATE_FORMAT_DMY) : "-"
        },
        { name: "name", label: "Name", field: "name", align: "left", sortable: true },
        { name: "output_count", label: "Output Count", field: "output_count", align: "center", sortable: true },
        {
          name: "capability_count",
          label: "Capability Count",
          field: "capability_count",
          align: "center",
          sortable: true
        },
        { name: "actions", label: "Actions", align: "center" }
      ]
    },
    hasViewAccess: function() {
      return this.organisation && (
        (this.user.accessCustomer ?? []).find(a => a.organisation_id === this.organisation.id)?.access_list ?? []
      ).includes(UserAccessTypes.SERVICE_CATALOGUE_VIEW.value)
    },
    hasEditAccess: function() {
      return this.organisation && (
        (this.user.accessCustomer ?? []).find(a => a.organisation_id === this.organisation.id)?.access_list ?? []
      ).includes(UserAccessTypes.SERVICE_CATALOGUE_MANAGER.value)
    }
  },
  async mounted() {
    this.$q.loading.show()

    await this.$store.dispatch("admin/getOrganisation", this.vendor_id || this.customer_id)
    await this.$store.dispatch("auth/getUser")

    if (
      !this.organisation?.has_service_catalogue ||
      !(this.hasViewAccess || this.hasEditAccess)
    ) {
      this.$router.push({ path: "/access-denied" })
    }

    this.getTemplateList()
  },
  methods: {
    getTemplateList: function() {
      this.$store.dispatch(
        "contract/getServiceTemplates",
        this.vendor_id ?? this.customer_id
      ).then(response => {
        this.serviceTemplates = response.data && response.data.length ? response.data : []
      }).finally(() => {
        this.isPageActive = true
        this.$q.loading.hide()
      })
    },
    destroyTemplate: function(row) {
      this.$q.dialog({
        title: "Confirm",
        message: "Would you like to delete template?",
        dark: true,
        ok: { color: "negative" },
        cancel: { color: "secondary", flat: true },
        persistent: true
      }).onOk(() => {
        this.$store.dispatch(
          "contract/deleteServiceTemplate",
          { organisation_id: row.organisation_id, template_id: row.id }
        ).then(() => {
          this.getTemplateList()
          this.$q.notify({
            icon: "fa-solid fa-check",
            message: "Template deleted successfully",
            color: "positive",
            textColor: "dark"
          })
        }).catch(error => {
          this.$q.notify({
            icon: "fa-solid fa-xmark",
            message: error.data.message ?? error.message ?? "Template deleted failed",
            color: "negative"
          })
        })
      })
    }
  }
}
</script>

<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Service Catalogue</div>
      <BreadCrumb align="center" :organisation="organisation" v-if="organisation" />

      <div v-if="isAuthorised" class="q-mt-lg">
        <q-slide-transition>
          <div v-show="!$q.loading.isActive && isPageActive">

            <q-btn
              v-if="hasEditAccess"
              class="alert-button q-mb-lg"
              color="primary"
              text-color="dark"
              label="Create New Template"
              @click="$router.push('/vendor/' + organisation.id + '/service-catalogue/create/new')"
            />

            <div class="q-mb-sm q-pa-md-sm">Please choose a Service Template</div>

            <q-table
              :grid="$q.screen.xs"
              selection="none"
              :rows="serviceTemplates"
              :columns="columns"
              row-key="id"
              :pagination="pagination"
              class="bordered"
              table-header-class="text-weight-bolder text-primary"
              color="primary"
              flat wrap-cells binary-state-sort
            >
              <template #body-cell-output_count="props">
                <q-td :props="props">
                  <q-badge color="primary" outline :label="props.value ?? 0" />
                </q-td>
              </template>
              <template #body-cell-capability_count="props">
                <q-td :props="props">
                  <q-badge color="accent" outline :label="props.value ?? 0" />
                </q-td>
              </template>
              <template #body-cell-actions="props">
                <q-td :props="props">
                  <div class="q-gutter-sm" v-if="!$q.loading.isActive && isPageActive">
                    <q-btn
                      v-if="hasEditAccess"
                      color="primary"
                      padding="xs md"
                      size="sm"
                      outline
                      @click="this.$router.push('/vendor/' + organisation.id + '/service-catalogue/edit/'+props.row.id)"
                    >
                      <q-icon name="fa-solid fa-pen" size="1.25em" class="q-mr-sm" />
                      Edit
                    </q-btn>
                    <q-btn
                      color="secondary"
                      padding="xs md"
                      size="sm"
                      outline
                      @click="this.$router.push('/vendor/' + organisation.id + '/service-catalogue/view/'+props.row.id)"
                    >
                      <q-icon name="fa-regular fa-eye" size="1.25em" class="q-mr-sm" />
                      View
                    </q-btn>
                    <q-btn
                      v-if="hasEditAccess"
                      color="negative"
                      padding="xs md"
                      size="sm"
                      outline
                      @click="destroyTemplate(props.row)"
                    >
                      <q-icon name="fa-regular fa-trash-can" size="1.25em" class="q-mr-sm" />
                      Delete
                    </q-btn>
                  </div>
                </q-td>
              </template>
            </q-table>

          </div>
        </q-slide-transition>

      </div>
      <div v-else class="q-my-lg">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>
