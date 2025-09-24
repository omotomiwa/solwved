<template>
  <div ref="reportDocument" class="q-mb-xl">
    <div v-if="reportData" class="spend-report-document" id="reportDocument">
      <div class="report-header" :key="componentKey">
        <div class="report-header-panel">
          <div class="text-h3 text-weight-bold text-center q-mb-xl">Delivery Report</div>
          <div class="text-h5 text-weight-medium">Prepared for {{ reportData.customer_name }}</div>
          <div class="text-h5 text-weight-medium row items-center">
            <div class="col-auto">Report Title:</div>
            <q-input
              v-if="isEditable"
              v-model="unsavedData.period_label"
              @update:model-value="checkForChanges()"
              label-color="white"
              color="primary"
              outlined
              class="col-auto col-md-3 q-ml-md"
              :placeholder="periodPlaceholder"
            />
            <div v-else class="col-auto">&nbsp;{{ reportData.period_label }}</div>
          </div>
        </div>
      </div>
      <div v-if="!customer_mode" :key="componentKey">
        <div v-if="isEditable" class="q-my-md text-red text-weight-bold">
          <q-banner rounded class="bg-negative q-mt-md" dense>
            <template v-slot:avatar>
              <q-icon name="announcement" color="white" />
            </template>
            This report is in Vendor edit mode. You can make and save changes until you mark the report as approved.
            <br />
            Once approved, the report will be locked for Vendor changes, except for comments
          </q-banner>
        </div>
        <div v-if="!isEditable && isCustomerEditable" class="q-my-md text-weight-bold">
          <q-banner rounded class="bg-positive q-mt-md text-dark" dense>
            <template v-slot:avatar>
              <q-icon name="mark_chat_read" color="dark" />
            </template>
            You have a approved this report. No further changes are possible except for comments at the end of the
            report.
          </q-banner>
        </div>
        <div v-if="!isEditable && !isCustomerEditable" class="q-my-md text-weight-bold">
          <q-banner rounded class="bg-positive text-dark q-mt-md" dense>
            <template v-slot:avatar>
              <q-icon name="announcement" color="dark" />
            </template>
            This report is pending approval by {{ reportData.customer_name }}
          </q-banner>
        </div>
        <div v-if="!isCustomerEditable" class="q-my-md text-dark text-weight-bold">
          <q-banner rounded class="bg-positive q-mt-md text-dark" dense>
            <template v-slot:avatar>
              <q-icon name="mark_chat_read" color="dark" />
            </template>
            This report has been fully approved
          </q-banner>
        </div>
      </div>
      <div v-if="customer_mode" :key="componentKey">
        <div v-if="isCustomerEditable" class="q-my-md text-red text-weight-bold">
          <q-banner rounded class="bg-negative q-mt-md" dense>
            <template v-slot:avatar>
              <q-icon name="announcement" color="white" />
            </template>
            This report is in Customer edit mode. You can make and save changes until the Service Owner marks the report
            as approved. <br />
            Once approved, the report will be locked.
          </q-banner>
        </div>
        <div v-if="!isCustomerEditable" class="q-my-md text-positive text-weight-bold">
          <q-banner rounded class="bg-positive q-mt-md text-dark" dense>
            <template v-slot:avatar>
              <q-icon name="mark_chat_read" color="dark" />
            </template>
            This report has been fully approved
          </q-banner>
        </div>
      </div>
      <div class="actions-bar">
        <div v-if="is_super_admin || isEditable || isCustomerEditable" class="row q-gutter-lg">
          <q-btn
            v-if="!customer_mode && isEditable"
            :disable="dataChanges"
            label="Approve Report"
            class="col-auto"
            text-color="dark"
            color="positive"
            @click="approveReport"
          />
          <q-btn
            v-if="(isEditable || isCustomerEditable)"
            :disable="!dataChanges"
            label="Save Changes"
            class="col-auto"
            color="primary"
            text-color="dark"
            @click="saveChanges"
          />
          <q-btn
            v-if="(isEditable || isCustomerEditable)"
            :disable="!dataChanges"
            label="Revert Changes"
            class="col-auto"
            color="white"
            text-color="dark"
            @click="revertChanges"
          />
          <q-btn
            v-if="!customer_mode && isEditable"
            class="col-auto"
            label="Delete Report"
            color="negative"
            @click="deleteReport"
          />
          <q-btn
            v-if="is_super_admin || (!isCustomerEditable && !customer_mode)"
            class="col-auto"
            label="Un-Approve Report (Customer)"
            color="primary"
            text-color="dark"
            @click="unApproveReportCustomer"
          >
            <q-badge color="orange" floating> SA</q-badge>
          </q-btn>
          <q-btn
            v-if="!customer_mode && !isEditable && is_super_admin"
            class="col-auto"
            label="Delete Report"
            color="negative"
            @click="deleteReport"
          >
            <q-badge color="orange" floating> SA</q-badge>
          </q-btn>
          <q-btn
            v-if="customer_mode && !isCustomerEditable && is_super_admin"
            class="col-auto"
            label="Un-Approve Report"
            color="primary"
            text-color="dark"
            @click="unApproveReport"
          >
            <q-badge color="orange" floating> SA</q-badge>
          </q-btn>
        </div>

        <div v-if="dataMessage !== ''" class="q-my-md text-positive text-weight-bold">
          {{ dataMessage }}
        </div>
      </div>
      <div class="report-section q-mt-xl text-primary">
        <div class="report-section__header"><span class="label">Report Summary</span><span class="filler-line" /></div>
        <div class="row q-col-gutter-xs">
          <div class="col-12">
            <span class="report-label">Report Title:</span><span>{{ unsavedData.period_label }}</span>
          </div>
          <div class="col-12"><span class="report-label">Buyer:</span>{{ reportData.customer_name }}</div>
          <div class="col-12"><span class="report-label">Vendor:</span>{{ reportData.vendor_name }}</div>
          <div class="col-12"><span class="report-label">Service:</span>{{ reportData.service.name }}</div>
          <div class="col-12">
            <span class="report-label">Delivery Model:</span>
            {{ getDeliveryModelName(reportData.service.delivery_model_id) }}
          </div>
          <div class="col-12">
            <span class="report-label">
              Purchase Order Number<span v-if="purchase_orders.length > 1">s</span>:
            </span>{{ purchase_orders_string }}
          </div>
          <div class="col-12">
            <span class="report-label">Total Charge:</span>
            {{ CurrencyMethods.toCurrencyFormat(organisation?.currency?.code, totalReportCharge) }}
          </div>
          <div class="col-12 col-md-6">
            <span class="report-label">Period Start Date:</span><span>{{ period_start }}</span>
          </div>
          <div class="col-12 col-md-6">
            <span class="report-label">Period End Date:</span><span>{{ period_end }}</span>
          </div>
          <div class="col-12 col-md-6">
            <span class="report-label">Service Owner ({{ reportData.customer_name }}):</span>
            <span>{{ customer_contract_owner }}</span>
          </div>
          <div class="col-12 col-md-6">
            <span class="report-label">Approved by {{ reportData.vendor_name }}:</span>
            <span>
              <span v-if="reportData.vendor_approved">
                <q-icon name="done_all" color="positive" size="md" />
                {{ vendor_approved_date }}
              </span>
              <q-icon v-else name="close" color="negative" size="md" />
            </span>
          </div>
          <div class="col-12 col-md-6">
            <span class="report-label">Vendor Owner ({{ reportData.vendor_name }}):</span>
            <span>{{ vendor_contract_owner }}</span>
          </div>
          <div class="col-12 col-md-6">
            <span class="report-label">Approved by {{ reportData.customer_name }}:</span>
            <span>
              <span v-if="reportData.customer_approved">
                <q-icon v-if="reportData.customer_approved" name="done_all" color="positive" size="md" />
                {{ customer_approved_date }}
              </span>
              <q-icon v-else name="close" color="negative" size="md" />
            </span>
          </div>
        </div>
      </div>
      <div v-if="!is_only_contingent_labour && purchase_orders.length > 1">
        <div class="report-section__header q-mt-xl">
          <span class="label">Purchase Orders</span><span class="filler-line" />
        </div>
        <div class="report-section__subheader">
          This report covers {{ purchase_orders.length }} purchase order<span
          v-if="purchase_orders.length !== 1">s</span>, as detailed below:
        </div>
      </div>
      <div v-if="is_only_contingent_labour" :key="componentKey">
        <contingent-labour-report-table :purchase_orders="purchase_orders ?? []" :service="reportData?.service"
                                        class="col-12" />
      </div>
      <div v-else>
        <div
          v-for="purchase_order in purchase_orders"
          :key="componentKey+'_'+purchase_order.reference"
          class="purchase-order-collection"
        >
          <div v-if="!purchase_order.contingentLabour" class="non-contingent-labour col-12">
            <div class="q-mb-sm purchase-order-title">
              <span class="report-label">Purchase Order:</span> {{ purchase_order.reference }}
            </div>
            <div class="row">
              <div v-if="purchase_order.milestone && purchase_order.milestone.length" class="col-12">
                <div v-if="isEditable" class="q-mb-lg">
                  <div v-if="getReportPurchaseOrder(purchase_order).po_milestone_id > 0" class="q-mb-xs">
                    Purchase Order milestone applicable to this report
                  </div>
                  <div v-else class="q-mb-xs">Please select the Purchase Order Milestone applicable to this report
                  </div>
                  <new-selector-form
                    classes=""
                    dense
                    v-model:option_id="getReportPurchaseOrder(purchase_order).po_milestone_id"
                    @valChange="() => onReportPurchaseOrderChange(getReportPurchaseOrder(purchase_order))"
                    is-filterable
                    filter-key="label"
                    option-label="label"
                    :options="purchase_order.milestone"
                    label="PO Milestone"
                    default-class="full-width"
                  />
                </div>
                <div v-else class="q-mb-xs">
                  <div v-if="getReportPurchaseOrder(purchase_order).po_milestone_id > 0" class="q-mb-xs">
                    Purchase Order milestone applicable to this report
                  </div>
                  <span class="text-primary">{{ purchase_order_milestone(purchase_order) }}</span>
                </div>
              </div>
              <div class="col-12">
                <div class="row items-stretch q-mb-md q-pb-md q-col-gutter-lg">
                  <div class="col-12 col-xl-6">
                    <div class="full-width card q-pa-sm">
                      <purchase-order-spend
                        :purchaseOrderValue="purchase_order.amount"
                        :periodCharge="collateCharge(purchase_order.service_lines.concat(purchase_order.consultants))"
                        :otherCharge="poOutsidePeriod(purchase_order)"
                        :balance="poBalance(purchase_order)"
                        :period="unsavedData.period_label"
                        class="q-my-md"
                      />
                    </div>
                  </div>
                  <div
                    v-if="purchase_order.service_lines.length && purchase_order.delivery_model_id === 2"
                    class="col-12 col-xl-6">
                    <div class="full-width card q-pa-sm">
                      <spend-by-service-line
                        :serviceLines="purchase_order.service_lines"
                        :period="unsavedData.period_label"
                        class="q-my-md"
                      />
                    </div>
                  </div>
                  <div class="col-12 row items-stretch">
                    <div class="col card q-pa-lg">
                      <div class="report-subheading">PO Commentary</div>
                      <q-editor
                        v-if="isEditable"
                        v-model="getReportPurchaseOrder(purchase_order).notes"
                        min-height="10rem"
                        :toolbar="[
                          ['unordered', 'ordered'],
                          ['bold', 'italic', 'underline'],
                          ['link'],
                          ['removeFormat'],
                          ['undo', 'redo'],
                        ]"
                        @update:model-value="onReportPurchaseOrderChange(getReportPurchaseOrder(purchase_order))"
                      />
                      <div v-if="!isEditable" v-html="getReportPurchaseOrder(purchase_order).notes" class="q-mt-md" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="purchase_order.service_lines.length" class="col-12">
                <div v-if="purchase_order.delivery_model_id < 3" class="service_lines__header">Categories</div>
                <div class="service_lines__collection">
                  <div
                    v-for="service_line in purchase_order.service_lines"
                    :key="service_line.id"
                    class="service-line_item"
                  >
                    <div v-if="purchase_order.delivery_model_id < 3" class="service-line-heading q-mt-md">
                      {{ service_line.service_line_name }}
                    </div>
                    <div class="sr-grid q-mt-sm">
                      <div class="sr-grid-cell q-mt-xs">
                        <div class="report-label">Service Owner:</div>
                        <div class="text-primary">{{ service_line.service_owner }}</div>
                        <div class="report-label">Service Requester:</div>
                        <div class="text-primary">{{ service_line.service_requester }}</div>
                      </div>
                      <div class="sr-grid-cell q-mt-xs">
                        <div class="report-label">Delivery Model:</div>
                        <div class="text-primary">{{ service_line.delivery_model }}</div>
                        <div class="report-label">Fiancial Model:</div>
                        <div class="text-primary">{{ service_line.financial_model }}</div>
                      </div>
                      <div class="sr-grid-cell q-mt-xs">
                        <div class="report-label">Period Charge:</div>
                        <price-editor
                          v-model:price="service_line.period_charge"
                          :originalPrice="service_line.original_charge"
                          @update:price="onServiceLineChange"
                          :editable="isEditable"
                          textColour="primary"
                        />
                        <div class="report-label">Approved by Requester:</div>
                        <div class="text-primary">{{ service_line.customer_approved ? "Yes" : "No" }}</div>
                      </div>
                    </div>
                    <div class="row items-stretch q-mt-md q-mb-lg q-col-gutter-lg">
                      <div class="col-12">
                        <div class="col card q-pa-lg">
                          <div class="report-subheading">Deliverables</div>
                          <div>
                            <service-line-deliverables
                              v-if="reportData?.service.outputs?.length"
                              :service-line-deliverables="service_line.deliverables"
                              :service-deliverables="reportData?.service.outputs"
                              :service-line-id="service_line.id"
                              :spend-report-id="reportData.id"
                              :is-editable="isEditable"
                              @update="onDeliverableUpdate"
                              @delete="onDeleteDeliverable"
                              @add="onDeliverableUpdate"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="report-section__header q-mt-xl">
        <span class="label">Highlights and recommendations</span><span class="filler-line" />
      </div>
      <div class="row items-stretch q-mb-xl q-col-gutter-lg">
        <div class="col-6 row items-stretch">
          <div class="col card q-pa-lg">
            <div class="report-subheading">Service Highlights</div>
            <bullet-point-editor
              :key="componentKey"
              :items="unsavedData.service_highlights"
              :editable="isEditable"
              blank-message="There are no service highlights to display"
              @addNewItem="value => onAddNewBullet([value, 'service_highlights'])"
              @onItemsChange="value => onBulletsChange([value, 'service_highlights'])"
              @onDeleteItem="value => onDeleteBullet([value, 'service_highlights'])"
            />
          </div>
        </div>
        <div class="col-6 row items-stretch">
          <div class="col card q-pa-lg">
            <div class="report-subheading">Service Recommendations and Insights</div>
            <bullet-point-editor
              :key="componentKey"
              :items="unsavedData.service_recommendations"
              :editable="isEditable"
              blank-message="There are no recommendations or insights to display"
              @addNewItem="value => onAddNewBullet([value, 'service_recommendations'])"
              @onItemsChange="value => onBulletsChange([value, 'service_recommendations'])"
              @onDeleteItem="value => onDeleteBullet([value, 'service_recommendations'])"
            />
          </div>
        </div>
      </div>
      <div v-if="!is_only_contingent_labour">
        <div class="report-section__header q-mt-xl">
          <span class="label">Risks, issues and dependencies</span><span class="filler-line" />
        </div>
        <div>
          <div class="card q-pa-lg nocontent-message">
            <raid-items
              :key="componentKey"
              :editable="isEditable"
              :options="raidLogs"
              :items="unsavedData.spend_report_raid_logs"
              @addItem="onAddRaidItem"
              @removeItem="onDeleteRaidItem"
              @reorderItems="onRaidItemsChange"
            />
          </div>
        </div>
      </div>
      <div class="report-section__header q-mt-xl">
        <span class="label">Comments</span><span class="filler-line" />
      </div>
      <div v-if="!customer_mode && !isEditable && isCustomerEditable && dataChanges" class="row">
        <q-btn
          class="col-auto q-mr-md"
          label="Save Comments"
          color="positive"
          @click="saveChanges"
        />
        <q-btn
          class="col-auto q-mr-md"
          label="Revert Comments"
          color="primary"
          text-color="dark"
          @click="revertChanges"
        />
      </div>
      <div class="row items-stretch q-mb-xl q-col-gutter-lg">
        <div class="col-6 row items-stretch">
          <div class="col card q-pa-lg">
            <div class="report-subheading">{{ reportData.vendor_name }} comments</div>
            <bullet-point-editor
              :key="componentKey"
              :items="unsavedData.vendor_comments"
              :editable="areVendorCommentsEditable"
              blank-message="There are no comments to display"
              @addNewItem="value => onAddNewBullet([value, 'vendor_comments'])"
              @onItemsChange="value => onBulletsChange([value, 'vendor_comments'])"
              @onDeleteItem="value => onDeleteBullet([value, 'vendor_comments'])"
            />
          </div>
        </div>
        <div class="col-6 row items-stretch">
          <div class="col card q-pa-lg">
            <div class="report-subheading">{{ reportData.customer_name }} comments</div>
            <bullet-point-editor
              :key="componentKey"
              :items="unsavedData.customer_comments"
              :editable="isCustomerEditable || isEditable"
              blank-message="There are no comments to display"
              @addNewItem="value => onAddNewBullet([value, 'customer_comments'])"
              @onItemsChange="value => onBulletsChange([value, 'customer_comments'])"
              @onDeleteItem="value => onDeleteBullet([value, 'customer_comments'])"
            />
          </div>
        </div>
      </div>
      <div v-if="!customer_mode" class="approval-section q-mt-xl row justify-between">
        <q-btn
          v-if="isEditable"
          :disable="dataChanges"
          class="col-auto q-mr-md"
          label="Approve Report (Vendor)"
          color="primary"
          text-color="dark"
          @click="approveReport"
        />
        <q-btn
          v-if="!isEditable && is_super_admin && isCustomerEditable"
          class="col-auto q-mr-md"
          outline
          label="Un-Approve Report (Vendor)"
          color="primary"
          @click="unApproveReport"
        >
          <q-badge color="orange" floating> SA</q-badge>
        </q-btn>
        <q-btn
          v-if="is_super_admin && isCustomerEditable"
          :disable="isEditable"
          class="col-auto q-ml-md"
          label="Approve Report (Customer)"
          color="primary"
          text-color="dark"
          @click="approveReportCustomer"
        >
          <q-badge color="orange" floating> SA</q-badge>
        </q-btn>
        <q-btn
          v-if="is_super_admin && !isCustomerEditable"
          :disable="isEditable"
          class="col-auto q-ml-md"
          label="Un-Approve Report (Customer)"
          outline
          color="primary"
          @click="unApproveReportCustomer"
        >
          <q-badge color="orange" floating> SA</q-badge>
        </q-btn>
      </div>
      <div v-if="customer_mode" class="approval-section q-mt-xl row justify-between">
        <q-btn
          v-if="isCustomerEditable"
          :disable="dataChanges"
          class="col-auto q-mr-md"
          label="Approve Report"
          color="primary"
          text-color="dark"
          @click="approveReport"
        />
        <q-btn
          v-if="is_super_admin && !isCustomerEditable"
          class="col-auto q-mr-md"
          label="Un-Approve Report"
          outline
          color="primary"
          @click="unApproveReport"
        >
          <q-badge color="orange" floating> SA</q-badge>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { date } from "quasar"
