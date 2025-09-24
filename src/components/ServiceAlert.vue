<template>
  <q-card
    class="q-pa-md bg-grey-3 no-shadow service-alert"
    :class="{ acknowledged: status === 'closed' }"
  >
    <div class="row inline items-center">
      <div
        v-if="status === 'open'"
        class="verified"
      >
        <q-icon
          name="check"
          color="green"
          size="2rem"
          class="q-pr-sm"
        />
        Open
      </div>
      <q-icon
        name="warning"
        color="warning"
        size="2rem"
        class="q-pr-sm"
      />
      <h1 style="line-height: 1em">
        {{ props.title || "Service Alert" }}
      </h1>
    </div>
    <q-card-section
      vertical
      style="padding: 0"
    >
      <div class="row">
        <div class="title">
          Raised by:
        </div>
        <div class="details">
          {{ props.userName }}
        </div>
      </div>
      <div class="row">
        <div class="title">
          Date Raised:
        </div>
        <div class="details">
          {{ new Date(createdAt).toLocaleDateString("en-GB") }}
        </div>
      </div>
      <div class="row">
        {{ props.description }}
      </div>
      <div class="row">
        <span
          class="more-information"
          @click="router.push('/vendor/3/service-alerts/1')"
        >
          View more
          <q-icon name="chevron_right" />
        </span>
      </div>
    </q-card-section>

    <q-btn
      v-if="!acknowledged"
      class="q-my-sm"
      color="primary"
      text-color="dark"
      label="Acknowledge Alert"
      @click="$emit('updateStatus', props.id)"
    />
  </q-card>
</template>

<script setup>
import { toRefs } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
defineEmits(["updateStatus"])
const props = defineProps({
  id: { type: Number, default: null },
  title: { type: String, default: null },
  description: { type: String, default: null },
  status: { type: String, default: null },
  userName: { type: String, default: null },
  createdAt: { type: String, default: null }
})
const { createdAt } = toRefs(props)
</script>

<style scoped lang="scss">
.service-alert {
  width: 100%;
  margin-bottom: 1rem;
  border: 1px solid #ccc;

  .verified {
    position: absolute;
    top: 1em;
    right: 1em;
    display: flex;
    align-items: center;
    font-size: 1em;
    color: green;
  }
}

.acknowledged {
  opacity: 0.5;
  pointer-events: none;
}

h1 {
  font-weight: 600;
}

.row {
  .title {
    font-weight: 600;
    font-size: 1em;
    margin-right: 0.5em;
  }
}

.more-information {
  font-size: 1rem;
  font-weight: bold;
  display: block;
  margin: 1rem 0;

  &:hover {
    cursor: pointer;
  }
}
</style>
