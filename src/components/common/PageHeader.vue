<template>
  <div class="text-center">
    <div class="text-h2 text-weight-bold text-center text-white" v-if="title">{{ title }}</div>
    <div v-if="breadcrumbs.length" class="text-h6 breadcrumb text-center q-mt-sm">
      <template v-for="(breadcrumb,index) in breadcrumbs">
        <span v-if="index !== 0" :key="'span-'+index"> / </span>
        <router-link v-if="breadcrumb?.route" :to="breadcrumb?.route" class="text-primary" :key="'router-'+index">
          {{ breadcrumb.name }}
        </router-link>
        <span v-else class="text-h5 q-mt-md" :key="'router-'+index">{{ breadcrumb.name }}</span>
      </template>
    </div>
    <div class="text-h5 q-mt-md" v-if="subTitle">{{ subTitle }}</div>
  </div>
</template>

<script>
import { defineComponent } from "vue"

export default defineComponent({
  name: "PageHeader",
  props: {
    title: { type: String, default: "" },
    subTitle: { type: String, default: "" },
    breadcrumbs: { type: Array, default: () => [] }
  }
})
</script>