import { ref } from "vue"
import { ObjectMethods, CurrencyMethods, DateMethods } from "src/modules/GlobalMethods.js"
import { Config } from "src/modules/StaticData.js"
import PriceEditor from "components/PriceEditor.vue"
import PurchaseOrderSpend from "components/charts/PurchaseOrderSpend.vue"
import SpendByServiceLine from "components/charts/SpendByServiceLine.vue"
import BulletPointEditor from "components/BulletPointEditor.vue"
import ContingentLabourReportTable from "components/ContingentLabourReportTable.vue"
import RaidItems from "components/reports/RaidItems.vue"
import ServiceLineDeliverables from "./ServiceLineDeliverables.vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

export default {
  name: "SpendReportComponent",
  components: {
    PriceEditor,
    PurchaseOrderSpend,
    SpendByServiceLine,
    BulletPointEditor,
    ContingentLabourReportTable,
    RaidItems,
    ServiceLineDeliverables,
    NewSelectorForm
  },
  props: {
    reportData: { type: Object },
    raidLogs: { type: Array },
    dataMessage: { type: String },
    userAccessLevel: { type: String, default: "standard" },
    viewMode: { type: String, default: "vendor" },
    displayConsultantDeliverables: { type: Boolean, default: false },
    componentKey: { type: Number, default: 0 }
  },
  emits: [
    "save",
    "delete",
    "revert",
    "clear",
    "approve",
    "unapprove",
    "approve-customer",
    "unapprove-customer"
  ],
  setup() {
    const reportDocument = ref(null)

    return {
      reportDocument,

      CurrencyMethods
    }
  },
  data() {
    return {
      unsavedData: JSON.parse(JSON.stringify(this.reportData)),
      dataChanges: false,
      serviceLinesToUpdate: [],
      reportPurchaseOrdersToUpdate: [],
      bulletChanges: {
        service_highlights: { add: [], update: [], delete: [] },
        service_recommendations: { add: [], update: [], delete: [] },
        vendor_comments: { add: [], update: [], delete: [] },
        customer_comments: { add: [], update: [], delete: [] }
      },
      deliverableChanges: { add: [], update: [], delete: [] },
      raidChanges: { add: [], update: [], delete: [] }
    }
  },
  computed: {
    isEditable: function() {
      return parseInt(this.reportData.vendor_approved) === 0
    },
    isCustomerEditable: function() {
      return parseInt(this.reportData.customer_approved) === 0
    },
    areVendorCommentsEditable: function() {
      return !this.customer_mode && this.isCustomerEditable
    },
    organisation: function() {
      return this.$store.getters["admin/getOrganisation"]
    },
    user: function() {
      return this.$store.getters["auth/getUser"]
    },
    is_super_admin: function() {
      return this.user && this.user.roles && this.user.roles.indexOf("super_admin") > -1
    },
    customer_mode: function() {
      return this.viewMode !== "vendor"
    },
    is_only_contingent_labour: function() {
      for (let i = 0; i < this.purchase_orders.length; i++) {
        if (!this.purchase_orders[i].contingentLabour) {
          return false
        }
      }
      return true
    },
    periodPlaceholder: function() {
      return [this.period_start, this.period_end].filter(val => val).join(" - ")
    },
    totalReportCharge: function() {
      let total = 0
      for (let index = 0; index < this.purchase_orders.length; index++) {
        const po = this.purchase_orders[index]
        const charge = this.collateCharge(po.service_lines.concat(po.consultants))
        total += charge
      }
      return total
    },
    purchase_orders: function() {
      const pos = []
      if (
        this.unsavedData &&
        this.unsavedData.spend_report_service_lines &&
        this.unsavedData.spend_report_service_lines.length
      ) {
        for (let index = 0; index < this.unsavedData.spend_report_service_lines.length; index++) {
          const serviceLine = this.unsavedData.spend_report_service_lines[index]
          if (!pos.find(elem => elem.reference === serviceLine.po_ref)) {
            const po = this.unsavedData.service.purchase_orders.find(elem => parseInt(elem.id) === parseInt(serviceLine.po_id))
            let amount = 0
            let cumulativeCharge = 0
            if (po.amount) {
              amount = parseFloat(po.amount)
            }
            if (po.cumulative_charge) {
              cumulativeCharge = parseFloat(po.cumulative_charge)
            }
            if (po.milestones && po.milestones.length) {
              for (let index = 0; index < po.milestones.length; index++) {
                const milestone = po.milestones[index]
                // const amount = parseFloat(milestone.amount).toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 })
                const currencyString = CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, milestone.amount)
                milestone.label = milestone.reference + ", " + currencyString
              }
            }
            pos.push({
              id: po.id,
              reference: serviceLine.po_ref,
              amount: amount,
              cumulative_charge: cumulativeCharge,
              service_lines: [],
              consultants: [],
              milestone: po.milestones,
              notes: ""
            })
          }
          const po = pos.find(elem => elem.reference === serviceLine.po_ref)
          if (serviceLine.delivery_model_id === 1) {
            po.consultants.push(serviceLine)
            po.contingentLabour = true
          } else {
            po.service_lines.push(serviceLine)
            po.contingentLabour = false
          }
          po.delivery_model_id = serviceLine.delivery_model_id
        }
      }
      return pos
    },
    purchase_orders_string: function() {
      return this.purchase_orders.length ? this.purchase_orders.map(po => po.reference).join(",") : ""
    },
    period_start: function() {
      return this.reportData.period_start_date
    },
    period_end: function() {
      return this.reportData.period_end_date
    },
    vendor_approved_date: function() {
      if (this.reportData?.vendor_approved && this.reportData?.vendor_approved_date !== null) {
        return date.formatDate(DateMethods.convertDateTimeFormat(this.reportData.vendor_approved_date), Config.DATETIME_FORMAT_DMMMY_HM)
      }
      return ""
    },
    badge: function() {
      return this.user.badge
    },
    customer_approved_date: function() {
      if (this.reportData?.customer_approved && this.reportData.customer_approved_date !== null) {
        return date.formatDate(DateMethods.convertDateTimeFormat(this.reportData.customer_approved_date), Config.DATETIME_FORMAT_DMMMY_HM)
      }
      return ""
    },
    customer_contract_owner: function() {
      const owner = this.reportData?.service?.contract?.customer_contract_owner
      return owner ? `${owner.first_name} ${owner.last_name}` : "Unknown"
    },
    vendor_contract_owner: function() {
      const owner = this.reportData?.service?.contract?.vendor_contract_owner
      return owner ? `${owner.first_name} ${owner.last_name}` : "Unknown"
    },
    haveBulletsChanged: function() {
      const categories = ["service_highlights", "service_recommendations", "vendor_comments", "customer_comments"]

      return categories.some(category => {
        const changes = this.bulletChanges[category]
        return changes.delete.length || changes.add.length || changes.update.length
      })
    },
    haveRaidItemsChanged: function() {
      return !!(this.raidChanges.delete.length || this.raidChanges.add.length || this.raidChanges.update.length)
    },
    haveDeliverablesChanged: function() {
      let deliverables = this.purchase_orders.map(v => v.service_lines.map(v1 => v1.deliverables || []).flat()).flat().map(v => {
        v.progress_summary = v.progress_summary || ""
        return v
      })

      let changed = this.deliverableChanges.update.filter(v => {
        return !ObjectMethods.deepEqual(
          ObjectMethods.deepSort(v),
          ObjectMethods.deepSort(deliverables.find(d => d.id === v.id) || {})
        )
      }).length > 0

      return changed || !!(this.deliverableChanges.delete.length || this.deliverableChanges.add.length)
    }
  },
  watch: {
    // this will change on a data save
    reportData: function(newVal, oldVal) {
      if (oldVal) {
        this.purgeChanges()
      }
    },
    dataMessage: function(newVal) {
      if (newVal !== "") {
        setTimeout(() => {
          this.$emit("clear")
        }, 3000)
      }
    }
  },
  methods: {
    getDeliveryModelName: function(id) {
      const services = {
        1: "Contingent Labour",
        2: "Professional Services",
        3: "Statement of Work",
        4: "Work Package"
      }

      return services[id] || ""
    },
    processHtmlContent: function(html) {
      const strippedString = html.replace(/(<([^>]+)>)/gi, "")
      if (strippedString.length < 1 || strippedString === "") {
        return "There is nothing to display"
      }
      return html
    },
    collateCharge: function(serviceLines) {
      let total = 0
      for (let index = 0; index < serviceLines.length; index++) {
        const serviceLine = serviceLines[index]
        total += parseFloat(serviceLine.period_charge)
      }
      return total
    },
    poBalance: function(po) {
      /*
      if (parseInt(this.unsavedData.customer_approved) === 0) {
        balance -= this.collateCharge(po.service_lines.concat(po.consultants))
      }
      */
      return po.amount - po.cumulative_charge - this.collateCharge(po.service_lines.concat(po.consultants))
    },
    purchase_order_milestone: function(purchaseOrder) {
      const po = this.getReportPurchaseOrder(purchaseOrder)
      return po.po_milestone_reference + ", " + CurrencyMethods.toCurrencyFormat(this.organisation?.currency?.code, po.po_milestone_amount)
    },
    poOutsidePeriod: function(po) {
      /*
      if (parseInt(this.unsavedData.customer_approved) === 1) {
        // if this report is approved, the cumulative charge will include this period
        outside = po.cumulative_charge - this.collateCharge(po.service_lines.concat(po.consultants))
      }
      */
      return po.cumulative_charge
    },
    // bullet related methods
    onAddNewBullet: function(args) {
      const val = args[0]
      const prop = args[1]
      const item = {
        position: this.unsavedData[prop].length + 1,
        content: val.trim()
      }
      this.unsavedData[prop].push(item)
      this.checkForChanges()
    },
    onDeleteBullet: function(args) {
      const item = args[0]
      const prop = args[1]
      if (item.id !== undefined) {
        this.bulletChanges[prop].delete.push(item.id)
      }
      // now remove from the array
      this.removeBulletItem(this.unsavedData[prop], item)
      this.checkForChanges()
    },
    onBulletsChange: function(args) {
      const a = args[0]
      const prop = args[1]
      this.bulletChanges[prop].add = []
      this.bulletChanges[prop].update = []
      this.unsavedData[prop] = a
      if (JSON.stringify(this.unsavedData[prop]) !== JSON.stringify(this.reportData[prop])) {
        for (let index = 0; index < a.length; index++) {
          const item = a[index]
          if (item.id === undefined) {
            this.bulletChanges[prop].add.push(item)
          } else {
            this.bulletChanges[prop].update.push(item)
          }
        }
      }
      this.checkForChanges()
    },
    /* RAID item addition and removal */
    onAddRaidItem: function(item) {
      if (this.unsavedData?.spend_report_raid_logs === undefined) {
        this.unsavedData.spend_report_raid_logs = []
      }
      const newItem = JSON.parse(JSON.stringify(item)) // create a decoupled clone
      newItem.position = (this.unsavedData?.spend_report_raid_logs ?? []).length + 1
      newItem.raid_log_id = newItem.id
      delete newItem.id

      this.unsavedData.spend_report_raid_logs.push(newItem) // add the whole item to unsavedData as we need to display details in the RaidItems component
      this.raidChanges.add.push(newItem)
      this.checkForChanges()
    },
    onRaidItemsChange: function(items) {
      this.raidChanges.add = []
      this.raidChanges.update = []
      this.unsavedData.spend_report_raid_logs = items
      if (
        JSON.stringify(this.unsavedData.spend_report_raid_logs) !==
        JSON.stringify(this.reportData.spend_report_raid_logs)
      ) {
        for (let index = 0; index < items.length; index++) {
          const item = items[index]
          if (item.id === undefined) {
            this.raidChanges.add.push(item)
          } else {
            this.raidChanges.update.push(item)
          }
        }
      }
      this.checkForChanges()
    },
    onDeleteRaidItem: function(item) {
      if (item.id !== undefined) {
        this.raidChanges.delete.push(item.id)
      }
      // now remove from the array
      this.removeRaidItem(item)
      this.checkForChanges()
    },
    removeRaidItem: function(item) {
      let prop = "id"
      if (!item.id) {
        prop = "raid_log_id"
      }
      const a = this.unsavedData.spend_report_raid_logs
      for (let i = a.length - 1; i >= 0; --i) {
        if (a[i][prop] === item[prop]) {
          a.splice(i, 1)
        }
      }
    },
    /* Deliverable addition and removal */
    onAddDeliverable: function(deliverable) {
      this.deliverableChanges.add.push(deliverable)
      this.checkForChanges()
    },
    /* Single deliverable updated, so update this.unsavedData */
    onDeliverableUpdate: function(deliverable) {
      if ("id" in deliverable && deliverable.id !== undefined) {
        let index = this.deliverableChanges.update.findIndex(d => d.id === deliverable.id)
        if (index > -1) {
          this.deliverableChanges.update[index] = deliverable
        } else {
          this.deliverableChanges.update.push(deliverable)
        }
      } else {
        let index = this.deliverableChanges.add.findIndex(d => d._tempid === deliverable._tempid)
        if (index > -1) {
          this.deliverableChanges.add[index] = deliverable
        } else {
          this.deliverableChanges.add.push(deliverable)
        }
      }
      this.checkForChanges()
    },
    onDeleteDeliverable: function(item) {
      if (item.id !== undefined) {
        this.deliverableChanges.delete.push(item.id)
        const index = this.deliverableChanges.update.findIndex(elem => elem.id === item.id)
        if (index > -1) {
          this.deliverableChanges.update.splice(index, 1)
        }
      } else {
        //it hasn't been saved yet so remove it from the Add array
        const index = this.deliverableChanges.add.findIndex(elem => elem._tempid === item._tempid)
        if (index > -1) {
          this.deliverableChanges.add.splice(index, 1)
        }
      }
      this.checkForChanges()
    },
    /* Function shared for all the bullet related data and RAID items */
    removeBulletItem: function(a, item) {
      for (let index = 0; index < a.length; index++) {
        const element = a[index]
        if (element === item) {
          a.splice(index, 1)
        }
      }
    },
    getReportPurchaseOrder: function(purchaseOrder) {
      return this.unsavedData.purchase_orders.find(elem => elem.po_id === purchaseOrder.id)
    },
    onReportPurchaseOrderChange: function(purchaseOrder) {
      const originalPO = this.reportData.purchase_orders.find(elem => elem.id === purchaseOrder.id)
      const currentPO = this.unsavedData.purchase_orders.find(elem => elem.id === purchaseOrder.id)

      // remove from array as the default
      this.reportPurchaseOrdersToUpdate.splice(
        this.reportPurchaseOrdersToUpdate.findIndex(item => item.id === purchaseOrder.id),
        1
      )
      if (currentPO.notes !== originalPO.notes) {
        // now add to the array
        this.reportPurchaseOrdersToUpdate.push(purchaseOrder)
      } else if (currentPO.po_milestone_id !== originalPO.po_milestone_id) {
        this.reportPurchaseOrdersToUpdate.push(purchaseOrder)
      }
      this.checkForChanges()
    },
    onEditorChange: function() {
      this.onServiceLineChange()
    },
    onServiceLineChange: function() {
      this.serviceLinesToUpdate = []
      for (let index = 0; index < this.unsavedData.spend_report_service_lines.length; index++) {
        const serviceLine = this.unsavedData.spend_report_service_lines[index]
        const charge = parseFloat(serviceLine.period_charge)
        const originalServiceLine = this.reportData.spend_report_service_lines.find(r => r.id === serviceLine.id)
        // check the charge
        if (parseFloat(originalServiceLine.period_charge) !== charge) {
          this.serviceLinesToUpdate.push(serviceLine)
        }
      }
      this.checkForChanges()
    },
    checkForChanges: function() {
      this.dataChanges = !!(this.serviceLinesToUpdate.length || this.reportPurchaseOrdersToUpdate.length)
      const propsToCheck = ["period_label", "vendor_approved"]
      for (let index = 0; index < propsToCheck.length; index++) {
        const prop = propsToCheck[index]
        if (this.unsavedData[prop] !== this.reportData[prop]) {
          this.dataChanges = true
        }
      }
      if (this.haveBulletsChanged) {
        this.dataChanges = true
      }
      if (this.haveRaidItemsChanged) {
        this.dataChanges = true
      }
      if (this.haveDeliverablesChanged) {
        this.dataChanges = true
      }
    },
    saveChanges: function() {
      const changes = {
        period_label: this.unsavedData.period_label,
        vendor_approved: this.unsavedData.vendor_approved,
        spend_report_service_lines: this.serviceLinesToUpdate,
        spend_report_purchase_orders: this.reportPurchaseOrdersToUpdate,
        service_highlights: this.bulletChanges.service_highlights,
        service_recommendations: this.bulletChanges.service_recommendations,
        vendor_comments: this.bulletChanges.vendor_comments,
        customer_comments: this.bulletChanges.customer_comments,
        raid_items: this.raidChanges,
        deliverables: this.deliverableChanges
      }
      this.$emit("save", changes)
    },
    revertChanges: function() {
      this.purgeChanges()
      this.$emit("revert")
    },
    purgeChanges: function() {
      this.unsavedData = JSON.parse(JSON.stringify(this.reportData))
      this.reportPurchaseOrdersToUpdate = []
      this.bulletChanges.service_highlights = { add: [], update: [], delete: [] }
      this.bulletChanges.service_recommendations = { add: [], update: [], delete: [] }
      this.bulletChanges.vendor_comments = { add: [], update: [], delete: [] }
      this.bulletChanges.customer_comments = { add: [], update: [], delete: [] }
      this.raidChanges = { add: [], update: [], delete: [] }
      this.deliverableChanges = { add: [], update: [], delete: [] }
      this.onServiceLineChange()
    },
    deleteReport: function() {
      this.$emit("delete")
    },
    approveReport: function() {
      // this should be disabled if certain conditions are not met.
      // Eg a purchase order with a milestone has not had the applicable milestone selected
      // Or the report label has not been set
      this.$emit("approve")
    },
    unApproveReport: function() {
      this.$emit("unapprove")
    },
    approveReportCustomer: function() {
      this.$emit("approve-customer")
    },
    unApproveReportCustomer: function() {
      this.$emit("unapprove-customer")
    },
    generateReport: function() {
      const w = window.open()
      w.document.write(this.reportDocument.innerHTML)
      w.document.querySelector("head").innerHTML +=
        "<link rel=\"stylesheet\" href=\"/css/spend-report.css\" type=\"text/css\"/>"
      w.document.close()
      w.setTimeout(function() {
        w.print()
      }, 1000)
    }
  }
}
</script>

