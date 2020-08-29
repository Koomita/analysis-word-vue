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
      <h4 style="font-zise: 18px;">提示</h4>
      <div class="success">
        <p>
          <a-icon :style="{fontSize:'50px'}" type="check-circle" theme="twoTone" two-tone-color="#52c41a" />
        </p>
        上传试卷成功！
      </div>
      <div class="modal-footer">
        <a-button>上传完成</a-button>
        <a-button type="primary" @click="$emit('next')">生成试卷</a-button>
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
      return document.querySelector('.step-flow')
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
      margin-top: 50px;
      padding: 0 10px;
    }
  }
}
</style>
