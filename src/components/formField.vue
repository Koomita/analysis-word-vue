<template>
  <a-form
   :form="form"
   :layout="layout"
   :wrapper-col="wrapperCol"
   :label-col="labelCol"
  >
    <a-form-item
      v-for="(formItem, fIndex) in formOptions"
      :key="`${formItem.label || 'button'}-${fIndex}`"
      :label="formItem.label"
    >
      <a-input
        v-if="formItem.type === 'input'"
        v-decorator="formItem.decorator"
        :placeholder="formItem.placeholder || `请输入 ${formItem.label}`"
        :style="formItem.style || {}"
      />
      <a-select
        v-if="formItem.type === 'select'"
        v-decorator="formItem.decorator"
        :mode="formItem.mode || 'default'"
        :placeholder="formItem.placeholder || `请选择 ${formItem.label}`"
        :show-search="formItem.showSearch || formItem.filterable"
        :filter-option="formItem.filterable ? typeof formItem.filterOption === 'function' ? formItem.filterOption : filterOption : () => {}"
        :style="formItem.style || {}"
      >
        <a-select-option
          v-for="opt in formItem.options"
          :key="opt[formItem.props && formItem.props.value || 'value']"
          :value="opt[formItem.props && formItem.props.value || 'value']"
        >
          {{ opt[formItem.props && formItem.props.label || 'label'] }}
        </a-select-option>
      </a-select>
      <a-radio-group
        v-if="formItem.type === 'radio'"
        v-decorator="formItem.decorator"
      >
        <a-radio-button
          v-for="opt in formItem.options"
          :key="opt[formItem.props && formItem.props.value || 'value']"
          :value="opt[formItem.props && formItem.props.value || 'value']"
        >
          {{ opt[formItem.props && formItem.props.label || 'label'] }}
        </a-radio-button>
      </a-radio-group>
      <span v-if="formItem.type === 'text'">{{ formItem.value }}</span>
      <slot v-if="formItem.type === 'slot'" :name="formItem.decorator[0]" />
    </a-form-item>
  </a-form>
</template>
<script>
export default {
  props: {
    formOptions: {
      type: Array,
      default: () => ([]),
    },
    layout: {
      type: String,
      default: 'vertical',
    },
    wrapperCol: {
      type: Object,
      default: () => ({}),
    },
    labelCol: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      form: this.$form.createForm(this, {
        onValuesChange: this.handleValuesChange,
      }),
    }
  },
  methods: {
    handleValuesChange(props, values, value) {
      this.$emit('change', props, values, value)
    },
    filterOption(input, option) {
      return option.component.children[0].text.indexOf(input) > -1
    },
  },
}
</script>
