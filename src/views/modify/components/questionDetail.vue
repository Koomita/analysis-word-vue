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
                    <a-button class="add-btn" @click="pushOption('optionGroup')">
                      <a-icon type="plus" />添加小题
                    </a-button>
                  </template>
                </template>
              </div>
            </template>
          </template>
        </template>
        <!-- 选择题但没能分出选项，需要手动添加选项 -->
        <template v-else-if="questionTypeId === 1 && !option.length">
          <a-button slot="addBtn" @click="pushOption">
            <a-icon type="plus" />添加选项
          </a-button>
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
      optionLabel,
      fileUrl: '', // 视频url
      editingItem: '', // 当前编辑的题目对象，可编辑
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
    // 当前已保存题目
    currentItem() {
      if (!this.items.length) return {}
      return this.items.find((el) => el.itemId === this.currentItemId) || {}
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
      return this.currentItem?.content || ''
    },
    // 题目类型id
    questionTypeId() {
      return this.currentItem?.questionTypeId || 0
    },
    // 题型唯一标识
    quesTypeNameId() {
      return this.currentItem?.id || 0
    },
    // 判断当前选择题是单选、多选还是不定项
    chooseType() {
      const {
        questionTypeId, subjects, questionTypes, quesTypeNameId,
      } = this
      if (!questionTypeId || questionTypeId !== 1) return ''
      // 先从subjects找，找不到再找questionTypes里的
      const item = subjects.find((el) => el.id === quesTypeNameId) || questionTypes.find((el) => el.id === quesTypeNameId)
      const name = item?.subjectTitle || item?.name
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
    // 选项
    option() {
      // 只处理选择题1和英语的完形填空5
      // console.log('questionTypeId', this.questionTypeId, this.isFillup)
      if (!this.questionTypeId || ![1, 5, 8].includes(this.questionTypeId) || (this.questionTypeId === 5 && !this.isFillup)) return []
      if (this.isFillup) {
        // 完形填空选项
        const option = formatTableOptions(this.editingItem.options)
        return option
      }
      const { options } = this.editingItem || { options: {} }
      // 检查option中间有无断层
      const option = []
      let i = 0
      for (const [key, value] of Object.entries(options)) {
        if (key !== optionLabel[i]) {
          const len = optionLabel.findIndex((el) => el === key)
          for (let j = 0; j < len; j += 1) {
            const labelIndex = j + i
            option.push({ option: optionLabel[labelIndex], value: key === optionLabel[labelIndex] ? value : '' })
          }
          i += len
        } else {
          option.push({ option: key, value })
          i += 1
        }
      }
      return option
    },
    // 是否为选项分组的选择题
    isOptionGroup() {
      return (
        this.isFillup || Boolean(this.option.length && this.option[0].answerNo)
      )
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
        this.fileList = item?.videoUrl || []
        this.fileUrl = this.fileList[0] ? this.fileList[0].url : ''
        this.editingItem = this.currentItem
        if (this.editionId) {
          this.getGrades(this.editionId)
        }
        setTimeout(() => {
          this.loading = false
        }, 100)
      },
    },
  },
  mounted() {
    // console.log(this.items)
    this.updateState({ name: 'loading', value: false })
    this.updateState({ name: 'step', value: 1 })
    this.editingItem = this.currentItem
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
      const size = Math.ceil(file.size / 1024 / 1024)
      if (size > 20) {
        that.$message.warning('文件过大')
      } else {
        const data = new FormData()
        data.append('file', file)
        try {
          const res = await that.$upload('/api/upload/fileUploadByByte.do', data, {
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
            this.fileUrl = res.dataInfo.path
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
      return e && e.fileList.slice(-1)
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
    // 选项操作icon
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
          // const option = JSON.parse(JSON.stringify(this.option))
          // 删除完小题，当前题目设置答案状态为false
          if (this.isOptionGroup) {
            // 删除完形填空小题
            const { table } = formatTableString(this.option)
            const parser = new DOMParser()
            const dom = parser.parseFromString(table, 'text/html')
            const trs = Array.from(dom.body.getElementsByTagName('tr'))
            trs.splice(index, 1)
            const str = trs.map((el, i) => {
              const tds = Array.from(el.getElementsByTagName('td')).map((item) => item.innerText)
              // 匹配题号
              const noReg = new RegExp(/[(|（]\d+[）|)]/)
              const no = noReg.exec(tds[0]) || ['']
              let text = tds[0]
              if (no[0]) {
                text = tds[0].replace(no[0], `（${i + 1}）`).trim()
              }
              tds.splice(0, 1, text)
              return `<tr> ${tds.map((item) => `<td> <span> ${item.trim()} </span> </td> \r`).join(' ')} </tr> \r`
            }).join(' ')
            this.updateEditingItem('del', `<table> \r <tbody> \r ${str} \r </tbody> \r </table>`)
          }
          this.loading = false
        },
      })
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
      const { table } = formatTableString(option)
      this.updateEditingItem(direction, table)
      this.loading = false
    },
    // 更新当前编辑内容
    updateEditingItem(direction, options) {
      const obj = {}
      if (direction === 'del') {
        // 删除东西清空设置答案
        console.log(this.$refs.formField.form)
        Object.assign(obj, {
          anser: false,
          answers: '',
        })
        this.$refs.formField.form.resetFields(['answers'])
      }
      this.editingItem = {
        ...this.editingItem,
        options,
        ...obj,
      }
    },
    del(optionIndex, queIndex) {
      // 删除一个选项
      !this.isFillup && this.move('del', optionIndex, queIndex)
      this.isFillup && this.adjustTable('del', optionIndex, queIndex)
    },
    async move(direction, optionIndex) {
      const { options } = this.editingItem
      const num = {
        up: -1,
        down: 1,
      }
      let res = JSON.parse(JSON.stringify(options))
      const current = this.option[optionIndex]
      if (num[direction]) {
        const target = this.option[optionIndex + num[direction]]
        res = {
          ...res,
          [current.option]: target.value,
          [target.option]: current.value,
        }
      } else {
        // 删除
        delete res[current.option]
        const newRes = {}
        await Object.keys(res).forEach((el, i) => {
          if (el !== optionLabel[i]) {
            Object.assign(newRes, {
              [optionLabel[i]]: res[el],
            })
          } else {
            Object.assign(newRes, {
              [el]: res[el],
            })
          }
        })
        res = newRes
      }
      this.updateEditingItem(direction, res)
    },
    moveDown(optionIndex, queIndex) {
      !this.isFillup && this.move('down', optionIndex)
      this.isFillup && this.adjustTable('down', optionIndex, queIndex)
    },
    moveUp(optionIndex, queIndex) {
      !this.isFillup && this.move('up', optionIndex)
      this.isFillup && this.adjustTable('up', optionIndex, queIndex)
    },
    // 添加小题/选项
    async pushOption(type) {
      const currentLen = this.option.length
      // 添加小题
      if (this.isFillup) {
        if (type === 'optionGroup') {
          // 添加小题，添加tr
          const { table } = formatTableString(this.option.concat([{
            answerNo: this.option.length,
            options: optionLabel.filter((el, i) => i <= this.optionLen).map((el, i) => ({
              option: optionLabel[i],
              value: '',
            })),
          }]))
          this.updateEditingItem('add', table)
        }
      } else {
        // 添加选项
        this.updateEditingItem('add', {
          ...this.editingItem.options,
          [optionLabel[currentLen]]: '',
        })
      }
    },
    // 收集新table内容
    getTableString(values) {
      const arr = []
      for (let i = 0; i < this.option.length; i += 1) {
        const el = this.option[i]
        const opts = []
        const answerNo = `（${i + 1}）`
        for (let j = 0; j < el.options.length; j += 1) {
          opts.push({
            option: optionLabel[j],
            value: values[`${answerNo}-${optionLabel[j]}`],
          })
        }
        arr.push({
          answerNo,
          options: opts,
        })
      }
      const { table } = formatTableString(arr)
      return table
    },
    // 保存内容
    save() {
      this.$refs.formField.form.validateFields(async (err, values) => {
        if (!err) {
          // 更新当前items
          const itemIndex = this.items.findIndex((el) => el.itemId === this.currentItemId)
          const { videoUrl } = values
          let options = {}
          if (this.option.length) {
            // 处理选项内容
            if (!this.isFillup) {
              await this.option.forEach((el, i) => {
                Object.assign(options, {
                  [optionLabel[i]]: values[optionLabel[i]],
                })
              })
            } else {
              // 完形填空内容，更新表格
              options = this.getTableString(values)
            }
          }
          this.updateState({
            name: 'items',
            value: [
              ...this.items.slice(0, itemIndex),
              {
                ...this.editingItem,
                ...values,
                videoUrl: videoUrl && videoUrl[0] ? [{ ...videoUrl[0], url: this.fileUrl }] : undefined,
                bookId: this.editionId,
                editionId: this.gradeId,
                categoryId: this.cateId,
                anser: true,
                options,
              },
              ...this.items.slice(itemIndex + 1),
            ],
          })
          // 更新原content数组
          this.updateContent(values)
        }
      })
    },
    // 更新content原数组内容
    updateContent(values) {
      /**
       * 题干可能是几行content，选项也可能是几行content，Jesus
       * 选择题得区分题干和选项，题干还得处理题号的问题😊
       * items里面存了一个字段，contentId数组，里面是当前item在content数组里对应的contentId们
       */
      const currentQuestion = []
      const isEng = [7, 16, 21].includes(this.subjectId)
      const engReg = new RegExp(/^[A-Z]{1}[.、．:：]+/) // 英语题用
      const otherReg = new RegExp(/[A-Z]{1}[.、．:：]+/) // 非英语题用
      const reg = isEng ? engReg : otherReg
      let num = 0 // 记录选项数
      // 题干都放同一个content里，即第一条数据
      const questionNo = this.itemIds.findIndex((item) => item === this.currentItemId) + 1
      currentQuestion.push({
        ...this.currentQuestion[0],
        content: `${questionNo}. ${this.editingItem.content}`,
      })
      // 剩余的内容
      for (let i = 1; i < this.currentQuestion.length; i += 1) {
        const el = this.currentQuestion[i]
        let { content, text } = el
        content = content.trim()
        const {
          contentId, itemId, id, questionTypeId, classifyId,
        } = el
        let flag = false
        if (this.isFillup && content.startsWith('<table')) {
          // 完形填空的表格处理
          text = formatTableString(this.option).text
          content = this.getTableString(values)
        } else if (this.option.length) {
          // 检查当前content有无选项
          const hasOption = reg.exec(content)
          if (hasOption) {
            // 检查有几个选项，要注意选项是否调整了顺序，以及内容是否改变
            let newContent = ''
            let otherOption = hasOption
            do {
              // 因为富文本框里的内容是html，取innerHTML
              const tagReg = new RegExp(/<p[^>]*>(.*?)<\/p>/)
              let value = values[optionLabel[num]]
              if (tagReg.exec(value)) {
                // 取innerHTML
                const parser = new DOMParser()
                const dom = parser.parseFromString(value, 'text/html')
                value = dom.getElementsByTagName('body')[0].childNodes[0].innerHTML
              }
              newContent += `${optionLabel[num]}. ${value} `
              const rest = otherOption.input.replace(otherOption[0], '')
              otherOption = reg.exec(rest)
              if (otherOption) {
                content = rest.split(otherOption[0])[1] || ''
                if (content) {
                  content = `${otherOption[0]}${content}`
                }
              }
              num += 1
            } while (otherOption && values[optionLabel[num]])
            content = newContent
          } else {
            // 题干部分内容
            flag = true
          }
        }
        !flag && currentQuestion.push({
          ...el,
          itemId,
          contentId,
          content,
          id,
          questionTypeId,
          classifyId,
          text,
        })
      }
      const start = this.content.findIndex((el) => el.itemId === this.currentItemId)
      this.updateState({
        name: 'content',
        value: [
          ...this.content.slice(0, start),
          ...currentQuestion,
          ...this.content.slice(start + this.currentQuestion.length),
        ],
      })
      this.$message.success('保存成功')
    },
    handleChange(props, values) {
      if (values.optionNum) {
        // 选项数
        this.optionLen = values.optionNum
        // 根据选项数来增加/减少选项数目
      }
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
