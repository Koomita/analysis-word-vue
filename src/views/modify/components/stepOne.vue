<template>
  <div class="step-flow step-one">
    <a-row type="flex" justify="space-between" class="action-title">
      <a-col>
        <h1>题目列表</h1>
      </a-col>
      <a-col>
        <a-button type="link">全部清空</a-button>
      </a-col>
    </a-row>
    <a-table
     :data-source="subjects"
     :columns="columns"
     :pagination="false"
     :row-key="record => record.subjectTitle"
    >
      <template slot="action">
        <a-button type="link">编辑</a-button>
        <a-button type="link">删除</a-button>
      </template>
    </a-table>
    <p class="btn-box">
      <a-button :disabled="itemIds.length === 0" type="primary" @click="next">下一步</a-button>
    </p>
  </div>
</template>
<script>
import { mapMutations, mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['subjects', 'itemIds']),
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
  methods: {
    ...mapMutations(['updateState', 'updateCurrentQuestion']),
    next() {
      // 下一步，默认编辑第一题题目详情
      this.updateCurrentQuestion(this.itemIds[0])
      this.updateState({ name: 'step', value: 1 })
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
