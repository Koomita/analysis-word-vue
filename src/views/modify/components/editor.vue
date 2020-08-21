<template>
  <ckeditor :editor="editor" :config="editorConfig" v-model="editorData" class="editor" @ready="ready" />
</template>

<script>
import CKEditor from '@ckeditor/ckeditor5-vue'
import BalloonEditor from '@/utils/balloonEditor'
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver'
// import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils'

export default {
  name: 'Editor',
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
      editor: BalloonEditor,
      editorData: '',
      editorConfig: {},
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
      // 增加监听事件
      const { view } = editor.editing
      const viewDocument = view.document

      view.addObserver(ClickObserver)

      editor.listenTo(viewDocument, 'click', (evt, data) => {
        const modelElement = editor.editing.mapper.toModelElement(data.target)
        if (modelElement) {
          const { name } = modelElement
          const { className } = data.domTarget
          if (name === 'div' && className === 'del-icon') {
          // 监听删除按钮点击事件，删除题块
            this.$emit('del', data.domTarget.dataset.itemid)
          }
        }
      })
      this.editorData = this.value || ''
    },
  },
}
</script>
<style>
:host ::ng-deep .ck-editor__editable_inline {
  min-height: 32px !important;
  border: 1px solid #d9d9d9;
}
.question-block {
  background: rgba(94, 147, 252, 0.1);
  border-radius: 4px;
  position: relative;
  padding: 15px;
  margin-bottom: 0;
}
.mt8 .del-icon {
  position: absolute;
  right: 10px;
  top: 10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-image: url('../../../assets/btn_del.png');
  background-size: 100%;
  cursor: pointer;
}
.mt8 {
  margin-top: 8px;
}
</style>
