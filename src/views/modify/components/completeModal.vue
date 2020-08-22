<template>
  <a-modal
    :visible="visible"
    :footer="null"
    :get-container="getContainer"
    :closable="false"
    :width="268"
    dialog-class="complete-modal"
  >
    <div class="modal-body">
      <h4>提示</h4>
      <div class="success">
        <a-icon type="check-circle" />
        上传成功
      </div>
      <div class="modal-footer">
        <a-button>上传完成</a-button>
        <a-button type="primary">生成试卷</a-button>
      </div>
    </div>
  </a-modal>
</template>
<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  computed: {},
  methods: {
    getContainer() {
      return document.querySelector('.detail-modify')
    },
  },
}
</script>
<style lang="less" scoped>
.complete-modal {
  .modal-body {
    .success {
      text-align: center;
    }
    .modal-footer {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
