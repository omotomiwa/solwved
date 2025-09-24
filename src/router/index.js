import { route } from "quasar/wrappers"
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from "vue-router"
import routes from "./routes"
import { useLocalStorage } from "src/composables/localStorage.js"
import { localStorageKey } from "src/modules/StaticData.js"
import { AccessManagementMethods, OrganisationTypeMethods } from "src/modules/HelperMethods.js"

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

const { setLocalData, getLocalData } = useLocalStorage()

export default route(function({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeResolve((to, from, next) => {
      store.commit("admin/setIsBuiltEnvironment", false)
      if (to.matched.some(record => record.meta.requiresAuth)) {
        store.dispatch("auth/checkLogin").then(user => {
          if ("accessRequired" in to.meta &&
            !AccessManagementMethods.checkAccess(
              to.meta.accessRequired,
              user || []
            )) {
            next({ name: "access-denied", replace: true })
          } else {
            if ("vendor_id" in to.params || "customer_id" in to.params) {
              store.dispatch("admin/checkOrganisation", to.params.vendor_id || to.params.customer_id).then(organisation => {
                if ("notAllowed" in to.meta && to.meta.notAllowed.includes(organisation?.org_type)) {
                  next({ name: "access-denied", replace: true })
                }
              }).finally(() => {
                if (!to.meta.skipPathSave) {
                  if (to.path !== getLocalData(localStorageKey.PAGE) && to.query !== getLocalData(localStorageKey.PAGE_QUERY)) {
                    setLocalData(localStorageKey.PREVIOUS_PAGE, getLocalData(localStorageKey.PAGE))
                    setLocalData(localStorageKey.PREVIOUS_PAGE_QUERY, getLocalData(localStorageKey.PAGE_QUERY))
                  }
                  setLocalData(localStorageKey.PAGE, to.path)
                  setLocalData(localStorageKey.PAGE_QUERY, to.query)
                }
                next()
              })
            } else {
              if (!to.meta.skipPathSave) {
                if (to.path !== getLocalData(localStorageKey.PAGE) && to.query !== getLocalData(localStorageKey.PAGE_QUERY)) {
                  setLocalData(localStorageKey.PREVIOUS_PAGE, getLocalData(localStorageKey.PAGE))
                  setLocalData(localStorageKey.PREVIOUS_PAGE_QUERY, getLocalData(localStorageKey.PAGE_QUERY))
                }
                setLocalData(localStorageKey.PAGE, to.path)
                setLocalData(localStorageKey.PAGE_QUERY, to.query)
              }
              next()
            }
          }
        }).catch(() => {
          next({ path: "/login", replace: true })
        })
      } else {
        if (!to.meta.skipPathSave) {
          if (to.path !== getLocalData(localStorageKey.PAGE) && to.query !== getLocalData(localStorageKey.PAGE_QUERY)) {
            setLocalData(localStorageKey.PREVIOUS_PAGE, getLocalData(localStorageKey.PAGE))
            setLocalData(localStorageKey.PREVIOUS_PAGE_QUERY, getLocalData(localStorageKey.PAGE_QUERY))
          }
          setLocalData(localStorageKey.PAGE, to.path)
          setLocalData(localStorageKey.PAGE_QUERY, to.query)
        }
        next()
      }
    }
  )
  Router.afterEach(to => {
    let title = to.meta?.title || ""
    if (title.includes("__consultant__")) {
      title = title.replace(
        "__consultant__",
        OrganisationTypeMethods.changeConsultant(
          store.getters["admin/getIsBuiltEnvironment"]
        )
      )
    }
    if (title.includes("__consultants__")) {
      title = title.replace(
        "__consultants__",
        OrganisationTypeMethods.changeConsultant(
          store.getters["admin/getIsBuiltEnvironment"],
          {
            isPlural: true
          }
        )
      )
    }
    if (title.includes("__raid__")) {
      title = title.replace(
        "__raid__",
        OrganisationTypeMethods.changeRaid(
          store.getters["admin/getIsBuiltEnvironment"]
        )
      )
    }
    if (title.includes("__raids__")) {
      title = title.replace(
        "__raids__",
        OrganisationTypeMethods.changeRaid(
          store.getters["admin/getIsBuiltEnvironment"],
          {
            isPlural: true
          }
        )
      )
    }

    document.title = title ? "SOWLVED - " + title : "SOWLVED"
  })
  return Router
})
