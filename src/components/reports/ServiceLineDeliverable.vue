<template>
  <div class="row q-pa-md q-mb-md">
    <div class="col q-pr-lg">
      <div class="q-mb-md text-weight-bold">{{ props.item.name }}</div>
      <div v-if="localData" class="row q-col-gutter-lg q-mb-md">
        <new-selector-form
          v-model:option_id="localData.stage"
          :options="stageOptions"
          label="Stage"
          is-filterable
          option-label=""
          option-val-key=""
          classes="col"
          default-class="full-width"
          dense
          :readonly="!props.isEditable"
          @valChange="onStageChange"
        />
        <new-selector-form
          v-model:option_id="localData.status"
          :options="statusOptions"
          label="Status"
          is-filterable
          option-label=""
          option-val-key=""
          classes="col"
          default-class="full-width"
          dense
          :readonly="!props.isEditable"
          :bg-color="getStatusColour()"
        />
      </div>
      <div style="font-size: small">
        <div>Progress</div>
        <div class="q-px-md">
          <q-slider
            v-if="localData"
            v-model="localData.progress"
            :min="0"
            :max="100"
            label
            :label-value="localData.progress + '%'"
            label-always
            markers
            :marker-labels="markerLabels"
            switch-label-side
            :readonly="!props.isEditable"
            color="primary"
            label-text-color="dark"
          />
        </div>
      </div>
    </div>
    <div class="col q-ml-lg">
      <div>Progress Summary</div>
      <q-editor
        v-if="props.isEditable && localData"
        v-model="localData.progress_summary"
        :readonly="!props.isEditable"
        :placeholder="'Summarise the progress for ' + props.item.name + ' here'"
        min-height="6rem"
        :toolbar="[
          ['unordered', 'ordered'],
          ['bold', 'italic', 'underline'],
          ['link'],
          ['removeFormat'],
          ['undo', 'redo'],
        ]"
        ref="editorRef"
        @paste="onPaste"
      />
      <div v-else class="q-pa-md" v-html="localData?.progress_summary" />
      <div v-if="props.isEditable" class="row q-mt-md justify-end">
        <q-btn
          icon="delete"
          label="Remove"
          outline
          color="white"
          @click="() => emit('delete', props.item)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import NewSelectorForm from "components/NewSelectorForm.vue"

const props = defineProps({
  item: Object,
  isEditable: Boolean
})

const emit = defineEmits(["update", "delete"])

const localData = ref({
  progress_summary: "",
  stage: "Not started",
  progress: 0
})

const editorRef = ref(null)
const markerLabels = ref({ 0: "0%", 25: "25%", 50: "50%", 75: "75%", 100: "100%" })

const stageOptions = computed(() => ["Not started", "In progress", "Delivered", "On hold"])
const statusOptions = computed(() => ["Green", "Amber", "Red"])

watch(
  localData,
  (newValue) => emit("update", newValue),
  { deep: true }
)

const getStatusColour = () => {
  return {
    Green: "positive",
    Amber: "warning",
    Red: "negative"
  }[localData.value?.status] || "transparent"
}

const onStageChange = () => {
  if (localData.value.stage === "Delivered") {
    localData.value.progress = 100
  }
}

const onPaste = evt => {
  // Let inputs do their thing, so we don't break pasting of links.
  if (evt.target.nodeName === "INPUT") return
  let text, onPasteStripFormattingIEPaste
  evt.preventDefault()
  evt.stopPropagation()
  if (evt.originalEvent && evt.originalEvent.clipboardData.getData) {
    text = evt.originalEvent.clipboardData.getData("text/plain")
    editorRef.value.runCmd("insertText", text)
  } else if (evt.clipboardData && evt.clipboardData.getData) {
    text = evt.clipboardData.getData("text/plain")
    editorRef.value.runCmd("insertText", text)
  } else if (window.clipboardData && window.clipboardData.getData) {
    if (!onPasteStripFormattingIEPaste) {
      onPasteStripFormattingIEPaste = true
      editorRef.value.runCmd("ms-pasteTextOnly", text)
    }
    onPasteStripFormattingIEPaste = false
  }
}

onMounted(() => {
  if (props.item && Object.entries(props.item).length > 0) {
    for (const [key, value] of Object.entries(props.item)) {
      localData.value[key] = key === "progress_summary" ? (value ?? "") : value
    }
  }
})
</script>
