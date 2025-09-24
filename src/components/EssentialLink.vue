<template>
  <q-item
    clickable
    :to="this.link"
    class="text-white"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" size="md" />
    </q-item-section>

    <q-item-section>
      <q-item-label class="vertical-middle">{{ title }}</q-item-label>
      <!-- <q-item-label caption>
        {{ caption }}
      </q-item-label> -->
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from "vue"

export default defineComponent({
  name: "EssentialLink",
  props: {
    title: { type: String, required: true },
    caption: { type: String, default: "" },
    link: { type: String, default: "#" },
    icon: { type: String, default: "" }
  },
  methods: {
    onClick: function() {
      this.$router.push({ path: this.link })
    }
  }
})
</script>
