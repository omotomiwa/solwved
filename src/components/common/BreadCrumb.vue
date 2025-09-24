<template>
  <q-breadcrumbs :align="align" class="q-mt-md" active-color="primary">
    <q-breadcrumbs-el active-class="swlved-breadcrumb-active"
                      v-for="item in items"
                      :key="item.link"
                      :to="item.link"
                      :label="item.title"
                      :disable="false" />
  </q-breadcrumbs>
  <!-- <ul class="text-h6 breadcrumb">
    <li>
      <span v-if="item.link==route.fullPath">{{item.title}}</span>
      <router-link v-else :to="item.link">{{item.title}} / </router-link>
    </li>
  </ul> -->
</template>

<script setup>
import { computed, onMounted } from "vue"
import { useStore } from "vuex"
import { useRoute } from "vue-router"
import _ from "lodash"
import { OrganisationTypeMethods } from "src/modules/HelperMethods.js"

const store = useStore()
const route = useRoute()

const props = defineProps({
  mergeItems: Object,
  organisation: { type: Object, required: true },
  align: { type: String, required: false, default: "center" }
})

const items = computed(() => {
  const menus = createItems() || {}
  if (menus.consultants && "title" in menus.consultants) {
    menus.consultants.title = OrganisationTypeMethods.changeConsultant(
      store.getters["admin/getIsBuiltEnvironment"],
      { isPlural: true }
    )
  }
  if (menus.raid && "title" in menus.raid) {
    menus.raid.title = OrganisationTypeMethods.changeRaid(
      store.getters["admin/getIsBuiltEnvironment"],
      { isPlural: true }
    )
  }
  return menus
})

function createItems() {
  const urlArray = route.path.split("/").filter(val => val)
  const basePath = `/${urlArray[0]}/${urlArray[1]}`
  const urlPathArray = _.remove(urlArray, (v, i) => i > 1)

  const items = {}

  if (props && props.organisation && props.organisation.name) {
    items.base = { title: props.organisation.name, link: basePath }
    let itemPath = basePath
    let previousItem = ""
    let index = 0
    urlPathArray.forEach(path => {
      index++
      itemPath = `${itemPath}/${path}`
      let objLabel = path
      if (isInt(objLabel)) {
        // this is required to avoid object key problem with integers
        objLabel = previousItem + "_id"
      } else {
        previousItem = path
      }
      if (index < urlPathArray.length) {
        items[objLabel] = {
          title: _.startCase(path),
          link: itemPath
        }
      } else {
        items[objLabel] = {
          title: _.startCase(path)
        }
      }
    })
  }

  return {
    ...items,
    ...props.mergeItems
  }
}

function isInt(value) {
  return !isNaN(value) && !isNaN(parseInt(Number(value)))
}

onMounted(() => {
  createItems()
})
</script>

<style>
.breadcrumb {
  margin-left: 0;
  padding-left: 0;
  list-style-type: none;
}

.breadcrumb li {
  display: inline;
}

.breadcrumb a {
  text-decoration: none;
  color: rgb(85, 26, 139);
}
</style>
