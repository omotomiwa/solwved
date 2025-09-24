import { store } from "quasar/wrappers"
import { createStore } from "vuex"
import consultant from "./consultant"
import vendor from "./vendor"
import customer from "./customer"
import auth from "./auth"
import admin from "./admin"
import contract from "./contract"
import common from "./common"
import site from "./site"
import { OrganisationType } from "src/modules/StaticData.js"

// import example from './module-example'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store(function(/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      admin,
      auth,
      consultant,
      vendor,
      customer,
      contract,
      common,
      site
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING
  })

  Store.watch(
    state => state.admin.organisation,
    newOrganisation => {
      Store.commit(
        "admin/setIsBuiltEnvironment",
        newOrganisation.org_type === OrganisationType.BUILT_ENVIRONMENT
      )
    }
  )

  return Store
})
