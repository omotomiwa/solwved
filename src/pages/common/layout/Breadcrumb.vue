<template>
  <div class="text-h6 breadcrumb">
    I a ma bread

    <router-link v-if="vendor" :to="dashboardLink">
      {{ vendor.name }}
    </router-link>
    <span> / Service Management / Service Alerts</span>
  </div>
</template>
