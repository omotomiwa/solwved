<script>
export default {
  name: "TextWithShowMore",
  props: {
    text: { type: String, default: "" },
    hasShowMore: { type: Boolean, default: true },
    showMoreWords: { type: Number, default: 30 },
    addSuffix: { type: Boolean, default: true }
  },
  data() {
    return {
      expanded: false
    }
  },
  computed: {
    showMessage: function() {
      let value = this.text ?? ""
      if (!this.expanded && this.isApplicable) {
        let arr = value.split(" ").slice(0, this.showMoreWords)
        if (this.addSuffix) arr.push("...")
        value = arr.join(" ")
      }
      return value
    },
    isApplicable: function() {
      return (this.text ?? "").split(" ").length > this.showMoreWords
    }
  },
  methods: {
    toggleShow: function() {
      this.expanded = !this.expanded
    }
  }
}
</script>

<template>
  <span>
    {{ showMessage }}
    <span v-if="isApplicable && addSuffix"
          class="text-primary cursor-pointer text-no-wrap"
          @click="toggleShow">
      {{ expanded ? "Show Less" : "Show More" }}
    </span>
  </span>
</template>
