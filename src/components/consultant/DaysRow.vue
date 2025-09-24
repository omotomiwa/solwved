<template>
      <q-card class="full-width" flat bordered>
        <q-card-section>
          <div class="row output-row-container q-pa-xs-sm q-pa-lg-none q-mb-xs-sm q-mb-lg-none"
               :class="allowChanges ? '' : 'disable-interaction'"
          >
            <div class="row output-row q-mb-sm q-col-gutter-sm" :class="showRemoveButton ? '' : 'fullwidth'">
             
              <q-input
                v-model.number="localData.effort.monday"
                class="col-xs-6 col-sm-6 col-md-3 col-lg-2"
                color="primary"
                outlined
                label="Monday"
                stack-label
                label-color="white"
                type="text"
                
              
                
                @blur="sanitizeInputs()"
              />
              <q-input
                v-model.number="localData.effort.tuesday"
                class="col-xs-6 col-sm-6 col-md-3 col-lg-2"
                color="primary"
                outlined
                label="Tuesday"
                stack-label
                label-color="white"
                type="text"
                
               
                
                @blur="sanitizeInputs()"
              />
               <q-input
                v-model.number="localData.effort.wednesday"
                class="col-xs-6 col-sm-6 col-md-3 col-lg-2"
                color="primary"
                outlined
                label="Wednesday"
                stack-label
                label-color="white"
                type="text"
                
              
                
                @blur="sanitizeInputs()"
              />
              <q-input
                v-model.number="localData.effort.thursday"
                class="col-xs-6 col-sm-6 col-md-3 col-lg-2"
                color="primary"
                outlined
                label="Thursday"
                stack-label
                label-color="white"
                type="text"
                
               
                
                @blur="sanitizeInputs()"
              />
              <q-input
                v-model.number="localData.effort.friday"
                class="col-xs-6 col-sm-6 col-md-3 col-lg-2"
                color="primary"
                outlined
                label="Friday"
                stack-label
                label-color="white"
                type="text"
               
                
                @blur="sanitizeInputs()"
              />
              
              <q-input
                v-model.number="localData.effort.saturday"
                class="col-xs-6 col-sm-6 col-md-3 col-lg-2"
                color="primary"
                outlined
                label="Saturday"
                stack-label
                label-color="white"
                type="text"
                
               
                
                @blur="sanitizeInputs()"
              />
              <q-input
                v-model.number="localData.effort.sunday"
                class="col-xs-6 col-sm-6 col-md-3 col-lg-2"
                color="primary"
                outlined
                label="Sunday"
                stack-label
                label-color="white"
                type="text"
                
                
                
                @blur="sanitizeInputs()"
              />
              <q-input
                v-model.number="localData.effort.total"
                class="col-xs-6 col-sm-6 col-md-3 col-lg-2"
                color="primary"
                outlined
                label="Total Units"
                stack-label
                label-color="white"
                type="text"
                
               
                
                @blur="sanitizeInputs()"
              />
             
              <q-input
                v-model="localData.notes"
                class="col-12"
                color="primary"
                outlined
                :disable="allowChanges === false"
                label="Notes"
                stack-label
                label-color="white"
                type="text"
                maxlength="255"
                autogrow
              />
            </div>
            
           
          </div>
        </q-card-section>
      </q-card>
    </template>
    
    <script>
    import { nextTick } from "vue"
    import { ObjectMethods } from "src/modules/GlobalMethods.js"
    import NewSelectorForm from "components/NewSelectorForm.vue"
    import MediaWidget from "components/MediaWidget.vue"
    
    export default {
      name: "DaysRow",
      components: {
        
        
      },
      props: [
        "projectOptions",
        "availableOutputs",
        "usedOutputs",
        "outputData",
        "effortSuffix",
        "showRemoveButton",
        "allowChanges",
        "orgId"
      ],
      emits: ["update", "requestOutput", "removeRow"],
      data() {
        return {
          defaultAttachment: {
            id: null,
            organisation_id: this.orgId ?? 0,
            name: null,
            model_id: this.outputData.id ?? 0,
            model: "deliveryRecordOutput",
            metadata: "attachment",
            accepts: ".pdf, image/*"
          },
          attachmentIndex: 0,
          localData: {
            
            output_id: this.outputData.output_id,
            sub_output_id: this.outputData.sub_output_id,
            project_id: this.outputData.project_id,
            output_status: this.outputData.output_status,
            output_rag: this.outputData.output_rag,
            output_type: this.outputData.output_type,
            completion: this.outputData.completion,
            effort: {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
    total: 0
  },
            notes: this.outputData.notes,
            attachment: {
              ...this.defaultAttachment,
              organisation_id: this.orgId,
              model_id: this.outputData.id ?? 0
            },
            fileList: {
              delete: { attachment: [] }
            }
          },
          flagOptions: ["Green", "Amber", "Red"],
          statusOptions: ["Not Started Yet", "In Progress", "Delivered", "On Hold"],
          typeOptions: ["Deliverable", "Recurring Deliverable", "Contribution"]
        }
      },
      computed: {
        permittedOutputs: function() {
          /*
          const a = []
          this.availableOutputs.forEach(element => {
            if (this.usedOutputs.indexOf(element.id) < 0) {
              a.push(element)
            }
            if (this.localData.id === element.id) {
              a.push(element)
            }
          })
          */
          return this.availableOutputs
        },
        subOutputOptions: function() {
          let a = []
          const selectedOutput = JSON.parse(JSON.stringify(this.availableOutputs)).find(
            (element) => parseInt(element.id) === parseInt(this.outputData.output_id)
          )
          if (
            selectedOutput &&
            selectedOutput.children &&
            Array.isArray(selectedOutput.children) &&
            selectedOutput.children.length &&
            this.outputData.output_type === "Deliverable"
          ) {
            a = selectedOutput.children
          }
          a.unshift({ id: 0, name: "n/a" })
          return a
        }
      },
      watch: {
        localData: {
          async handler(val) {
            await nextTick()
            this.$emit("update", val)
          },
          deep: true
        },
        "localData.output_status": function(val) {
          if (val === "Delivered" && parseFloat(this.localData.completion) === 0) {
            this.localData.completion = 99
          }
        },
        "localData.attachment": {
          handler() {
            this.attachmentIndex++
          },
          deep: true
        },
        subOutputOptions: function(newVal) {
          if (newVal.length < 2) {
            // be sure to set this to zero as the selector will be hidden
            this.localData.sub_output_id = 0
          }
        },
        outputData: function() {
          console.log({
            delete: { attachment: [] },
            ...(this.outputData.fileList ?? {})
          })
          this.localData = {
            output_id: this.outputData.output_id,
            sub_output_id: this.outputData.sub_output_id,
            project_id: this.outputData.project_id,
            output_status: this.outputData.output_status,
            output_rag: this.outputData.output_rag,
            output_type: this.outputData.output_type,
            completion: this.outputData.completion,
            effort: this.outputData.effort,
            notes: this.outputData.notes,
            attachment: {
              ...this.defaultAttachment,
              ...this.outputData.attachment
            },
            fileList: {
              delete: { attachment: [] },
              ...(this.outputData.fileList ?? {})
            }
          }
        }
      },
      methods: {
        removeRow: function() {
          this.$emit("removeRow")
        },
        sanitizeInputs: function() {
          this.localData.effort = this.roundToNearestQuarter(this.localData.effort)
        },
        roundToNearestQuarter: function(num) {
          return (Math.round(num * 4) / 4).toFixed(2)
        },
        onRequestNewOutput: function() {
          // this.$refs.outputSelector.hidePopup()
          this.$emit("requestOutput")
        },
        onCreateMedia: function(obj, oldObj) {
          if (obj.archived === 0) this.localData.attachment = obj
          if (oldObj.id) this.localData.fileList.delete.attachment.push(oldObj.id)
        },
        onDeleteMedia: function(obj) {
          this.localData.attachment = ObjectMethods.decouple({
            ...this.defaultAttachment,
            organisation_id: this.orgId ?? 0,
            model_id: this.outputData.id ?? 0
          })
          if (obj.id) this.localData.fileList.delete.attachment.push(obj.id)
        }
      },
      mounted() {
        this.attachmentIndex++
        this.localData.attachment = {
          ...this.defaultAttachment,
          ...this.outputData.attachment,
          organisation_id: this.orgId
        }
        console.log({
          delete: { attachment: [] },
          ...(this.outputData.fileList ?? {})
        })
        this.localData.fileList = {
          delete: { attachment: [] },
          ...(this.outputData.fileList ?? {})
        }
      }
    }
    </script>
    
    <style lang="scss" scoped>
    .remove-button {
      align-self: center;
    }
    
    .q-field {
      font-size: 12px;
    }
    
    .q-field__label {
      font-weight: 700;
    }
    
    .disable-interaction * {
      pointer-events: none;
      user-select: none;
    }
    </style>
    
    <style lang="scss">
    .output-row {
      width: calc(100% - 40px);
    }
    
    .output-row.fullwidth {
      width: calc(100% + 8px);
    }
    
    .screen--sm .output-row,
    .screen--xs .output-row {
      width: 100%;
    }
    
    .output-row-container {
      justify-content: space-between;
    }
    
    .screen--md .output-row-container,
    .screen--sm .output-row-container,
    .screen--xs .output-row-container {
      border: 1px solid #c3c3c3;
      box-shadow: 0 1px 3px rgb(0 0 0 / 20%), 0 1px 1px rgb(0 0 0 / 14%), 0 2px 1px -1px rgb(0 0 0 / 12%);
      justify-content: flex-end;
    }
    </style>
    