<template>
  <a-row v-show="step > -1" class="header">
    <a-col :xs="2" :sm="2" :md="2" :lg="8" :xl="6"></a-col>
    <a-col :xs="20" :sm="20" :md="20" :lg="8" :xl="12">
      <a-steps :current="step" type="navigation">
        <a-step v-for="item in steps" :key="item" :title="item" />
      </a-steps>
    </a-col>
    <a-col :xs="2" :sm="2" :md="2" :lg="8" :xl="6"></a-col>
  </a-row>
</template>
<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['step']),
    steps() {
      return ['划分题型', '设置答案和编辑内容', '设定分值']
    },
  },
}
</script>
<style lang="less" scoped>
.header {
  height: 100%;
  display: flex;
  align-items: center;
  .ant-steps-navigation .ant-steps-item::before {
    display: none;
  }
}
</style>
