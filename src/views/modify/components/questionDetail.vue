<template>
  <div class="detail-modify">
    <a-form :form="form" :label-col="{span: 3}" :wrapper-col="{span: 18}">
      <a-form-item label="题干">
        <editor v-decorator="['question', { rules: [{required: true}] }]" :default-content.sync="question" />
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
       v-for="(formItem, formIndex) in formOptions"
       :key="`${currentItemId}-${formItem.label}`"
       :label="formItem.label"
      >
        <editor v-if="formItem.type === 'editor'" v-decorator="formItem.decorator" />
        <a-radio-group v-if="formItem.type === 'radio'" v-decorator="formItem.decorator">
          <a-radio-button
            v-for="opt in formItem.options"
            :key="`answer-${opt[formItem.props ? formItem.props.value : 'value']}`"
            :value="opt[formItem.props ? formItem.props.value : 'value']"
            class="radio-button"
          >
            {{ opt[formItem.props ? formItem.props.label : 'label'] }}
          </a-radio-button>
        </a-radio-group>
        <a-select
          v-if="formItem.type === 'select'"
          v-decorator="formItem.decorator"
          :mode="formItem.mode || 'default'"
          :placeholder="formItem.placeholder || '请选择..'"
        >
          <a-select-option
            v-for="opt in formItem.options"
            :key="opt[formItem.props ? formItem.props.value : 'value']"
            :value="opt[formItem.props ? formItem.props.value : 'value']"
          >
            {{ opt[formItem.props ? formItem.props.label : 'label'] }}
          </a-select-option>
        </a-select>
        <a-upload v-if="formItem.type === 'upload'">
          <a-button>上传视频</a-button>
        </a-upload>
        <div v-if="formItem.type === 'slot'" class="flex-select">
          <a-select placeholder="请选择" @change="getGrades">
            <a-select-option v-for="item in editions" :key="item.id" :value="item.id">
              {{ item.editionName }}
            </a-select-option>
          </a-select>
          <a-select placeholder="请选择" @change="getCategories">
            <a-select-option v-for="item in grades" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
          <a-select placeholder="请选择">
            <a-select-option v-for="item in categories" :key="item.id" :value="item.id">
              {{ item.text }}
            </a-select-option>
          </a-select>
        </div>
        <div v-if="formIndex === 4" class="line"></div>
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
      grades: [], // 年级/学期列表
      categories: [], // 章节列表
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
      'editions',
      'subjectId',
    ]),
    formOptions() {
      const options = [{
        label: '答案',
        type: this.questionTypeId === 1 ? 'radio' : 'slot',
        slot: <editor defaultContent={''} />,
        options: this.options.map((el) => ({ label: el, value: el })),
        decorator: ['answer', {
          rules: [{ required: true, message: '请选择答案' }],
        }],
      }, {
        label: '难度',
        type: 'radio',
        decorator: ['hard', {
          rule: [{
            required: true,
            message: '请选择难度',
          }],
        }],
        options: [{
          label: '难',
          text: 'hard',
        }],
      }, {
        label: '知识点',
        type: 'select',
        options: this.points,
        props: {
          label: 'pointName',
          value: 'id',
        },
        decorator: ['point', {
          rules: [{
            required: true,
            message: '请选择知识点',
          }],
        }],
      }, {
        label: '解析',
        type: 'editor',
        decorator: ['analysis', {
          rules: [{ required: true, message: '请输入解析' }],
        }],
      }]
      if (this.expend) {
        return options.concat([{
          label: '题类',
          type: 'radio',
          options: this.questionClasses,
          props: {
            label: 'questionClassName',
            value: 'id',
          },
          decorator: ['questionClass'],
        }, {
          label: '来源',
          type: 'radio',
          options: this.sources,
          props: {
            label: 'sourceName',
            value: 'sourceId',
          },
          decorator: ['source'],
        }, {
          label: '章节信息',
          type: 'slot',
        }, {
          label: '必备知识',
          type: 'select',
          mode: 'multiple',
          options: this.dimensionPoints,
          decorator: ['dimensionPoint'],
          props: {
            label: 'text',
            value: 'id',
          },
        }, {
          label: '关键能力',
          type: 'select',
          mode: 'multiple',
          options: this.dimensionCapabilities,
          decorator: ['dimensionCapabilities'],
          props: {
            label: 'text',
            value: 'id',
          },
        }, {
          label: '学科素养',
          type: 'select',
          mode: 'multiple',
          options: this.dimensionAttainments,
          decorator: ['dimensionAttainments'],
          props: {
            label: 'text',
            value: 'id',
          },
        }, {
          label: '核心价值',
          type: 'select',
          mode: 'multiple',
          options: this.dimensionCoreValues,
          decorator: ['dimensionCoreValues'],
          props: {
            label: 'text',
            value: 'id',
          },
        }, {
          label: '解析视频',
          type: 'upload',
          accept: 'media',
          decorator: ['video'],
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
      if (this.questionTypeId === 1) {
        const answers = this.currentQuestion[this.currentQuestion.length - 1]
        const result = {}
        for (const i of this.options) {
          Object.assign(result, {
            [i]: answers.content.split(i)[1].split('</span>')[0].replace('．', ''),
          })
        }
        return result
      }
      return {}
    },
  },
  mounted() {
    this.getAllLists()
  },
  methods: {
    ...mapActions(['getAllLists']),
    // 根据教材获取年级信息
    async getGrades(editionId) {
      const { subjectId } = this
      const res = await this.$post('/api/paperupload/list/book.do', { subjectId, editionId }) || { dataInfo: {} }
      this.grades = res.dataInfo.data || []
    },
    // 根据书本获取章节信息
    async getCategories(bookId) {
      const res = await this.$post('/api/paperupload/list/category.do', { bookId }) || { dataInfo: {} }
      this.categories = res.dataInfo.data || []
    },
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
  .line {
    width: 100%;
    height:1px;
    background:rgba(231,235,239,1);
    margin: 30px auto;
  }
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
  .flex-select {
    display: flex;
    .ant-select:not(:last-child) {
      margin-right: 10px;
    }
  }
}
</style>
