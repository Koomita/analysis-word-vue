<template>
  <ckeditor :editor="editor" :value="editorData" class="editor" @ready="prefill" />
</template>

<script>
import CKEditor from '@ckeditor/ckeditor5-vue'
import BalloonEditor from '@/utils/editor'

export default {
  components: {
    ckeditor: CKEditor.component,
  },
  props: {
    defaultContent: {
      type: String,
      default: '',
    },
    readOnly: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      editor: BalloonEditor,
      editorData: '',
    }
  },
  computed: {
    editorConfig() {
      return {}
    },
  },
  watch: {
    defaultContent(val) {
      if (!this.editor) {
        return
      }
      // 外部内容发生变化时，将新值赋予编辑器
      if (val && val !== this.editorData) {
        this.editorData = val
      }
    },
    editorData(val) {
      if (val && val !== this.defaultContent) {
        // 编辑器内容发生变化时，告知外部，实现 v-model 双向监听效果
        this.$emit('input', val)
      }
    },
  },
  mounted() {

  },
  methods: {
    prefill() {
      this.editorData = this.defaultContent || ''
    },
  },
}
</script>
<style>
.ck-content {
  border: 1px solid #d9d9d9;
}
</style>
