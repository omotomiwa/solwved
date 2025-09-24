<script setup>
import { computed, ref } from "vue"
import { remove as _remove, sortBy as _sortBy } from "lodash"
import { DateTime } from "luxon"
import { Config } from "src/modules/StaticData.js"
import { DateMethods } from "src/modules/GlobalMethods.js"

const props = defineProps({
  engagements: { type: Array, default: () => [] }
})

const showArchivedEngagements = ref(false)

const engagementsByVendor = computed(() => {
  const e = []
  for (let index = 0; index < props.engagements.length; index++) {
    const engagement = props.engagements[index]
    const vendor = engagement.vendor
    const item = e.find((x) => x.vendor === vendor)
    if (item === undefined) {
      e.push({ vendor: vendor, engagements: [engagement] })
    } else {
      item.engagements.push(engagement)
    }
  }
  return e
})

function sorted_engagements(engagements) {
  const e = JSON.parse(JSON.stringify(engagements))
  const sorted = _sortBy(e, ["status", "start_date"])
  const now = DateTime.now().toJSDate().getTime()

  const expired = _remove(sorted, function(elem) {
    return DateTime.fromISO(DateMethods.convertDateFormat(elem.end_date, "/", "-")).toJSDate().getTime() < now
  })
  // pull out archived engagements and add to the end
  _remove(sorted, function(elem) {
    return parseInt(elem.status_id) === 3
  })

  return sorted.concat(expired)
}

function archived_engagements(engagements) {
  const e = JSON.parse(JSON.stringify(engagements))
  const sorted = _sortBy(e, ["status", "start_date"])
  return _remove(sorted, function(elem) {
    return parseInt(elem.status_id) === 3
  })
}

function engagement_label(engagement) {
  return (
    engagement.customer +
    " / " +
    engagement.service_name +
    " / " +
    engagement.service_line +
    " / " +
    engagement.capability +
    " / " +
    engagement.competency
  )
}

function engagement_dates(engagement) {
  const start = engagement.start_date
  const end = engagement.end_date
  return "Start: " + start + ", End: " + end
}

function engagement_status(engagement) {
  const now = DateTime.now().toJSDate().getTime()
  if (
    parseInt(engagement.status_id) === 1 &&
    DateTime.fromISO(DateMethods.convertDateFormat(
      engagement.end_date,
      "/",
      "-"
    )).toJSDate().getTime() < now
  ) {
    return "expired"
  } else if (parseInt(engagement.status_id) === 1) {
    return "active"
  } else if (parseInt(engagement.status_id) === 2) {
    return "paused"
  } else if (parseInt(engagement.status_id) === 3) {
    return "archived"
  }
}

function engagement_status_message(engagement) {
  const now = DateTime.now().toJSDate().getTime()
  if (
    parseInt(engagement.status_id) === 1 &&
    DateTime.fromISO(DateMethods.convertDateFormat(
      engagement.end_date,
      "/",
      "-"
    )).toJSDate().getTime() < now) {
    const cutoff = DateTime.fromISO(DateMethods.convertDateFormat(
      engagement.end_date,
      "/",
      "-"
    )).plus({ days: 30 }).toFormat(Config.DATE_FORMAT_DLY)
    return ". You have until " + cutoff + " to complete all of your delivery records."
  } else if (parseInt(engagement.status_id) === 2) {
    return ". This engagement is on a temporary hold. You can view but not edit records"
  }
  return ""
}

function engagement_status_class(engagement) {
  if (engagement_status(engagement) === "active") {
    return "text-positive text-weight-bold"
  } else if (engagement_status(engagement) === "expired") {
    return "text-negative text-weight-bold"
  } else if (engagement_status(engagement) === "paused") {
    return "text-indigo text-weight-bold"
  } else if (engagement_status(engagement) === "inactive") {
    return "text-negative text-weight-bold"
  }
  return ""
}

