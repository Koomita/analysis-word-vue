import BalloonEditorBase from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor'
import editorPlugins from './editorPlugins'

export default class BalloonEditor extends BalloonEditorBase {}

BalloonEditor.builtinPlugins = editorPlugins

BalloonEditor.defaultConfig = {
  toolbar: [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'subscript',
    'superscript',
    'specialcharacters',
    'blockquote',
    '|',
    'imageUpload',
    'insertTable',
  ],
  image: {
    toolbar: ['imageTextAlternative', '|', 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight'],
    styles: ['full', 'alignLeft', 'alignRight'],
  },
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells',
    ],
  },
  language: 'zh-cn',
  autoParagraph: true,
}
