<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useStore } from "vuex"
import { ClassCombinations } from "src/modules/StaticData.js"
import NewSelectorForm from "components/NewSelectorForm.vue"

const props = defineProps({})
const store = useStore()

const selectedOrganisationId = ref(null)
const linkedOrganisationId = ref(null)
const bannerDismissed = ref(false)

const user = computed(() => store.getters["auth/getUser"])
const isSuperAdmin = computed(() => !!(user.value && user.value.roles && user.value.roles.indexOf("super_admin") > -1))
const relationships = computed(() => store.getters["admin/getOrganisationRelationships"])
const organisations = computed(() => store.getters["admin/getOrganisations"])
const selectedOrganisation = computed(() => organisations.value.find(org => org.id === selectedOrganisationId.value))
const linkableOrganisations = computed(() => {
  //filter out all the linkedOrganisations
  return organisations.value.filter(organisation => {
    if (
      organisation.id === selectedOrganisationId.value ||
      organisation.currency_id !== selectedOrganisation.value.currency_id ||
      organisation.org_type !== selectedOrganisation.value.org_type
    ) {
      return false
    }
    const exists = linkedOrganisations.value.find(org => org.id === organisation.id)
    return exists === undefined
  })
})
const linkedOrganisations = computed(() => {
  const list = []
  if (relationships.value.length && organisations.value.length) {
    //process the list
    relationships.value.forEach(row => {
      let linkedOrg = null
      if (row.org1_id === selectedOrganisationId.value) {
        linkedOrg = organisations.value.find(organisation => organisation.id === row.org2_id)
      } else if (row.org2_id === selectedOrganisationId.value) {
        linkedOrg = organisations.value.find(organisation => organisation.id === row.org1_id)
      }
      if (linkedOrg) {
        list.push(linkedOrg)
      }
    })
  }
  return list
})
const allowSave = computed(() => !!(parseInt(selectedOrganisationId.value) && parseInt(linkedOrganisationId.value)))

function getRelationships() {
  const obj = { method: "get" }
  store.dispatch("admin/organisationRelationships", obj)
}

function getOrganisations(force) {
  if (organisations.value.length < 1 || force) {
    const obj = { call: "organisations", method: "get" }
    store.dispatch("admin/datacallDt", obj)
  }
}

function createNewRelationship() {
  const obj = {
    method: "post",
    data: {
      org1_id: selectedOrganisationId.value,
      org2_id: linkedOrganisationId.value
    }
  }
  store.dispatch("admin/organisationRelationships", obj).then(() => {
    linkedOrganisationId.value = null
  }).catch(e => {
    store.dispatch(
      "auth/setDataCallNotice",
      {
        title: "Fail to create relationship",
        message: JSON.parse(e.response).message || "Please try again.",
        show: true
      }
    )
  })
}

function deleteRelationship(id) {
  const obj = {
    method: "delete",
    data: { orgs: [selectedOrganisationId.value, id] }
  }
  store.dispatch("admin/organisationRelationships", obj).catch(() => {
    store.dispatch(
      "auth/setDataCallNotice",
      {
        title: "Deletion not allowed",
        message: "Those two organisations have one or more existing contracts so the relationship connot be deleted",
        show: true
      }
    )
  })
}

watch(selectedOrganisationId, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    linkedOrganisationId.value = null
  }
})

onMounted(() => {
  store.commit("auth/setBadge", "admin")
  getRelationships()
  getOrganisations()
})
</script>

<template>
  <q-page :class="ClassCombinations?.pageContainer">
    <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
      <div class="text-h2 text-weight-bold text-center text-white">Organisation Relationships</div>
      <div v-if="isSuperAdmin" class="text-h6 text-center">
        <div class="text-h6 breadcrum">
          <router-link to="/admin"> Super Admin Dashboard</router-link>
          <span> / Organisation Relationships</span>
        </div>
      </div>
      <div class="text-center row">
        <q-banner
          inline-actions
          rounded
          class="q-my-md bg-primary text-dark q-mx-auto"
          v-if="!bannerDismissed"
          dense
        >
          <template v-slot:avatar>
            <q-icon name="info" color="dark" />
          </template>
          Create links between organisations so that they can create contracts with each other
          <template v-slot:action>
            <q-btn flat label="Dismiss" @click="bannerDismissed = true" />
          </template>
        </q-banner>
      </div>
      <div v-if="isSuperAdmin">
        <div class="q-my-xl row">
          <new-selector-form
            v-model:option_id="selectedOrganisationId"
            is-filterable
            filter-key="name"
            is-clearable
            :options="organisations"
            label="Select Organisation"
            classes="col-12"
            autofocus
          />
          <div v-if="selectedOrganisationId" class="col-12">
            <div v-if="linkedOrganisations.length" class="q-my-md text-h6">Linked Organisations:</div>
            <div v-else>There are currently no linked organisations</div>
            <q-list v-if="linkedOrganisations.length" bordered separator>
              <q-item v-for="(org, index) in linkedOrganisations" :key="index" clickable dense>
                <q-item-section>{{ org.name }}</q-item-section>
                <q-item-section avatar>
                  <q-icon color="negative" name="delete" @click="deleteRelationship(org.id)" />
                </q-item-section>
              </q-item>
            </q-list>
            <div class="col-12 row items-center q-mt-lg">
              <new-selector-form
                v-model:option_id="linkedOrganisationId"
                is-filterable
                filter-key="name"
                is-clearable
                :options="linkableOrganisations"
                label="Link new organisation"
                classes="col-12"
              />
            </div>
            <div class="col-12 row items-center q-mt-lg">
              <q-btn
                label="Create New Relationship"
                class="col-auto"
                color="primary"
                text-color="dark"
                size="md"
                :disable="!allowSave"
                @click="createNewRelationship"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="q-my-xl">You are not authorised to view this page</div>
    </div>
  </q-page>
</template>
