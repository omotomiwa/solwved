<template>
  <div class="column w-standard q-pa-xs-md q-pa-lg-lg q-mt-xs-md q-mt-lg-xs swlvd-container-bg">
    <div class="text-h4 text-weight-bold text-white">
      Vendor Area
    </div>
    <div class="text-h6 breadcrumb">
      <router-link v-if="vendor" :to="dashboardLink">
        {{ vendor.name }}
      </router-link>
      <span> / Service Management</span>
    </div>
  </div>
</template>
