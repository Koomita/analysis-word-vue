<template>
  <div class="detail-modify">
    <a-form :form="form" :label-col="{span: 3}" :wrapper-col="{span: 18}">
      <a-form-item label="题干">
        <editor :default-content="question" />
      </a-form-item>
      <template v-if="questionTypeId === 1">
        <a-form-item
          v-for="opt in options"
          :key="`detail-${currentItemId}-${opt}`"
          :label="opt">
          <editor :default-content="option[opt]" />
        </a-form-item>
        <a-button> <a-icon type="plus" /> 添加选项</a-button>
      </template>
      <a-form-item
       v-for="formItem in formOptions"
       :key="`${currentItemId}-${formItem.label}`"
       :label="formItem.label"
      >
        <editor v-if="formItem.type === 'editor'" />
        <a-radio-group v-if="formItem.type === 'radio'">
          <a-radio-button
            v-for="opt in formItem.options"
            :key="`answer-${opt}`"
            :value="opt"
            class="radio-button"
          >
            {{ opt }}
          </a-radio-button>
        </a-radio-group>
        <a-select
          v-if="formItem.type === 'select'"
          :mode="formItem.mode || 'default'"
          :placeholder="formItem.placeholder || '请选择..'"
        >
          <a-select-option
            v-for="opt in formItem.options"
            :key="opt[formItem.props.value || 'value']"
            :value="opt[formItem.props.value || 'value']"
          >
            {{ opt[formItem.props.label || 'label'] }}
          </a-select-option>
        </a-select>
        <a-upload v-if="formItem.type === 'upload'"></a-upload>
      </a-form-item>
    </a-form>
    <p class="btn-box">
      <a-button @click="expend = !expend">{{ expend ? '收起更多' : '更多选项..' }}</a-button>
      <a-button type="primary">保存</a-button>
    </p>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import editor from './editor.vue'

export default {
  components: {
    editor,
  },
  data() {
    return {
      options: ['A', 'B', 'C', 'D'],
      expend: false,
      form: this.$form.createForm(this),
    }
  },
  computed: {
    ...mapState([
      'currentItemId',
      'currentQuestion',
      'questionTypes',
      'points',
      'sources',
      'questionClasses',
      'dimensionPoints',
      'dimensionCapabilities',
      'dimensionAttainments',
      'dimensionCoreValues',
    ]),
    formOptions() {
      const options = [{
        label: '答案',
        type: this.questionTypeId === 1 ? 'radio' : 'slot',
        slot: <editor defaultContent={''} />,
        options: this.options,
      }, {
        label: '难度',
        type: 'radio',
      }, {
        label: '知识点',
        type: 'select',
      }, {
        label: '解析',
        type: 'editor',
      }]
      if (this.expend) {
        return options.concat([{
          label: '题类',
          type: 'radio',
          options: this.questionClasses,
          props: {
            label: 'getQuestionTypes',
            value: 'id',
          },
        }, {
          label: '来源',
          type: 'radio',
          options: this.sources,
          props: {
            label: 'sourceName',
            value: 'sourceId',
          },
        }, {
          label: '章节信息',
          type: 'slot',
        }, {
          label: '必备知识',
          type: 'select',
          mode: 'mutiple',
          options: this.dimensionPoints,
        }, {
          label: '关键能力',
          type: 'select',
          mode: 'mutiple',
          options: this.dimensionCapabilities,
        }, {
          label: '学科素养',
          type: 'select',
          mode: 'mutiple',
          options: this.dimensionAttainments,
        }, {
          label: '核心价值',
          type: 'select',
          mode: 'mutiple',
          options: this.dimensionCoreValues,
        }, {
          label: '解析视频',
          type: 'upload',
          accept: 'media',
        }])
      }
      return options
    },
    // 题目
    question() {
      return (this.currentQuestion.length && this.currentQuestion.map((el) => el.content).join('')) || ''
    },
    // 题目类型id
    questionTypeId() {
      if (this.currentQuestion.length) return this.currentQuestion[0].questionTypeId
      return 0
    },
    // 选项
    option() {
      return {}
    },
  },
  mounted() {
    this.getQuestionTypes()
    this.getPoints()
  },
  methods: {
    ...mapActions(['getQuestionTypes', 'getPoints']),
  },
}
</script>
<style lang="less" scoped>
.detail-modify {
  .btn-box {
    text-align: right;
    .ant-btn:not(:last-child) {
      margin-right: 15px;
    }
  }
}
</style>
