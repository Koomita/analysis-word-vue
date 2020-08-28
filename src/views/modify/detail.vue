<template>
  <div class="modify">
    <main-frame>
      <div slot="content" class="modify-content">
        <question-detail />
      </div>
      <div slot="action" class="modify-action">
        <actions />
      </div>
    </main-frame>
  </div>
</template>
<script>
import frame from '@/components/frame.vue'
import actions from './components/actions.vue'
import questionDetail from './components/questionDetail.vue'

export default {
  components: {
    'main-frame': frame,
    actions,
    questionDetail,
  },
}
</script>
<style lang="less" scoped>
.modify {
  height: 100%;
  overflow-y: scroll;
  h1 {
    color: #485465;
  }
  .modify-content {
    background: #fff;
    padding: 16px 24px;
  }
  .modify-action {
    background: #fff;
  }
}
</style>
