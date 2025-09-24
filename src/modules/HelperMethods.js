import { StringMethods } from "src/modules/GlobalMethods.js"

export const OrganisationTypeMethods = {
  /**
   *
   * @param isTrue boolean
   * @param options object { isPlural = false, isCamelCase = true }
   * @returns {*|string}
   */
  changeConsultant: (isTrue = false, options = {}) => {
    const { isPlural = false, isCamelCase = true } = options

    let value = isTrue ? "contractor" : "consultant"
    if (isPlural) value += "s"

    return isCamelCase ? StringMethods.ucfirst(value) : value
  },

  /**
   * Default RFI and RAID will be in upper case. If it's plural then it will be RFIs and RAIDs.
   *
   * @param isTrue
   * @param options object { isPlural = false, isCamelCase = false, isUpperCase = false }
   * @returns {*|string}
   */
  changeRaid: (isTrue = false, options = {}) => {
    const { isPlural = false, isCamelCase = false, isUpperCase = false } = options

    let value = isTrue ? "RFI" : "RAID"
    if (isCamelCase) value = StringMethods.ucfirst(value)
    if (isPlural) value += "s"

    return isUpperCase ? StringMethods.upper(value) : value
  }
}

export const AccessManagementMethods = {

  /**
   * Check access for specific permissions
   *
   * @param access array []
   * @param user object null
   * @returns {boolean}
   */
  checkAccess: (access, user = null) => {
    if (
      (user?.roles || []).includes("super_admin") ||
      (user?.roles || []).includes("vendor_admin") ||
      (user?.roles || []).includes("customer_admin")
    ) {
      return true
    }
    for (const accessKey of access) {
      let obj = (user?.accessCustomer ?? []).filter(item => {
        return (item?.access_list ?? []).includes(accessKey)
      }).length > 0
      if (obj) {
        return true
      }
    }

    return false
  }
}
