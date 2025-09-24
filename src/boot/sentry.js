import { boot } from 'quasar/wrappers'
import * as Sentry from "@sentry/vue";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ app, router }) => {
    Sentry.init({
      app,
      //dsn: process.env.VUE_SENTRY_URL || '',
      dsn: import.meta.env.VITE_SENTRY_URL || process.env.VUE_SENTRY_URL || '',
      integrations: [
        Sentry.browserTracingIntegration({ router }),
        Sentry.replayIntegration()
      ],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for tracing.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,

      // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled

      //tracePropagationTargets: process.env.VUE_SENTRY_TRACE_PROPAGATION_TARGETS.split(',') ?? ["localhost"],
      tracePropagationTargets: (import.meta.env.VITE_SENTRY_TRACE_PROPAGATION_TARGETS || "localhost").split(","),
      // Capture Replay for 10% of all sessions,
      // plus for 100% of sessions with an error
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0
    })
})
