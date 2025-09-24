import { useStore } from "vuex"
import { computed, onMounted } from "vue"

export function vendorAuth(vendorId) {
  const store = useStore()

  const user = computed(() => store.getters["auth/getUser"])
  const isVendorAdmin = computed(() => user.value?.roles?.includes("vendor_admin") ?? false)
  const isSuperAdmin = computed(() => user.value?.roles?.includes("super_admin") ?? false)
  const vendorAccess = computed(() => store.getters["vendor/getVendors"])
  const organisation = computed(() => store.getters["admin/getOrganisation"])
  const vendor = computed(() => {
    const foundVendor = vendorAccess.value.find(obj => parseInt(obj.id) === parseInt(vendorId))
    if (!foundVendor && isSuperAdmin.value) {
      return organisation.value
    }
    return foundVendor
  })
  const isAuthorised = computed(() => {
    if (isSuperAdmin.value) return true
    return vendorAccess.value.some(obj => parseInt(obj.id) === parseInt(vendorId))
  })
  const isAdminAuthorised = computed(() => {
    if (isSuperAdmin.value) return true
    const foundVendor = vendorAccess.value.find(obj => parseInt(obj.id) === parseInt(vendorId))
    return foundVendor?.isUserAdmin ?? false
  })
  const hasAccessToDocumentManagement = computed(() => {
    if (isSuperAdmin.value) return true
    return user.value?.accessCustomer.filter(obj => (obj?.access_list ?? []).includes("document_manager")).length > 0
  })

  onMounted(() => {
    if ((isVendorAdmin.value || isSuperAdmin.value) && (!vendorAccess.value || vendorAccess.value.length < 1)) {
      store.dispatch("vendor/getVendorAccess")
    }
    if (isSuperAdmin.value) {
      store.dispatch("admin/getOrganisation", vendorId)
    }
  })

  return {
    vendor,
    isAuthorised,
    isAdminAuthorised,
    hasAccessToDocumentManagement
  }
}

export function customerAuth(customerId) {
  const store = useStore()

  const user = computed(() => store.getters["auth/getUser"])
  const isCustomerAdmin = computed(() => user.value?.roles?.includes("customer_admin") ?? false)
  const isSuperAdmin = computed(() => user.value?.roles?.includes("super_admin") ?? false)
  const customerAccess = computed(() => store.getters["customer/getCustomers"])
  const organisation = computed(() => store.getters["admin/getOrganisation"])
  const customer = computed(() => {
    const foundCustomer = customerAccess.value.find(obj => parseInt(obj.id) === parseInt(customerId))
    if (!foundCustomer && isSuperAdmin.value) {
      return organisation.value
    }
    return foundCustomer
  })
  const isAuthorised = computed(() => {
    if (isSuperAdmin.value) return true
    return customerAccess.value.some(obj => parseInt(obj.id) === parseInt(customerId))
  })
  const isAdminAuthorised = computed(() => {
    if (isSuperAdmin.value) return true
    const foundCustomer = customerAccess.value.find(obj => parseInt(obj.id) === parseInt(customerId))
    return foundCustomer?.isUserAdmin ?? false
  })
  const hasAccessToDocumentManagement = computed(() => {
    if (isSuperAdmin.value) return true
    const foundVendor = user.value?.accessCustomer.find(obj => parseInt(obj.organisation_id) === parseInt(customerId))
    let access = (foundVendor?.access ?? "").split(",").filter(v => v)
    return access.includes("document_manager")
  })

  onMounted(() => {
    if ((isCustomerAdmin.value || isSuperAdmin.value) && (!customerAccess.value || customerAccess.value.length < 1)) {
      store.dispatch("customer/getCustomerAccess")
    }
    if (isSuperAdmin.value) {
      store.dispatch("admin/getOrganisation", customerId)
    }
  })

  return {
    customer,
    isAuthorised,
    isAdminAuthorised,
    hasAccessToDocumentManagement
  }
}
