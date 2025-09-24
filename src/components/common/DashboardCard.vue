<script setup>
import { useRouter } from "vue-router"

const router = useRouter()

const props = defineProps({
  title: { type: String, default: "Please add title prop" },
  description: { type: String, default: "Please add description prop" },
  link: { type: String, default: "" },
  linkText: { type: String, default: "GO" },
  admin: { type: Boolean, default: false },
  subscribed: { type: Boolean, default: false },
  requiresSubscription: { type: Boolean, default: false },
  comingSoon: { type: Boolean, default: false }
})

function checkComingSoon(event) {
  if (props.comingSoon) {
    event.preventDefault()
    event.stopPropagation()
    alert("Coming soon!")
  } else {
    router.push(props.link)
  }
}
</script>

<template>
  <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 row swlvd-card-row">
    <q-card v-ripple flat
            @click="event => checkComingSoon(event)"
            class="col column justify-between relative-position swlvd-card cursor-pointer text-dark"
    >
      <q-card-section class="swlvd-card-overlay">
        <div class="text-h4 text-dark swlvd-card-title">
          {{ props.title }}
        </div>
        <div class="q-mt-sm swlvd-card-body">{{ props.description }}</div>
      </q-card-section>
      <!-- <q-card-actions align="left" class="q-px-md q-py-xs q-mb-md">
        <q-btn
          v-if="props.link != ''"
          color="primary"
          text-color="dark"
          size="md"
          padding="xs lg"
          :to="props.link"
          @click="event => checkComingSoon(event)"
        >
          {{ props.linkText }}
        </q-btn>
      </q-card-actions> -->
      <div class="row absolute-top-right">
        <q-badge v-if="props.admin" color="accent">Admin Only</q-badge>
        <!--        <q-badge v-if="props.requiresSubscription" color="accent" class="q-ml-xs">Premium</q-badge>-->
      </div>
    </q-card>
  </div>
</template>
