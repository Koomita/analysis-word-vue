<template>
  <div class="step-flow step-one">
    <a-row type="flex" justify="space-between" class="action-title">
      <a-col>
        <h1>题目列表</h1>
      </a-col>
      <a-col>
        <a-button type="link" @click="clear">全部清空</a-button>
      </a-col>
    </a-row>
    <a-table
     :data-source="subjects"
     :columns="columns"
     :pagination="false"
     :row-key="record => record.classifyId"
    >
      <template slot="action" slot-scope="text, record">
        <a-button type="link" @click="edit(record)">编辑</a-button>
        <a-button type="link" @click="del(record)">删除</a-button>
      </template>
    </a-table>
    <p class="btn-box">
      <a-button :disabled="itemIds.length === 0" type="primary" @click="next">下一步</a-button>
    </p>
    <a-modal
     :visible="showEditModal"
     :get-container="getContainer"
     title="题目设置"
     ok-text="确定"
     cancel-text="取消"
     @ok="save"
     @cancel="cancel">
      <a-form :form="form" layout="inline">
        <a-form-item label="题型">
          <a-select v-decorator="['id', { initialValue: id }]" style="min-width: 200px;">
            <a-select-option
              v-for="(opt, oIndex) in questionTypes"
              :key="`${oIndex}-${opt.id}`"
              :value="opt.id"
            >
              {{ opt.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="题量">
          <a-input-number v-decorator="['count', { initialValue: count }]"></a-input-number>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script>
import { mapMutations, mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      showEditModal: false, // 显示编辑弹窗
      id: '', // 当前题型id
      count: '', // 当前题型数量
      form: this.$form.createForm(this),
    }
  },
  computed: {
    ...mapState(['subjects', 'itemIds', 'questionTypes', 'subjectId', 'content', 'items']),
    columns() {
      return [{
        title: '题型',
        dataIndex: 'subjectTitle',
        width: '25%',
      }, {
        title: '题量',
        dataIndex: 'count',
        width: '25%',
      }, {
        title: '操作',
        width: '50%',
        scopedSlots: { customRender: 'action' },
      }]
    },
    countSubjects() {
      if (!this.items.length) {
        return this.subjects
      }
      const subjects = []
      this.subjects.forEach((el) => {
        const { classifyId } = el
        const currentClass = this.items.filter((item) => item.classifyId === classifyId)
        subjects[subjects.length - 1] = {
          ...el,
          count: currentClass.length,
        }
      })
      return subjects
    },
  },
  mounted() {
    !this.items.length && this.getQuestionTypes()
  },
  methods: {
    ...mapMutations(['updateState', 'delQuestionType', 'updateSubjects']),
    ...mapActions(['getQuestionTypes', 'getQuestionClasses']),
    checkOptions(content) {
      const isEng = [7, 16, 21].includes(this.subjectId)
      const engReg = new RegExp(/^[A-Z]{1}[.、．:：]+/) // 英语题用
      const otherReg = new RegExp(/[A-Z]{1}[.、．:：]+/) // 非英语题用
      const reg = isEng ? engReg : otherReg
      const result = reg.exec(content)
      return result ? result[0] : content.startsWith('<table')
    },
    getOptions(content) {
      const isEng = [7, 16, 21].includes(this.subjectId)
      const engReg = new RegExp(/^[A-Z]{1}[.、．:：]+/) // 英语题用
      const otherReg = new RegExp(/[A-Z]{1}[.、．:：]+/) // 非英语题用
      // 完形填空
      if (isEng && content.startsWith('<table')) {
        return {
          text: '',
          option: content,
        }
      }
      const reg = isEng ? engReg : otherReg
      let opContent = content
      const option = {}
      let text = content
      do {
        // 匹配选项开头
        const result = reg.exec(opContent.trim())
        if (result) {
          // 取出选项label
          const label = result[0].replace(/[.、．:：]/, '').trim()
          // res为选项内容
          let res = result.input.replace(result[0], '').trim()
          // 检查剩余内容是否还包含其他选项
          const includeOtherOption = otherReg.exec(res)
          if (includeOtherOption) {
            // 如果有，重新赋值选项内容
            const current = res.split(includeOtherOption[0])
            res = current[0] || ''
          }
          Object.assign(option, {
            [label]: res.trim(),
          })
          // 内容去掉已匹配到的选项内容
          opContent = opContent.trim().replace(result[0], '').replace(res, '').trim()
          text = text.trim().replace(result[0], '').replace(res, '').trim()
        } else {
          // 没有选项则跳出循环
          opContent = ''
        }
      } while (opContent)
      return {
        text,
        option,
      }
    },
    async next() {
      // 获取当前content，map成items
      const items = []
      let finalContent = ''
      await this.content.filter((el) => el.itemId && el.content && el.contentId).forEach((el) => {
        const {
          itemId, id, questionTypeId, classifyId, contentId,
        } = el
        let { content } = el
        content = content.trim()
        let options
        if (this.itemIds.includes(itemId)) {
          // 查看当前content有无options
          if (this.checkOptions(content) && [1, 5, 8].includes(questionTypeId)) {
            const { text, option } = this.getOptions(content)
            options = typeof option === 'string' ? option : ({ ...options, ...option })
            content = text.trim()
          }
          // 去掉题号
          const test = /^(\d+)[.、．:：，]+/.exec(content) || ['']
          const no = test[0]
          if (!items.find((item) => item.itemId === itemId)) {
            const storedItem = this.items.find((item) => item.itemId === itemId)
            finalContent = content.replace(no, '')
            items.push({
              ...storedItem,
              content: finalContent,
              options,
              anser: storedItem?.anser || false,
              id: storedItem?.id || id,
              questionTypeId: storedItem?.questionTypeId || questionTypeId,
              itemId,
              classifyId,
              contentIds: [contentId], // 后面设置答案时，更新content数组有用
            })
          } else {
            const index = items.findIndex((item) => item.itemId === itemId)
            let opt
            if (typeof options === 'string' || typeof items[index].options === 'string') {
              opt = options || items[index].options
            } else {
              opt = {
                ...items[index].options,
                ...options,
              }
            }
            const { contentIds } = items[index]
            finalContent += content
            items.splice(index, 1, {
              ...items[index],
              options: opt,
              contentIds: contentId ? contentIds.concat([contentId]) : contentIds,
              content: finalContent,
            })
          }
        }
      })
      // 默认编辑第一题题目详情
      this.updateState({ name: 'items', value: items })
      this.updateState({ name: 'currentItemId', value: this.itemIds[0] })
      this.updateState({ name: 'step', value: 1 })
      this.getQuestionClasses()
      this.$router.push('/modify/detail')
    },
    edit(record) {
      const { id, count } = record
      this.id = id
      this.count = count
      this.showEditModal = true
    },
    del(record) {
      const { id } = record
      // 删除
      this.$confirm({
        title: '提示',
        content: '确定要删除这个题型吗？',
        onOk: () => {
          this.delQuestionType(id)
        },
      })
    },
    clear() {
      // 全部清空
      this.$confirm({
        title: '提示',
        content: '确定要全部清空吗？',
        onOk: () => {
          this.updateState({ name: 'itemIds', value: [] })
          this.updateState({ name: 'subjects', value: [] })
          this.updateState({ name: 'items', value: [] })
        },
      })
    },
    save() {
      // 更新题型数量
      this.form.validateFields((err, values) => {
        if (!err) {
          const { subjects } = this
          const index = subjects.findIndex((el) => el.id === values.id)
          this.updateSubjects({ item: { ...subjects[index], ...values }, index })
          this.showEditModal = false
        }
      })
    },
    cancel() {
      this.form.resetFields()
      this.showEditModal = false
    },
    getContainer() {
      return document.querySelector('.modify')
    },
  },
}
</script>
<style lang="less" scoped>
.step-one {
  .ant-table-wrapper {
    /deep/ .ant-table-thead > tr > th {
      background: #fff;
    }
  }
}
</style>
