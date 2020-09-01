<template>
  <a-form
   :form="form"
   :layout="layout"
   :wrapper-col="wrapperCol"
   :label-col="labelCol"
  >
    <slot name="upper-slot" />
    <a-form-item
      v-for="(formItem, fIndex) in formOptions"
      :key="`${formItem.label || 'button'}-${fIndex}`"
      :label="formItem.label"
      :extra="formItem.extra"
    >
      <a-input
        v-if="formItem.type === 'input'"
        v-decorator="formItem.decorator"
        :placeholder="formItem.placeholder || `请输入 ${formItem.label}`"
        :style="formItem.style || {}"
      />
      <a-input-number
        v-if="formItem.type === 'input-number'"
        v-decorator="formItem.decorator"
      ></a-input-number>
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
      <a-checkbox-group
        v-if="formItem.type === 'checkbox'"
        v-decorator="formItem.decorator"
      >
        <a-checkbox
          v-for="opt in formItem.options"
          :key="opt[formItem.props && formItem.props.value || 'value']"
          :value="opt[formItem.props && formItem.props.value || 'value']"
        >{{ opt[formItem.props && formItem.props.label || 'label'] }}</a-checkbox>
      </a-checkbox-group>
      <a-tree-select
        v-if="formItem.type === 'tree-select'"
        v-decorator="formItem.decorator"
        :multiple="formItem.mode === 'multiple'"
        :placeholder="formItem.placeholder || `请选择 ${formItem.label}`"
        :replace-fields="formItem.replaceFields || {children:'children', title:'title', key:'key', value: 'value'}"
        :filter-tree-node="filterTreeNode"
        :tree-data="formItem.options"
        allow-clear
        show-search
      ></a-tree-select>
      <a-upload
        v-if="formItem.type === 'upload'"
        v-decorator="formItem.decorator"
        :accept="formItem.accept || '*'"
        :custom-request="formItem.customRequest"
      >
        <a-button>{{ formItem.placeholder || '点击上传' }}</a-button>
      </a-upload>
      <editor v-if="formItem.type === 'editor'" v-decorator="formItem.decorator" :id="formItem.decorator[0]" :inline="true" height="fit-content" />
      <span v-if="formItem.type === 'text'">{{ formItem.value }}</span>
      <slot v-if="formItem.type === 'slot'" :name="formItem.decorator[0]" />
    </a-form-item>
  </a-form>
</template>
<script>
import editor from './tinymce.vue'

export default {
  components: {
    editor,
  },
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
    filterTreeNode(input, treeNode) {
      // console.log(input, treeNode)
      return treeNode.componentOptions.propsData.title.indexOf(input) > -1
    },
  },
}
</script>
<style lang="less" scoped>

.ant-radio-button-wrapper, .checkbox {
  display: inline-block;
  border-radius: 20px;
  border-left: 1px solid #e9e9e9;
  margin-left: 10px;
  margin-bottom: 5px;
  &:not(:first-child){
    &::before {
      display: none;
    }
  }
  &:first-child, &:last-child {
    border-radius: 20px;
  }

}
.ant-radio-button-wrapper-checked {
  &:not(.ant-radio-button-wrapper-disabled):focus-within {
    outline: 0;
  }
  &:not(.ant-radio-button-wrapper-disabled) {
    box-shadow: none;
  }
}
</style>
