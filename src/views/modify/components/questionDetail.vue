<template>
  <div class="detail-modify">
    <a-skeleton :loading="loading" active>
      <form-field
        ref="formField"
        :form-options="formOptions"
        :label-col="{span: 3}"
        :wrapper-col="{span: 18}"
      >
        <!-- 非判断题 -->
        <template v-if="questionTypeId !== 3 && option.length">
          <!-- 普通选择题 -->
          <template v-if="!isOptionGroup">
            <div
              v-for="(opt, oIndex) in option"
              :key="`detail-${currentItemId}-${opt.option}`"
              :slot="opt.option"
            >
              <div class="flex-item">
                <editor
                  v-decorator="[opt.option, {
                  rules: [{ required: true, message: `请填写选项${opt.option}` }],
                  initialValue: opt.value
                }]"
                  :id="opt.option"
                  :inline="true"
                  style="flex: 1;"
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
              <a-button v-if="oIndex === option.length - 1" class="add-btn" @click="pushOption">
                <a-icon type="plus" />添加选项
              </a-button>
            </div>
          </template>
          <!-- 完形填空/选项分组的选择题 -->
          <template v-else>
            <template v-for="(ans, ansIndex) in option">
              <div
                v-for="(opt, oIndex) in ans.options"
                :key="`${ans.answerNo}${ansIndex}-${opt.option}${oIndex}`"
                :slot="`${ans.answerNo}-${opt.option}`"
              >
                <div class="flex-item">
                  <editor
                    v-decorator="[`${ans.answerNo}-${opt.option}`, {
                    rules: [{ required: true, message: `请填写选项${opt.option}` }],
                    initialValue: opt.value
                  }]"
                    :id="`${ans.answerNo}-${opt.option}`"
                    :inline="true"
                    style="flex:1;"
                  />
                  <span>
                    <img
                      v-for="(icon, icIndex) in getIcons(oIndex)"
                      :key="`icon-${oIndex}-${icIndex}`"
                      :src="icon.src"
                      @click="icon.func(oIndex, ansIndex)"
                    />
                  </span>
                </div>
                <template v-if="oIndex === ans.options.length - 1">
                  <p class="del-tip" @click="delTest(ansIndex)">删除该小题</p>
                  <template v-if="ansIndex === option.length - 1">
                    <a-button class="add-btn" @click="pushOption">
                      <a-icon type="plus" />添加小题
                    </a-button>
                  </template>
                </template>
              </div>
            </template>
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
import { v4 } from 'uuid'
import { mapState, mapActions, mapMutations } from 'vuex'
import icon1 from '@/assets/trash@2x.png'
import icon2 from '@/assets/down@2x.png'
import icon3 from '@/assets/up@2x.png'
import FormField from '@/components/formField.vue'
import editor from '@/components/tinymce.vue'
import formOptionMixins from './formOptionMixins'
import {
  formatTableString,
  formatTableOptions,
  adjustOrder,
} from '../utils/utils'

