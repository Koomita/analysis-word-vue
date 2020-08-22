<template>
  <a-row class="header">
    <a-col :xs="2" :sm="2" :md="2" :lg="8" :xl="6">
      <img :src="logo" alt="共升教育" class="logo">
    </a-col>
    <a-col :xs="20" :sm="20" :md="20" :lg="8" :xl="12">
      <a-steps  v-show="step > -1" :current="step" type="navigation">
        <a-step v-for="item in steps" :key="item" :title="item" />
      </a-steps>
    </a-col>
    <a-col :xs="2" :sm="2" :md="2" :lg="8" :xl="6">
      <a-button v-if="step === 2 && $router.path == '/paper'">返回</a-button>
    </a-col>
  </a-row>
</template>
<script>
import { mapState } from 'vuex'
import logo from '@/assets/logo_color@2x.png'

export default {
  computed: {
    ...mapState(['step']),
    steps() {
      return ['划分题型', '设置答案和编辑内容', '生成试卷（可选）']
    },
    logo() {
      return logo
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
  .logo {
    width: 178px;
    cursor: pointer;
  }
}
</style>
