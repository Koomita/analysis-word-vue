<template>
  <div class="home">
    <main-frame>
      <div slot="content" class="home-content">
        <div class="block" @click="toggle">
          <a-icon type="cloud-upload" />上传试卷
        </div>
      </div>
      <!-- <div slot="action" class="home-action"></div> -->
    </main-frame>
    <upload-modal
      :visible.sync="modalVisible"
      @submit="handleSubmit"
      @cancel="handleCancel" />
  </div>
</template>

<script>
// @ is an alias to /src
import MainFrame from '@/components/frame.vue'
import { mapMutations } from 'vuex'
import UploadModal from './components/uploadModal.vue'

export default {
  name: 'Home',
  components: {
    MainFrame,
    UploadModal,
  },
  data() {
    return {
      modalVisible: false,
    }
  },
  methods: {
    ...mapMutations(['updateState']),
    toggle() {
      this.modalVisible = true
    },
    handleSubmit(values) {
      // 更新当前来源、题类
      this.updateState({ name: 'currentSource', value: values.source })
      this.updateState({ name: 'currentQueClass', value: values.queClass })
      this.updateState({ name: 'step', value: 0 })
      this.modalVisible = false
      // 下一步
      this.$router.push('/modify')
    },
    handleCancel() {
      this.modalVisible = false
    },
  },
}
</script>

<style lang="less" scoped>
.home {
  height: 100%;
  overflow-y: scroll;
  .home-content {
    .block {
      position: relative;
      background: #fff;
      font-size: 16px;
      width: 197px;
      height: 88px;
      border-radius: 2px;
      transition: transform 0.15s, -webkit-transform 0.15s;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      &::after {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 2px;
        -webkit-transition: opacity 0.3s ease-in-out;
        -o-transition: opacity 0.3s ease-in-out;
        transition: opacity 0.3s ease-in-out;
        -webkit-box-shadow: 0 6px 14px 0 rgba(0, 0, 0, 0.05),
          0 4px 16px 0 rgba(0, 0, 0, 0.05);
        box-shadow: 0 6px 14px 0 rgba(0, 0, 0, 0.05),
          0 4px 16px 0 rgba(0, 0, 0, 0.05);
        content: "";
        opacity: 0;
        z-index: -1;
      }
      &:hover {
        transform: translateY(-1%);
        &:after {
          opacity: 1;
          z-index: inherit;
        }
      }
    }
  }
}
</style>
