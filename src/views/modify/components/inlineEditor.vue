<template>
  <ckeditor :editor="editor" v-model="editorData" @ready="ready" />
</template>

<script>
import CKEditor from '@ckeditor/ckeditor5-vue'
import InlineEditor from '@/utils/inlineEditor'
// import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils'

export default {
  name: 'InlineEditor',
  components: {
    ckeditor: CKEditor.component,
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      editor: InlineEditor,
      editorData: '',
    }
  },
  watch: {
    value(val) {
      if (!this.editor) {
        return
      }
      // 外部内容发生变化时，将新值赋予编辑器
      if (val && val !== this.editorData) {
        this.editorData = val
      }
    },
    editorData(val) {
      if (val && val !== this.value) {
        // 编辑器内容发生变化时，告知外部，实现 v-model 双向监听效果
        this.$emit('change', val)
      }
    },
  },
  methods: {
    ready(editor) {
      this.editorData = this.value || ''
    },
  },
}
</script>
<style>
.ck-content, .ck-blurred {
  min-height: 32px !important;
  border: 1px solid #d9d9d9 !important;
  border-radius: 4px !important;
}
</style>
