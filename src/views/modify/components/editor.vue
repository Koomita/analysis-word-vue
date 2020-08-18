<template>
  <ckeditor :editor="editor" :value="editorData" class="editor" @ready="ready" />
</template>

<script>
import CKEditor from '@ckeditor/ckeditor5-vue'
import BalloonEditor from '@/utils/editor'
// import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils'

export default {
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
      // editorData: '',
    }
  },
  computed: {
    editorData: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('update:value', val)
      },
    },
  },
  // watch: {
  //   value(val) {
  //     if (!this.editor) {
  //       return
  //     }
  //     // 外部内容发生变化时，将新值赋予编辑器
  //     if (val && val !== this.editorData) {
  //       this.editorData = val
  //     }
  //   },
  //   editorData(val) {
  //     if (val && val !== this.value) {
  //       // 编辑器内容发生变化时，告知外部，实现 v-model 双向监听效果
  //       this.$emit('change', val)
  //     }
  //   },
  // },
  methods: {
    ready(editor) {
      // const { model } = editor

      // model.schema.register('myWidget', {
      //   inheritAllFrom: '$block',
      //   isObject: true,
      // })

      // editor.conversion.for('dataDowncast')
      //   .elementToElement({
      //     model: 'myWidget',
      //     view: (modelItem, writer) => writer.createContainerElement('div', { class: 'widget' }),
      //   })

      // editor.conversion.for('editingDowncast')
      //   .elementToElement({
      //     model: 'myWidget',
      //     view: (modelItem, writer) => {
      //       const div = writer.createContainerElement('div', { class: 'widget' })

      //       return toWidget(div, writer, { label: 'widget label' })
      //     },
      //   })

      // editor.conversion.for('upcast')
      //   .elementToElement({
      //     view: {
      //       name: 'div',
      //       class: 'widget',
      //     },
      //     model: 'myWidget',
      //   })
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
  margin-bottom: 10px;
}
.question-block::after {
  content: ' ';
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
</style>
