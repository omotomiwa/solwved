<script setup>
import { computed } from "vue"
import { useStore } from "vuex"
import { UserAccessTypes } from "src/modules/StaticData.js"
import DashboardCard from "src/components/common/DashboardCard.vue"

const props = defineProps({
  cards: { type: Array, default: () => [] },
  isAdmin: { type: Boolean, default: false },
  subscribed: { type: Boolean, default: false },
  users: { type: Object, default: null },
})

const store = useStore()

const organisation = computed(() => store.getters["admin/getOrganisation"])
const accessList = computed(() => {
  return (props.users?.accessCustomer ?? []).find(a => a.organisation_id === organisation.value.id)?.access_list ?? []
})

function passesRestrictions(card) {
  let res = true
  if (
    ("notAllowed" in card && card.notAllowed.includes(organisation.value?.org_type))
    || (card.admin && !props.isAdmin)
    || (card.requiresSubscription && !props.subscribed)
    || ("has_access" in card && !card.has_access)
    || ("isShow" in card && !card.isShow)
  ) {
    res = false
  }

  if ("requiredPermission" in card && res) {
    res = (
      (card.requiredPermission ?? []).filter(v => accessList.value.includes(v))
    ).length === card.requiredPermission.length

    if (!res && card.requiredPermission.includes(UserAccessTypes.SERVICE_CATALOGUE_VIEW.value)) {
      res = accessList.value.includes(UserAccessTypes.SERVICE_CATALOGUE_MANAGER.value)
    }
  }

  return res
}
</script>

<template>
  <div v-if="props.cards && props.cards.length" class="row col q-col-gutter-md q-mb-xl">
    <template v-for="(card, index) in props.cards" :key="index">
      <dashboard-card
        v-if="passesRestrictions(card)"
        :title="card.title"
        :description="card.description ? card.description : ''"
        :link="card.link"
        :linkText="card.linkText"
        :admin="card.admin"
        :requires-subscription="card.requiresSubscription"
        :subscribed="props.subscribed"
        :comingSoon="!!card.comingSoon"
      >
        <!-- <ul v-if="card.childItems && card.childItems.length">
          <li v-for="(item, j) in card.childItems" :key="j">
            <router-link v-if="item.link" :to="item.link">{{ item.label }}</router-link>
            <span v-else>{{ item.label }}</span>
          </li>
        </ul> -->
      </dashboard-card>
    </template>
  </div>
</template>