<style lang="scss">
.spend-report-document {
  font-size: 16px;
}

.purchase-order-collection {
  padding: 2%;
  /* background-color: #eeeeee; */
  /* border: 1px solid rgba(0, 0, 0, 0.1); */
}

.service_lines__header {
  font-weight: 700;
  font-size: 1.6rem;
  /* border-bottom: 1px solid #000; */
  padding-bottom: 1rem;
}

.service_lines__collection {
  padding: 1rem;
  /* background-color: #e8e8e8; */
  border: 1px solid rgba(0, 0, 0, 0.2);
  margin-top: 2rem;
}

.service-line_item {
  padding-bottom: 1rem;
  margin-bottom: 3rem;
}

.report-header {
  background-color: #6c8098;
  padding: 100px 0;
  background-image: url("/images/spend-report-background.jpg");
  background-size: cover;
}

.report-header-panel {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 50px 8%;
  color: #fff;
}

.report-section {
  padding: 1em 0;
}

.report-section__header {
  font-weight: 600;
  font-size: 2rem;
  text-transform: uppercase;
  display: flex;
  line-height: 1em;
  margin-bottom: 2rem;
}

.report-section__subheader {
  margin-top: -1.5rem;
  margin-bottom: 2rem;
}

.report-section__header .label {
  flex: 0 0 auto;
}

.report-section__header .filler-line {
  flex: 1 1 auto;
  display: block;
  height: calc(1em - 4px);
}

.report-label {
  color: white;
  display: inline-block;
  font-weight: 700;
  margin-right: 0.5em;
}

.report-subheading {
  font-weight: bold;
  font-size: 1.2rem;
}

.request-count {
  font-size: 1.4rem;
}

.service-line-heading {
  font-size: 1.4rem;
  font-weight: bold;
}

.sr-grid {
  display: grid;
  grid-template-columns: auto auto auto;
}

.sr-grid-cell {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
}

.purchase-order-title {
  font-size: 1.4rem;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.actions-bar {
  position: sticky;
  top: 50px;
  background: rgba($dark-page, 0.8);
  z-index: 10;
  padding: 10px 0;
}

.nocontent-message {
  font-style: italic;
}
</style>