function view_records_label(engagement) {
  return parseInt(engagement.status_id) === 2 ? "View Delivery Records (Read only)" : "View / Edit Delivery Records"
}


function newDeliveryRecordLink(id) {
  return "/delivery-record/" + id + "/new"
}

function deliveryRecordLink(id) {
  return "/delivery-records/" + id
}
function timesheetLink(id) {
  return "/timesheet-records/" + id
}



function generateInvoice(id){
  return "/submit-timesheets/" + id
}
</script>

<template>
  <div class="text-h5 text-bold text-center q-mb-md">Contract Engagements</div>
  <q-list>
    <q-item
      v-for="(vendor, index) in engagementsByVendor"
      :key="index"
      class="q-mb-md q-pa-md"
      style="border-radius: 5px"
    >
      <q-item-section class="vendorGroup q-pb-md">
        <q-item-label class="text-h6 text-weight-bold q-mb-sm text-primary">
          {{ vendor.vendor }}
        </q-item-label>
        <q-list>
          <q-item
            v-for="(engagement, index) in sorted_engagements(vendor.engagements)"
            :key="index"
            class="column"
            :class="parseInt(engagement.status_id) === 3 ? 'hidden' : ''"
          >
            <q-item-label class="text-weight-bold">
              {{ engagement_label(engagement) }}
            </q-item-label>
            <q-item-label>
              {{ engagement_dates(engagement) }}. Status:
              <span :class="engagement_status_class(engagement)">
                <span class="ucfirst">{{ engagement_status(engagement) }}</span>
                {{ engagement_status_message(engagement) }}
              </span>
            </q-item-label>
            <q-item-label class="row">
              <div class="q-mr-md">Actions:</div>
              <div class="q-mr-md">
                <router-link :to="deliveryRecordLink(engagement.id)" class="text-primary">
                  {{ view_records_label(engagement) }}
                </router-link>
              </div>
              <div v-if="parseInt(engagement.status_id) === 1" class="q-mr-md">
                <router-link :to="newDeliveryRecordLink(engagement.id)" class="text-primary">
                  Create New Delivery Record
                </router-link>
              </div>
              <div class="q-mr-md" >
                <router-link :to="timesheetLink(engagement.id)" class="text-primary ">
                   Timesheet Records
                </router-link>
              </div>
             
              <div >
                <router-link :to="generateInvoice(engagement.id)" class="text-primary">
                 Submit Timesheet Records
                </router-link>
              </div>
            </q-item-label>
          </q-item>
        </q-list>
        <div v-if="archived_engagements(vendor.engagements).length" class="q-pl-md q-mt-lg">
          <q-btn
            outline
            :label="showArchivedEngagements ? 'Hide Archived' : 'Show Archived'"
            @click="showArchivedEngagements = !showArchivedEngagements"
          />
        </div>
        <q-list v-if="showArchivedEngagements && archived_engagements(vendor.engagements).length">
          <q-item
            v-for="(engagement, index) in archived_engagements(vendor.engagements)"
            :key="index"
            class="column archived q-mt-xl"
            :class="showArchivedEngagements ? 'show-archived' : ''"
          >
            <q-item-label class="text-weight-bold">
              {{ engagement_label(engagement) }}
            </q-item-label>
            <q-item-label>
              {{ engagement_dates(engagement) }}. Status:
              <span :class="engagement_status_class(engagement)">
                <span class="ucfirst">{{ engagement_status(engagement) }}</span>
                {{ engagement_status_message(engagement) }}
              </span>
            </q-item-label>
            <q-item-label class="row">
              <div class="q-mr-md">Actions:</div>
              <div class="q-mr-md">
                <router-link :to="deliveryRecordLink(engagement.id)">
                  {{ view_records_label(engagement) }}
                </router-link>
              </div>
            </q-item-label>
          </q-item>
        </q-list>
      </q-item-section>
    </q-item>
  </q-list>
</template>
