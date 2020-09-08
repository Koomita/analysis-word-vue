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
                      v-for="(icon, icIndex) in getIcons(oIndex, ansIndex)"
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

const optionLabel = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'H', 'I', 'J', 'K', 'L', 'M', 'N',
  'O', 'P', 'Q', 'R', 'S', 'T', 'U',
  'V', 'W', 'X', 'Y', 'Z',
]

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
      editionId: undefined,
      gradeId: undefined,
      cateId: undefined,
      loading: false,
      adjustOptionIndex: [], // 调整的选项索引，完形填空用
      fileList: [], // 上传视频
      optionLen: 4, // 选项数
      optionGroup: [], // 分组选择题
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
      'itemIds',
    ]),
    currentQuestion() {
      // 找出当前题目的内容
      return this.content.filter((el) => el.itemId === this.currentItemId).filter((el) => el.content)
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
      const item = this.items.find((el) => el.itemId === this.currentItemId)
      if (item) {
        return item.content
      }
      // 非选择题、完形填空，全部显示
      if (![1, 5, 8].includes(this.questionTypeId) || (this.questionTypeId === 5 && !this.isFillup)) {
        return this.currentQuestion
          .map((el) => el.content)
          .join('') || ''
      }
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
    // 题型唯一标识
    quesTypeNameId() {
      if (this.currentQuestion.length) {
        return this.currentQuestion[0].id
      }
      return 0
    },
    // 判断当前选择题是单选、多选还是不定项
    chooseType() {
      const {
        questionTypeId, subjects, questionTypes, quesTypeNameId,
      } = this
      if (!questionTypeId || questionTypeId !== 1) return ''
      // 先从subjects找，找不到再找questionTypes里的
      const item = subjects.find((el) => el.id === quesTypeNameId) || questionTypes.find((el) => el.id === quesTypeNameId)
      const name = item.subjectTitle || item.name
      const types = {
        单选: 'radio',
        单项选择: 'radio',
        多选: 'checkbox',
        多项选择: 'checkbox',
        选择: 'radio',
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
      // 只处理选择题1和英语的完形填空5
      // console.log('questionTypeId', this.questionTypeId, this.isFillup)
      if (!this.questionTypeId || ![1, 5, 8].includes(this.questionTypeId) || (this.questionTypeId === 5 && !this.isFillup)) return []
      if (this.isFillup) {
        // 完形填空选项
        const answers = this.currentQuestion[this.currentQuestion.length - 1]
        const { text } = answers
        const option = formatTableOptions(text)
        return option
      }
      const option = this.currentQuestion
        .filter((el) => el.options && el.options.length)
        .map((el) => el.options)
        .flat()
      const multiple = option.filter((el) => el.option === 'A').length > 1
      if (multiple) {
        return this.optionGroup
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
        const item = this.items.find((el) => el.itemId === nv)
        this.editionId = item?.bookId || undefined
        this.gradeId = item?.editionId || undefined
        this.cateId = item?.categoryId || undefined
        if (this.editionId) {
          this.getGrades(this.editionId)
        }
        this.updateOptionGroup()
        setTimeout(() => {
          this.loading = false
        }, 100)
      },
    },
    content: {
      handler() {
        this.updateOptionGroup()
      },
      deep: true,
    },
  },
  mounted() {
    this.getAllLists()
  },
  methods: {
    ...mapActions(['getAllLists']),
    ...mapMutations(['updateState', 'updateItems', 'updateOptions']),
    updateOptionGroup() {
      const list = this.currentQuestion.filter((el) => el.options && el.options.length)
      // 计算一组选项的长度
      const optionLen = list.slice(1).findIndex((el) => el.options[0].option === 'A')
      if (optionLen > -1) {
        // 以A开头至下一个A前为一组
        const options = []
        for (let i = 0; i < list.length; i += 1) {
          const el = list[i]
          if (el.options[0].option === 'A') {
            options.push({
              answerNo: `（${options.length + 1 || 1}）`,
              options: [el.options[0]],
            })
          } else {
            options[options.length - 1].options.push(el.options[el.options.length - 1])
          }
        }
        this.optionGroup = options
      }
    },
    // 上传视频
    async uploadVideo(options) {
      const {
        onSuccess, onError, file, onProgress,
      } = options
      const that = this
      const size = Math.ceil(file.size / 1024 / 1024)
      if (size > 20) {
        that.$message.warning('文件过大')
      } else {
        const reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = async (e) => {
          const binary = e.target.result
          try {
            const res = await that.$post('/api/upload/fileUploadByByte.do', {
              file: binary,
            }, {
              onUploadProgress: (progressEvent) => {
                const percentNum = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress({ percent: percentNum })
              },
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
      if (this.gradeId) {
        this.getCategories(this.gradeId)
      }
    },
    // 根据书本获取章节信息
    async getCategories(bookId) {
      const res = (await this.$post('/api/paperupload/list/category.do', {
        bookId,
      })) || { dataInfo: {} }
      this.categories = res.dataInfo.data || []
    },
    getIcons(index, parentIndex) {
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
      if ((index === this.option.length - 1 && index !== 0) || (parentIndex > -1 && index === this.option[parentIndex].options.length - 1)) {
        return [icons[0], icons[2]]
      } if (index === this.option.length - 1 && index === 0) {
        return [icons[0]]
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
          const option = JSON.parse(JSON.stringify(this.option))
          if (this.isFillup) {
            // 删除完形填空小题
            option.splice(index, 1)
            const { table, text } = formatTableString(option)
            this.updateTable(table, text)
          } else if (this.isOptionGroup) {
            // 删除分组小题，直接删除
            const contentOptions = this.currentContent.filter((el) => el.options && el.options.length)
            // 找到实际contentOptions里的index
            let actualIndex = 0
            await option.slice(0, index + 1).forEach((el, i) => {
              actualIndex += i === index ? 0 : el.options.length
            })
            contentOptions.splice(actualIndex, option[index].options.length)
            const futureOption = this.currentQuestion.filter((el) => !el.option || !el.options.length).concat(contentOptions)
            this.updateOptions(futureOption)
          }
        },
      })
    },
    updateTable(table, text) {
      const index = this.content.findIndex(
        (el) => el.itemId === this.currentItemId,
      )
      const endIndex = this.currentQuestion.length + index
      // console.log(this.currentQuestion[this.currentQuestion.length - 1])
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
      !this.isFillup && this.move('del', optionIndex, queIndex)
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
    async move(direction, optionIndex, queIndex) {
      const num = {
        up: -1,
        down: 1,
      }
      const contentOptions = this.currentQuestion.filter((el) => el.options && el.options.length)
      if (this.isOptionGroup) {
        const current = this.option[queIndex].options[optionIndex]
        // 几组ABCD选项
        // queIndex为当前选项所在小组的索引
        // 分组的应该是一行一个option吧
        let len = 0
        // 找到实际contentOptions里的index
        await this.option.slice(0, queIndex + 1).forEach((el, index) => {
          len += index === queIndex ? optionIndex : el.options.length
        })
        const currentItemIndex = len
        if (num[direction]) {
          // 调整位置
          const target = contentOptions[currentItemIndex + num[direction]].options[0]
          contentOptions[currentItemIndex].options = [{
            option: current.option,
            value: target.value,
          }]
          contentOptions[currentItemIndex + num[direction]].options = [{
            option: target.option,
            value: current.value,
          }]
        } else {
          // 删除
          contentOptions.splice(currentItemIndex, 1)
          // 修改当前option后的options的option
          await contentOptions.forEach((el, index) => {
            if (index > currentItemIndex - 1) {
              el.options[0].option = optionLabel[index]
            }
          })
        }
      } else {
        // 一行多个选项，多行
        // 只要options有值，content里面对应选项肯定就是options对应的内容
        // 找到当前option所在index
        const current = this.option[optionIndex]
        const targetItemIndex = contentOptions.findIndex((el) => el.options.findIndex((item) => item.option === current.option) > -1)
        const currentItemIndex = contentOptions[targetItemIndex].options.findIndex((el) => el.option === current.option)
        if (num[direction]) {
          let target
          const specialScene = (currentItemIndex === 0 && direction === 'up') || (currentItemIndex === contentOptions[targetItemIndex].options.length - 1 && direction === 'down')
          if (specialScene) {
            // 与不同content里的option调换位置
            if (currentItemIndex === 0 && direction === 'up') {
              target = contentOptions[targetItemIndex - 1].options[contentOptions[targetItemIndex - 1].options.length - 1]
              contentOptions[targetItemIndex].options[currentItemIndex] = {
                option: current.option,
                value: target.value,
              }
              contentOptions[targetItemIndex - 1].options[contentOptions[targetItemIndex - 1].options.length - 1] = {
                option: target.option,
                value: current.value,
              }
            } else {
              target = contentOptions[targetItemIndex + 1].options[0] || {}
              contentOptions[targetItemIndex].options[currentItemIndex] = {
                option: current.option,
                value: target.value,
              }
              contentOptions[targetItemIndex + 1].options[0] = {
                option: target.option,
                value: current.value,
              }
            }
          } else {
            // 单纯的在当前content里的option调换位置
            target = contentOptions[targetItemIndex].options[currentItemIndex + num[direction]]
            contentOptions[targetItemIndex].options.splice(currentItemIndex, 1, {
              option: current.option,
              value: target.value,
            })
            contentOptions[targetItemIndex].options.splice(currentItemIndex + num[direction], 1, {
              option: target.option,
              value: current.value,
            })
          }
        } else if (contentOptions[targetItemIndex].options.length > 1) {
          // 删除多个option中的一个，注意更新option
          contentOptions[targetItemIndex].options.splice(currentItemIndex, 1)
          if (!contentOptions[targetItemIndex].options.length) {
            contentOptions.splice(targetItemIndex, 1)
          }
          let index = 0
          await contentOptions.forEach(async (el) => {
            await el.options.forEach((item) => {
              item.option = optionLabel[index]
              index += 1
            })
          })
        } else {
          // 删除单个单行的option，注意更新option
          contentOptions.splice(targetItemIndex, 1)
          await contentOptions.forEach((el, index) => {
            el.options[0].option = optionLabel[index] || ''
          })
        }
      }
      await contentOptions.forEach(async (el) => {
        let str = ''
        await el.options.forEach((item) => {
          str += `${item.option}．${item.value}`
        })
        el.content = str
      })
      const futureOption = this.currentQuestion.filter((el) => !el.options || !el.options.length).concat(contentOptions)
      this.updateOptions(futureOption)
    },
    moveDown(optionIndex, queIndex) {
      !this.isFillup && this.move('down', optionIndex, queIndex)
      this.isFillup && this.adjustTable('down', optionIndex, queIndex)
    },
    moveUp(optionIndex, queIndex) {
      !this.isFillup && this.move('up', optionIndex, queIndex)
      this.isFillup && this.adjustTable('up', optionIndex, queIndex)
    },
    // 添加选项
    async pushOption() {
      if (this.isFillup) {
        this.loading = true
        // 完形填空
        const { option } = this
        option.push({
          answerNo: `（${option.length + 1}）`,
          options: optionLabel.slice(0, this.optionLen).map((el) => ({
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
              content: `${optionLabel[option.length]}．`,
              text: `${optionLabel[option.length]}．`,
              options: [{ option: optionLabel[option.length], value: '' }],
            },
          ])
          this.updateOptions(content)
        } else {
          this.handleOptionData([
            ...option,
            { option: optionLabel[option.length], value: '' },
          ])
        }
      }
    },
    // 保存内容
    save() {
      this.$refs.formField.form.validateFields(async (err, values) => {
        if (!err) {
          const { questionTypeId, quesTypeNameId } = this
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
          } else if (this.option.length && [1, 3].includes(questionTypeId)) {
            // 普通选择题/判断题 传option
            const optionValues = {}
            const { option } = this
            // 把原来content里的options也更新一波
            const options = this.currentQuestion.filter((el) => el.options && el.options.length)
            await options.forEach(async (el) => {
              await el.options.forEach((item) => {
                item.value = values[item.option]
              })
            })
            const futureOption = this.currentQuestion.filter((el) => !el.options || !el.options.length).concat(options)
            this.updateOptions(futureOption)
            // 修改option
            await option.forEach((el) => {
              Object.assign(optionValues, {
                [el.option]: values[el.option],
              })
              delete values[el.option]
            })
            values.options = JSON.stringify(optionValues)
          }
          this.updateItems({
            ...values,
            questionTypeId,
            quesTypeNameId,
            bookId: this.editionId,
            editionId: this.gradeId,
            categoryId: this.cateId,
          })
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
