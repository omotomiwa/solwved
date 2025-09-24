<template>
  <q-card style="min-width: 350px">
    <q-card-section>
      <div class="text-h6">
        Please enter the name of the output you require, along with any other details
      </div>
      <div class="text-subtitle2">
        This will be sent to {{ vendor_poc_name }} for review
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-input
        v-model="newOutputName"
        label-color="white"
        color="primary"
        dense
        autofocus
      />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        color="white"
        outline
        label="Cancel"
        @click="close"
      />
      <q-btn
        color="primary"
        text-color="dark"
        label="Submit Request"
        @click="close"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
export default {
  name: "OutputRequestForm",
  props: ["vendor_poc"],
  emits: ["close"],
  data() {
    return {
      newOutputName: ""
    }
  },
  computed: {
    vendor_poc_name: function() {
      return this.vendor_poc ? this.vendor_poc.first_name + " " + this.vendor_poc.last_name : " "
    }
  },
  methods: {
    close: function() {
      this.$emit("close")
    }
  }
}
</script>
