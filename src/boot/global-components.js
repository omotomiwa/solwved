import { boot } from "quasar/wrappers"
import Breadcrumbs from "../pages/common/layout/Breadcrumb"

export default boot(async ({ app }) => {
  app.component("Breadcrumbs", Breadcrumbs)
})
