<script>
export default {
  name: "PreviewDialog",
  components: {},
  props: {
    showDialog: { type: Boolean, default: false },
    fileType: { type: String, default: "" },
    file: { type: String, default: "" }
  },
  emits: ["close"],
  data() {
    return {
      show: false
    }
  },
  watch: {
    showDialog: {
      handler(newVal) {
        this.show = newVal
      },
      immediate: true
    }
  },
  computed: {
    hasDescription: function() {
      // Check if the slot exists and returns any content
      return !!this.$slots.description && this.$slots.description().length > 0
    }
  }
}
</script>

<template>
  <q-dialog
    v-model="show"
    @hide="$emit('close')"
  >
    <q-card style="width: 1200px; max-width: 80vw;">
      <q-card-section class="q-pa-none">
        <template v-if="file">
          <q-btn v-if="fileType !== 'pdf'"
                 class="absolute-top-right z-top" color="light" icon="close"
                 flat round dense v-close-popup />
          <q-img v-if="fileType === 'image'"
                 :src="file" spinner-color="primary" fit="contain" style="max-height: 82vh; max-width: 100%;">
            <div v-if="hasDescription"
                 class="absolute-bottom text-center">
              <slot name="description"></slot>
            </div>
          </q-img>
          <iframe v-else-if="fileType === 'pdf'"
                  :src="file"
                  style="max-height: 82vh; max-width: 100%; width: 100%; height: 100vh">
          </iframe>
          <div v-else>This file type is not supported by preview</div>
        </template>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
