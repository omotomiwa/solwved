import { boot } from "quasar/wrappers"
import { createInertiaApp } from "@inertiajs/inertia-vue3"
import { createApp, h } from "vue"

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  createInertiaApp({
    resolve: name => import(`./../pages/${name}`),
    setup({ el, App, props, plugin }) {
      createApp({ render: () => h(App, props) })
        .use(plugin)
        .mount(el)
    }
  })
})