export default {
  mixins: [formOptionMixins],
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
      adjustOptionIndex: [], // 调整的选项索引，完形填空用
      fileList: [], // 上传视频
      optionLen: 4, // 选项数
    }
  },
  computed: {
    ...mapState([
      'content',
      'currentItemId',
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
      'items',
      'subjects',
      'questionTypes',
    ]),
    currentQuestion() {
      // 找出当前题目的内容
      return this.content.filter((el) => el.itemId === this.currentItemId)
    },
    // 是否为完形填空
    isFillup() {
      if (!this.currentQuestion || !this.currentQuestion.length) return false
      return (
        this.currentQuestion[this.currentQuestion.length - 1].content.indexOf(
          '<table',
        ) > -1 && this.questionTypeId === 5
      )
    },
    // 题目
    question() {
      if (!this.currentQuestion || !this.currentQuestion.length || this.loading) { return '' }
      // 完形填空题目，选项在最后一条，内容为表格
      if (this.isFillup) {
        return this.currentQuestion
          .filter((el, i) => i < this.currentQuestion.length - 1)
          .map((el) => el.content)
          .join('')
      }
      // 把有选项的content从题干中筛除再map
      return (
        this.currentQuestion
          .filter((el) => !el.options || !el.options.length)
          .map((el) => el.content)
          .join('') || ''
      )
    },
    // 题目类型id
    questionTypeId() {
      if (this.currentQuestion.length) {
        return this.currentQuestion[0].questionTypeId
      }
      return 0
    },
    // 判断当前选择题是单选、多选还是不定项
    chooseType() {
      const {
        questionTypeId, currentQuestion, subjects, questionTypes,
      } = this
      if (!questionTypeId || questionTypeId !== 1) return ''
      // 自定义的id
      const { id } = currentQuestion[0]
      // 先从subjects找，找不到再找questionTypes里的
      const item = subjects.find((el) => el.id === id) || questionTypes.find((el) => el.id === id)
      const name = item.subjectTitle || item.name
      const types = {
        选择: 'radio',
        单选: 'radio',
        单项选择: 'radio',
        多选: 'checkbox',
        多项选择: 'checkbox',
        不定项: 'checkbox',
      }
      let type
      for (const [key, value] of Object.entries(types)) {
        if (name.indexOf(key) > -1) {
          type = value
          break
        }
      }
      return type
    },
    // 选项是否分开，非一行n个选项
    optionSplit() {
      return (
        this.currentQuestion.filter((el) => el.options && el.options.length)
          .length > 1
      )
    },
    // 选项
    option() {
      if (!this.questionTypeId || this.questionTypeId === 3) return []
      if (this.isFillup) {
        // 完形填空选项
        const answers = this.currentQuestion[this.currentQuestion.length - 1]
        const { text } = answers
        const option = formatTableOptions(text)
        return option
      }
      const option = this.currentQuestion
        .filter((el) => el.options && el.options.length)
        .map((el) => el.options || [])
        .flat()
      const multiple = option.filter((el) => el.option === 'A').length > 1
      if (multiple) {
        // 分多组
        const questionLen = option.filter((el) => el.option === 'A').length
        const list = []
        let start = 0
        for (let i = 0; i < questionLen; i += 1) {
          list.push({
            answerNo: `（${i + 1}）`,
            options: option.slice(start, start + this.optionLen),
          })
          start += this.optionLen
        }
        return list
      }
      return option
    },
    // 是否为选项分组的选择题
    isOptionGroup() {
      return (
        this.isFillup || Boolean(this.option.length && this.option[0].answerNo)
      )
    },
    // 如果已经设置过答案，回显
    currentItem() {
      if (!this.items.length) return {}
      return this.items.find((el) => el.itemId === this.currentItemId) || {}
    },
  },
  watch: {
    currentItemId: {
      handler(nv) {
        this.loading = true
        // 看看一题有几个选项
        const list = this.content
          .filter((el) => el.itemId === nv)
          .filter((el) => el.options && el.options.length)
          .map((el) => el.options || [])
          .flat()
        if (list.filter((el) => el.option === 'A').length > 1) {
          this.optionLen = list.slice(1).findIndex((el) => el.option === 'A') + 1
        }
        setTimeout(() => {
          this.loading = false
        }, 100)
      },
    },
  },
  mounted() {
    this.getAllLists()
  },
  methods: {
    ...mapActions(['getAllLists']),
    ...mapMutations(['updateState', 'updateItems', 'updateOptions']),
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
          const res = await that.$upload('/api/upload/fileUploadByByte.do', {
            file: binary,
          })
          if (res.dataInfo.path) {
            onSuccess('Ok')
            this.fileList = [
              { ...that.fileList[0], url: res.dataInfo.path, status: 'done' },
            ]
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
      if (index === this.option.length - 1) {
        return [icons[0], icons[2]]
      }
      return icons
    },
    // 删除小题
    delTest(index) {
      this.$confirm({
        title: '提示',
        content: '确定要删除该小题吗?',
        onOk: async () => {
          this.loading = true
          // 删除完形填空小题
          const option = JSON.parse(JSON.stringify(this.option))
          option.splice(index, 1)
          const { table, text } = formatTableString(option)
          this.updateTable(table, text)
        },
      })
    },
    updateTable(table, text) {
      const index = this.content.findIndex(
        (el) => el.itemId === this.currentItemId,
      )
      const endIndex = this.currentQuestion.length + index
      console.log(this.currentQuestion[this.currentQuestion.length - 1])
      const currentContent = [
        ...this.currentQuestion.slice(0, this.currentQuestion.length - 1),
        {
          ...this.currentQuestion[this.currentQuestion.length - 1],
          content: table,
          text,
        },
      ]
      this.updateState({
        name: 'content',
        value: [
          ...this.content.slice(0, index),
          ...currentContent,
          ...this.content.slice(endIndex),
        ],
      })
      this.loading = false
    },
    // 处理选项
    async handleOptionData(futureOption) {
      // 调整顺序，修改content里的对应选项
      const content = []
      // 普通选择题
      await this.currentQuestion.forEach((el) => {
        if (!el.options || !el.options.length) {
          content.push(el)
        } else {
          let newContent = ''
          let newText = ''
          for (let i = 0; i < futureOption.length; i += 1) {
            newContent += `${futureOption[i].option}．${futureOption[i].value}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`
            newText += `${futureOption[i].option}．${futureOption[i].value} `
          }
          content.push({
            ...el,
            options: futureOption,
            content: newContent,
            text: newText,
          })
        }
      })
      this.updateOptions(content)
    },
    del(optionIndex, queIndex) {
      // 删除一个选项
      !this.isFillup && this.move('del', optionIndex)
      this.isFillup && this.adjustTable('del', optionIndex, queIndex)
    },
    async adjustTable(direction, optionIndex, questionIndex) {
      this.loading = true
      const options = JSON.parse(
        JSON.stringify(this.option[questionIndex].options),
      )
      const currentAdjustTr = adjustOrder(direction, options, optionIndex)
      const option = JSON.parse(JSON.stringify(this.option))
      option.splice(questionIndex, 1, {
        ...option[questionIndex],
        options: currentAdjustTr,
      })
      const { table, text } = formatTableString(option)
      this.updateTable(table, text)
    },
    move(direction, optionIndex) {
      let options
      if (this.optionSplit) {
        // 选项分开是调整content顺序
        options = this.currentQuestion.filter(
          (el) => el.options && el.options.length,
        )
        const num = {
          up: -1,
          down: 1,
        }
        const current = options[optionIndex]
        const target = options[optionIndex + num[direction]]
        if (num[direction]) {
          options.splice(optionIndex + num[direction], 1, {
            ...current,
            content: `${target.options[0].option}．${current.options[0].value}`,
            options: [
              {
                option: target.options[0].option,
                value: current.options[0].value,
              },
            ],
            text: `${target.options[0].option}．${current.options[0].value}`,
          })
          options.splice(optionIndex, 1, {
            ...target,
            content: `${current.options[0].option}．${target.options[0].value}`,
            options: [
              {
                option: current.options[0].option,
                value: target.options[0].value,
              },
            ],
            text: `${current.options[0].option}．${target.options[0].value}`,
          })
        } else {
          options.splice(optionIndex, 1)
        }
        options = this.currentQuestion
          .filter((el) => !el.options || !el.options.length)
          .concat(options)
        this.updateOptions(options)
      } else {
        const option = JSON.parse(JSON.stringify(this.option))
        options = adjustOrder(direction, option, optionIndex)
        this.handleOptionData(options)
      }
    },
    moveDown(optionIndex, queIndex) {
      !this.isFillup && this.move('down', optionIndex)
      this.isFillup && this.adjustTable('down', optionIndex, queIndex)
    },
    moveUp(optionIndex, queIndex) {
      !this.isFillup && this.move('up', optionIndex)
      this.isFillup && this.adjustTable('up', optionIndex, queIndex)
    },
    // 添加选项
    async pushOption() {
      const options = [
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
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
      ]
      if (this.isFillup) {
        this.loading = true
        // 完形填空
        const { option } = this
        option.push({
          answerNo: `（${option.length + 1}）`,
          options: options.slice(0, this.optionLen).map((el) => ({
            option: el,
            value: '',
          })),
        })
        const { table, text } = formatTableString(option)
        this.updateTable(table, text)
      } else {
        // 普通选择题只需要在当前选项行push即可
        const { option } = this
        if (this.optionSplit) {
          const {
            itemId, id, anser, type,
          } = this.currentQuestion[0]
          // 选项分开的直接增加一行新content
          const content = this.currentQuestion.concat([
            {
              contentId: v4(),
              itemId,
              id,
              anser,
              type,
              content: `${options[option.length]}．`,
              text: `${options[option.length]}．`,
              options: [{ option: options[option.length], value: '' }],
            },
          ])
          this.updateOptions(content)
        } else {
          this.handleOptionData([
            ...option,
            { option: options[option.length], value: '' },
          ])
        }
      }
    },
    // 保存内容
    save() {
      this.$refs.formField.form.validateFields(async (err, values) => {
        if (!err) {
          const answer = {}
          /**
           * 选择题（含单选/多选）: 1
            {"0":"A", "1": "C"}

            判断题：3
            {"0": "true"}

            信息匹配/完形填空/阅读理解：5
            按题号顺序{"0": "B", "1", "B", "2": "A"}
           */
          if (typeof values.answers === 'object') {
            // 多选
            await values.answers.forEach((el, index) => {
              Object.assign(answer, {
                [index]: el,
              })
            })
          } else if ([1, 3, 5].includes(this.questionTypeId)) {
            // 需要构造答案的类型
            const list = values.answers.split('') || []
            await list.forEach((el, index) => {
              Object.assign(answer, {
                [index]: el,
              })
            })
          }
          values.answers = answer
          if (this.isFillup || this.isOptionGroup) {
            // 处理完形填空选项，信息匹配、阅读理解也不需要传option
            const { option } = this
            await option.forEach(async (el) => {
              await el.options.forEach((item) => {
                delete values[`${el.answerNo}-${item.option}`]
              })
            })
            // 选项放入content，即传完整的currentQuestion
            values.content = this.currentQuestion.map((el) => el.content).join(' ')
          } else if (this.option.length && [1, 3].includes(this.questionTypeId)) {
            // 普通选择题/判断题 传option
            const optionValues = {}
            await this.option.forEach((el) => {
              delete values[el.option]
              Object.assign(optionValues, {
                [el.option]: el.value,
              })
            })
            values.options = optionValues
          }
          this.updateItems(values)
        }
      })
    },
    handleChange(props, values) {
      // console.log(values)
      if (values.optionNum) {
        this.optionLen = values.optionNum
      }
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
      width: 24px;
    }
    span {
      width: 80px;
      margin-right: -80px;
      text-align: center;
    }
  }
  .add-btn {
    margin-left: -80px;
    margin-top: 20px;
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
