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
     :row-key="record => record.subjectTitle"
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
    ...mapState(['subjects', 'itemIds', 'questionTypes']),
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
  },
  mounted() {
    this.getQuestionTypes()
  },
  methods: {
    ...mapMutations(['updateState', 'delQuestionType', 'updateSubjects']),
    ...mapActions(['getQuestionTypes']),
    next() {
      // 下一步，默认编辑第一题题目详情
      this.updateState({ name: 'currentItemId', value: this.itemIds[0] })
      this.updateState({ name: 'step', value: 1 })
      this.$router.push('/modify/detail')
    },
    edit(record) {
      const { id, count } = record
      this.id = id
      this.count = count
      this.showEditModal = true
    },
    del(record) {
      const { questionTypeId } = record
      // 删除
      this.$confirm({
        title: '提示',
        content: '确定要删除这个题型吗？',
        onOk: () => {
          this.delQuestionType(questionTypeId)
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
