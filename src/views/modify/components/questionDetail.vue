<template>
  <div class="detail-modify">
    <form-field :form-options="formOptions" :label-col="{span: 3}" :wrapper-col="{span: 18}">
      <!-- 选择题 -->
      <template v-if="questionTypeId === 1">
        <div
          v-for="(opt, oIndex) in options"
          :key="`detail-${currentItemId}-${opt}`"
          :slot="opt"
          class="flex-item"
        >
          <editor
            v-decorator="[opt, {
                rules: [{ required: true, message: `请填写选项${opt}` }],
                initialValue: option[opt]
              }]"
            style="flex:1;"
          />
          <span>
            <img
              v-for="(icon, icIndex) in getIcons(oIndex)"
              :key="`icon-${oIndex}-${icIndex}`"
              :src="icon.src"
              @click="icon.func(oIndex)"
            />
          </span>
        </div>
      </template>
      <div slot="para" class="flex-select">
        <a-select v-model="editionId" placeholder="请选择" @change="getGrades">
          <a-select-option v-for="item in editions" :key="item.id" :value="item.id">
            {{ item.editionName }}
          </a-select-option>
        </a-select>
        <a-select v-model="gradeId" placeholder="请选择" @change="getCategories">
          <a-select-option v-for="item in grades" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
        <a-select v-model="cateId" placeholder="请选择">
          <a-select-option v-for="item in categories" :key="item.id" :value="item.id">
            {{ item.text }}
          </a-select-option>
        </a-select>
      </div>
    </form-field>
    <p class="btn-box">
      <a-button @click="expend = !expend">{{ expend ? '收起更多' : '更多选项..' }}</a-button>
      <a-button type="primary" @click="save">保存</a-button>
    </p>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import icon1 from '@/assets/trash.png'
import icon2 from '@/assets/down.png'
import icon3 from '@/assets/up.png'
import FormField from '@/components/formField.vue'
import editor from '@/components/inlineEditor.vue'

