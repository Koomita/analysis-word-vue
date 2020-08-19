import InlineEditorBase from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor'
import editorPlugins from './editorPlugins'

export default class InlineEditor extends InlineEditorBase {}

InlineEditor.builtinPlugins = editorPlugins

InlineEditor.defaultConfig = {
  toolbar: [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'subscript',
    'superscript',
    '|',
    'imageUpload',
    'insertTable',
  ],
  image: {
    // toolbar: ['imageTextAlternative', '|', 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight'],
    // styles: ['full', 'alignLeft', 'alignRight'],
  },
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells',
    ],
  },
  language: 'zh-cn',
}
