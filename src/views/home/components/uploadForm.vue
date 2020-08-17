<template>
  <a-form :form="form">
    <slot></slot>
    <a-form-item v-for="item in formOptions" :key="item.label" :label="item.label">
      <a-input
        v-if="item.type === 'input'"
        v-decorator="item.decorator"
        :placeholder="item.placeholder || '请输入'"
      />
      <a-upload
        v-if="item.type === 'upload'"
        v-decorator="item.decorator"
        :accept="item.accept || '*'"
        :custom-request="item.customRequest"
      >
        <a-button> 点击上传 </a-button>
      </a-upload>
      <a-date-picker
        v-if="item.type === 'date-picker'"
        v-decorator="item.decorator"
        :mode="item.mode || 'date'"
        :placeholder="item.placeholder || '请选择'"
        :disabled-date="item.disabledDate || false"
      />
      <a-select
        v-if="item.type === 'select'"
        v-decorator="item.decorator"
        :mode="item.mode || 'default'"
        :placeholder="item.placeholder || '请选择'"
      >
        <a-select-option
          v-for="option in item.options"
          :key="option[item.props.value || 'value']"
          :value="option[item.props.value || 'value']"
        >
          {{ option[item.props.label || 'label'] }}
        </a-select-option>
      </a-select>
      <a-radio-group
        v-if="item.type === 'radio'"
        v-decorator="item.decorator"
      >
        <a-radio-button
          v-for="radio in item.options"
          :key="radio[item.props.value || 'value']"
          :value="radio[item.props.value || 'value']"
          class="radio-button"
        >
          {{ radio[item.props.label || 'label'] }}
        </a-radio-button>
      </a-radio-group>
    </a-form-item>
  </a-form>
</template>
<script>
export default {
  name: 'UploadForm',
  data() {
    return {
      form: this.$form.createForm(this, {
        onValuesChange: (props, values, value) => {
          this.$emit('change', props, values, value)
        },
      }),
    }
  },
  props: {
    formOptions: {
      type: Array,
      default: () => ([]),
    },
  },
}
</script>
<style lang="less" scoped>
.ant-radio-button-wrapper {
  border-radius: 20px;
  border-left-width: 1px !important;
  margin-left: 10px;
  margin-bottom: 5px;
  &:not(:first-child){
    &::before {
      display: none;
    }
  }
}
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  box-shadow: none;
}
</style>