export default {
  components: {
    FormField,
    editor,
  },
  data() {
    return {
      options: ['A', 'B', 'C', 'D'],
      expend: false,
      form: this.$form.createForm(this, {
        onValuesChange: this.handleChange,
      }),
      grades: [], // 年级/学期列表
      categories: [], // 章节列表
      editionId: '',
      gradeId: '',
      cateId: '',
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
      const options = [
        {
          label: '题干',
          decorator: [
            'content',
            {
              rules: [
                {
                  required: true,
                  message: '请填写题干',
                },
              ],
              initialValue: this.question,
            },
          ],
        },
        {
          label: '答案',
          type: this.questionTypeId === 1 ? 'radio' : 'slot',
          options: this.options.map((el) => ({ label: el, value: el })),
          props: {
            label: 'label',
            value: 'value',
          },
          decorator: [
            'answers',
            {
              rules: [{ required: true, message: '请选择答案' }],
              initialValue: '',
            },
          ],
        },
        {
          label: '难度',
          type: 'radio',
          decorator: [
            'difficultyCoefficient',
            {
              rule: [
                {
                  required: true,
                  message: '请选择难度',
                },
              ],
            },
          ],
          options: [
            {
              label: '基础题',
              value: '0.7',
            },
            {
              label: '中档题',
              value: '0.5',
            },
            {
              label: '难题',
              value: '0.3',
            },
          ], // 难度（越小越难） 基础题：0.7 中档题：0.5 难题：0.3
        },
        {
          label: '知识点',
          type: 'select',
          options: this.points,
          mode: 'multiple',
          props: {
            label: 'pointName',
            value: 'id',
          },
          decorator: [
            'pointIds',
            {
              rules: [
                {
                  required: true,
                  message: '请选择知识点',
                },
              ],
            },
          ],
        },
        {
          label: '解析',
          type: 'editor',
          decorator: [
            'analysis',
            {
              rules: [{ required: true, message: '请输入解析' }],
              initialValue: '',
            },
          ],
        },
      ]
      if (this.expend) {
        return options.concat([
          {
            label: '题类',
            type: 'radio',
            options: this.questionClasses,
            props: {
              label: 'questionClassName',
              value: 'id',
            },
            decorator: ['questionClassId'],
          },
          {
            label: '来源',
            type: 'radio',
            options: this.sources,
            props: {
              label: 'sourceName',
              value: 'sourceId',
            },
            decorator: ['sourceId'],
          },
          {
            label: '章节信息',
            type: 'slot',
            decorator: ['para'],
          },
          {
            label: '必备知识',
            type: 'select',
            mode: 'multiple',
            options: this.dimensionPoints,
            decorator: ['dimensionPointIds'],
            props: {
              label: 'text',
              value: 'id',
            },
          },
          {
            label: '关键能力',
            type: 'select',
            mode: 'multiple',
            options: this.dimensionCapabilities,
            decorator: ['dimensionCapabilityIds'],
            props: {
              label: 'text',
              value: 'id',
            },
          },
          {
            label: '学科素养',
            type: 'select',
            mode: 'multiple',
            options: this.dimensionAttainments,
            decorator: ['dimensionAttainmentIds'],
            props: {
              label: 'text',
              value: 'id',
            },
          },
          {
            label: '核心价值',
            type: 'select',
            mode: 'multiple',
            options: this.dimensionCoreValues,
            decorator: ['dimensionCoreValueIds'],
            props: {
              label: 'text',
              value: 'id',
            },
          },
          {
            label: '解析视频',
            type: 'upload',
            accept: 'media',
            decorator: [
              'videoUrl',
              {
                valuePropName: 'fileList',
                getValueFromEvent: this.normFile,
              },
            ],
            placeholder: '上传视频',
            customRequest: this.uploadVideo,
          },
        ])
      }
      return options
    },
    // 题目
    question() {
      return (
        (this.currentQuestion.length
          && this.currentQuestion.map((el) => el.content).join(''))
        || ''
      )
    },
    // 题目类型id
    questionTypeId() {
      if (this.currentQuestion.length) { return this.currentQuestion[0].questionTypeId }
      return 0
    },
    // 选项
    option() {
      if (this.questionTypeId === 1) {
        const answers = this.currentQuestion[this.currentQuestion.length - 1]
        const result = {}
        console.log(answers)
        for (const i of this.options) {
          let option = answers.content.split(i)[1].split('</span>')
          if (option[1].indexOf('<img') > -1) {
            option = option[1].toString()
          } else {
            option = option[0].replace('．', '')
          }
          Object.assign(result, {
            [i]: option,
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
    ...mapMutations(['updateState', 'updateItems']),
    // 上传视频
    uploadVideo({ file }) {},
    normFile(e) {
      if (Array.isArray(e)) {
        return e
      }
      return e && e.fileList
    },
    // 根据教材获取年级信息
    async getGrades(editionId) {
      const { subjectId } = this
      const res = (await this.$post('/api/paperupload/list/book.do', {
        subjectId,
        editionId,
      })) || { dataInfo: {} }
      this.grades = res.dataInfo.data || []
    },
    // 根据书本获取章节信息
    async getCategories(bookId) {
      const res = (await this.$post('/api/paperupload/list/category.do', {
        bookId,
      })) || { dataInfo: {} }
      this.categories = res.dataInfo.data || []
    },
    getIcons(index) {
      const icons = [
        {
          src: icon1,
          func: this.del,
        },
        {
          src: icon2,
          func: this.moveDown,
        },
        {
          src: icon3,
          func: this.moveUp,
        },
      ]
      if (index === 0) {
        return icons.slice(0, 2)
      }
      if (index === this.options.length - 1) {
        return [icons[0], icons[2]]
      }
      return icons
    },
    // 处理选项
    handleOptionData(futureOption) {
      let str = ''
      for (const [key, value] of Object.entries(futureOption)) {
        str += `<span>${key}．${value}</span>`
      }
      this.updateState({
        name: 'currentQuestion',
        value: [
          ...this.currentQuestion.slice(0, this.currentQuestion.length - 1),
          {
            ...this.currentQuestion[this.currentQuestion.length - 1],
            content: str,
          },
        ],
      })
    },
    del(optionIndex) {
      // 删除一个选项
      const arr = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
      ]
      const futureOption = {}
      for (let i = this.options.length - 1; i > -1; i -= 1) {
        const current = this.options[i]
        const prev = this.options[i - 1]
        if (i !== optionIndex) {
          if (i > optionIndex) {
            // 在删除的元素后的都往前一位
            Object.assign(futureOption, {
              [prev]: this.option[current],
            })
          } else {
            // 在删除元素前的位置不变
            Object.assign(futureOption, {
              [current]: this.option[current],
            })
          }
        }
      }
      this.options = arr.slice(0, this.options.length - 1)
      this.handleOptionData(futureOption)
    },
    moveDown(optionIndex) {
      const current = this.options[optionIndex]
      const next = this.options[optionIndex + 1]
      const futureOption = {
        ...this.option,
        [current]: this.option[next],
        [next]: this.option[current],
      }
      this.handleOptionData(futureOption)
    },
    moveUp(optionIndex) {
      const current = this.options[optionIndex]
      const prev = this.options[optionIndex - 1]
      const futureOption = {
        ...this.option,
        [current]: this.option[prev],
        [prev]: this.option[current],
      }
      this.handleOptionData(futureOption)
    },
    // 添加选项
    pushOption() {
      // this.options.push()
    },
    // 保存内容
    save() {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.updateItems(values)
        }
      })
    },
    handleChange(props, values) {
      console.log(values)
    },
    handleEditorChange(event, name) {
      console.log(event, name)
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
    height: 1px;
    background: rgba(231, 235, 239, 1);
    margin: 30px auto;
  }
  .flex-item {
    display: flex;
    align-items: center;
    img {
      cursor: pointer;
    }
    span {
      width: 100px;
    }
  }
  .flex-select {
    display: flex;
    .ant-select:not(:last-child) {
      margin-right: 10px;
    }
  }
}
</style>
