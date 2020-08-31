<template>
  <a-affix :offset-top="84" class="box">
    <div class="case">
      <component :is="currentComponent" />
    </div>
  </a-affix>
</template>
<script>
import { mapState } from 'vuex'
import stepOne from './stepOne.vue'
import stepTwo from './stepTwo.vue'

export default {
  components: {
    stepOne,
    stepTwo,
  },
  computed: {
    ...mapState(['step']),
    currentComponent() {
      const components = ['stepOne', 'stepTwo']
      return components[this.step]
    },
  },
}
</script>
<style lang="less" scoped>
.box {
  background: #fff;
  max-height: 600px;
  overflow-y: hidden;
  .case {
    padding: 10px 24px;
    box-sizing: border-box;
    background: #fff;
    max-height: 100%;
    overflow-y: scroll;
    .step-flow {
      .action-title {
        h1 {
          margin-bottom: 0;
          margin-top: 2px;
          color: #485465;
        }
      }
      /deep/ .btn-box {
        padding-top: 20px;
        text-align: right;
      }
    }
  }
}
</style>
