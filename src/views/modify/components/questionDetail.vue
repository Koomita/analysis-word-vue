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
                  :id="`${ans.answerNo}-${opt.option}`"
                  :inline="true"
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
    <complete-modal :visible="showCompleteModal" />
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
import completeModal from './completeModal.vue'

export default {
  mixins: [formOptionMixins],
  components: {
    FormField,
    editor,
    completeModal,
  },
  data() {
    return {
      showCompleteModal: false,
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
      delOptionIndex: [], // 删除选项的index，完形填空用
      adjustOptionIndex: [], // 调整的选项索引，完形填空用
      fileList: [], // 上传视频
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
    ]),
    currentQuestion() {
      return this.content.filter((el) => el.itemId === this.currentItemId)
    },
    // 题目
    question() {
      if (!this.currentQuestion || !this.currentQuestion.length || this.loading) return ''
      // 完形填空题目
      if (this.questionTypeId === 5) {
        return this.currentQuestion.filter((el, i) => i < this.currentQuestion.length - 1).map((el) => el.content).join('')
      }
      // 把有选项的content从题干中筛除再map
      return this.currentQuestion.filter((el) => !el.options || !el.options.length).map((el) => el.content).join('') || ''
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
        let { text } = answers
        const options = []
        do {
          const value = /（\d+）[^（）]+/.exec(text)[0]
          options.push(value)
          text = text.replace(value, '')
        } while (text)
        const option = options.filter((el, index) => !this.delOptionIndex.includes(index)).map((el) => {
          let temp = el
          const answerNo = /（\d+）/.exec(temp)[0]
          temp = temp.replace(answerNo, '')
          const opts = []
          do {
            const currentOpt = /[A-Z]．+[^A-Z]+/.exec(temp)
            const value = /[^A-Z^．]+/.exec(currentOpt)[0]
            const opt = /[A-Z]/.exec(temp)[0]
            opts.push({
              option: opt,
              value,
            })
            temp = temp.replace(`${opt}．${value}`, '')
          } while (temp)
          return {
            answerNo,
            options: opts,
          }
        })
        return option
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
        this.delOptionIndex = []
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
      this.$confirm({
        title: '提示',
        content: '确定要删除该小题吗?',
        onOk: () => {
          this.delOptionIndex.push(index)
        },
      })
    },
    // 处理选项
    handleOptionData(futureOption) {
      // 调整顺序，修改content里的对应选项
      // this.updateState({
      //   name: 'content',
      //   value: [
      //     ...this.currentQuestion.filter((el) => !el.options || !el.options.length),
      //     ...futureOption,
      //   ],
      // })
    },
    del(optionIndex) {
      // 删除一个选项
      this.move('del', optionIndex)
    },
    move(direction, optionIndex) {
      const prev = this.option[optionIndex - 1]
      const current = this.option[optionIndex]
      const next = this.option[optionIndex + 1]
      const options = this.option
      if (direction === 'up') {
        options.splice(optionIndex, 1, { option: current.option, value: prev.value })
        options.splice(optionIndex - 1, 1, { option: prev.option, value: current.value })
      } else if (direction === 'down') {
        options.splice(optionIndex, 1, { option: current.option, value: next.value })
        options.splice(optionIndex + 1, 1, { option: next.option, value: prev.value })
      } else {
        options.splice(optionIndex, 1)
      }
      this.handleOptionData(options)
    },
    moveDown(optionIndex) {
      this.move('down', optionIndex)
    },
    moveUp(optionIndex) {
      this.move('up', optionIndex)
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
      width: 24px;
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
