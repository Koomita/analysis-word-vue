<template>
  <div class="detail-modify">
    <a-skeleton :loading="loading" active>
      <form-field
        ref="formField"
        :form-options="formOptions"
        :label-col="{span: 3}"
        :wrapper-col="{span: 18}"
      >
        <!-- 选择题 -->
        <template v-if="option.length && questionTypeId !== 5">
          <div
            v-for="(opt, oIndex) in option"
            :key="`detail-${currentItemId}-${opt.option}`"
            :slot="opt.option"
            class="flex-item"
          >
            <editor
              v-decorator="[name || opt.option, {
                rules: [{ required: true, message: `请填写选项${opt.option}` }],
                initialValue: opt.value
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
        <!-- 完形填空 -->
        <template v-if="questionTypeId === 5">
          <template v-for="(ans, ansIndex) in option">
            <div
              v-for="(opt, oIndex) in ans.options"
              :key="`${ans.answerNo}${ansIndex}-${opt.option}${oIndex}`"
              :slot="`${ans.answerNo}-${opt.option}`"
            >
              <!-- <p v-if="oIndex === 0">{{ ans.answerNo }}</p> -->
              <div class="flex-item">
                <editor
                  v-decorator="[`${ans.answerNo}-${opt.option}`, {
                    rules: [{ required: true, message: `请填写选项${opt.option}` }],
                    initialValue: opt.value
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
              <p v-if="oIndex === ans.options.length - 1" class="del-tip" @click="delTest(ansIndex)">删除该小题</p>
            </div>
          </template>
        </template>
        <div slot="para" class="flex-select">
          <a-select v-model="editionId" placeholder="请选择" @change="getGrades">
            <a-select-option
              v-for="item in editions"
              :key="item.id"
              :value="item.id"
            >{{ item.editionName }}</a-select-option>
          </a-select>
          <a-select v-model="gradeId" placeholder="请选择" @change="getCategories">
            <a-select-option v-for="item in grades" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
          </a-select>
          <a-select v-model="cateId" placeholder="请选择">
            <a-select-option
              v-for="item in categories"
              :key="item.id"
              :value="item.id"
            >{{ item.text }}</a-select-option>
          </a-select>
        </div>
      </form-field>
      <p class="btn-box">
        <a-button @click="expend = !expend">{{ expend ? '收起更多' : '更多选项..' }}</a-button>
        <a-button type="primary" @click="save">保存</a-button>
      </p>
    </a-skeleton>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import icon1 from '@/assets/trash.png'
import icon2 from '@/assets/down.png'
import icon3 from '@/assets/up.png'
import FormField from '@/components/formField.vue'
import editor from '@/components/inlineEditor.vue'
import { fillOption } from '@/utils/regexp'

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
      loading: false,
      answerCurrentIndex: [], // 选项答案当前所在currentQuestion数组中的index
      fileList: [],
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
      let formOptions = [
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
          type: 'editor',
        },
        {
          label: '答案',
          type: this.questionTypeId === 1 ? 'radio' : 'editor',
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
      if (this.option.length) {
        // 选择题
        const { option } = this
        const list = []
        if (this.questionTypeId === 5) {
          option.forEach((el) => {
            el.options.forEach((item, index) => {
              list.push({
                label: index === 0 ? `${el.answerNo}   ${item.option}` : item.option,
                type: 'slot',
                decorator: [`${el.answerNo}-${item.option}`],
              })
            })
          })
        } else {
          option.forEach((el) => {
            list.push({
              label: `${el.option}`,
              type: 'slot',
              decorator: [el.option],
            })
          })
        }
        formOptions = [formOptions[0], ...list, ...formOptions.slice(1)]
      }
      if (this.expend) {
        formOptions = formOptions.concat([
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
            accept: '.mp4',
            decorator: [
              'videoUrl',
              {
                valuePropName: 'fileList',
                getValueFromEvent: this.normFile,
                initialValue: this.fileList,
              },
            ],
            placeholder: '上传视频',
            customRequest: this.uploadVideo,
          },
        ])
      }
      return formOptions
    },
    // 题目
    question() {
      if (!this.currentQuestion || !this.currentQuestion.length || this.loading) return ''
      if ([1, 5].includes(this.questionTypeId)) {
        return this.currentQuestion
          .slice(0, this.currentQuestion.length - 1)
          .map((el) => el.content)
          .join('')
      }
      return this.currentQuestion.map((el) => el.content).join('') || ''
    },
    // 题目类型id
    questionTypeId() {
      if (this.currentQuestion.length) {
        return this.currentQuestion[0].questionTypeId
      }
      return 0
    },
    // 选项
    option() {
      if (!this.questionTypeId) return []
      if (this.questionTypeId === 5) {
        const answers = this.currentQuestion[this.currentQuestion.length - 1]
        // 完形填空选项
        const { text } = answers
        return fillOption(text)
      }
      let options = []
      this.currentQuestion.filter((el) => el.options && el.options.length).forEach((el) => {
        options = options.concat(el.options || [])
      })
      return options
    },
  },
  watch: {
    currentItemId: {
      handler() {
        this.loading = true
        setTimeout(() => {
          this.loading = false
        }, 200)
      },
    },
  },
  mounted() {
    this.getAllLists()
  },
  methods: {
    ...mapActions(['getAllLists']),
    ...mapMutations(['updateState', 'updateItems']),
    // 上传视频
    async uploadVideo(options) {
      const {
        onSuccess, onError, file, onProgress,
      } = options
      const that = this
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onload = async () => {
        const binary = this.result
        onProgress()
        try {
          const res = await that.$upload('/api/upload/fileUploadByByte.do', { file: binary })
          if (res.dataInfo.path) {
            onSuccess('Ok')
            this.fileList = [{ ...that.fileList[0], url: res.dataInfo.path, status: 'done' }]
          } else {
            const { msg } = res || { res: '网络出错' }
            that.$message.error(msg)
            onError(msg)
          }
        } catch (err) {
          that.$message.error('请求出错')
          onError({ err })
        }
      }
    },
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
    // 删除小题
    delTest(index) {

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
      this.$refs.formField.form.validateFields((err, values) => {
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
      width: 80px;
      margin-right: -80px;
      text-align: center;
    }
  }
  .del-tip {
    color: #999;
    text-align: right;
    cursor: pointer;
    margin-top: 10px;
  }
  .flex-select {
    display: flex;
    .ant-select:not(:last-child) {
      margin-right: 10px;
    }
  }
}
</style>
