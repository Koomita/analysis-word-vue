import BalloonEditorBase from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor'

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials'

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph'

import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold'
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic'
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline'
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough'
import SubScript from '@ckeditor/ckeditor5-basic-styles/src/subscript'
import SuperScript from '@ckeditor/ckeditor5-basic-styles/src/superscript'

import Image from '@ckeditor/ckeditor5-image/src/image'
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption'
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle'
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar'
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload'
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize'

import Table from '@ckeditor/ckeditor5-table/src/table'
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar'

export default class BalloonEditor extends BalloonEditorBase {}

BalloonEditor.builtinPlugins = [
  Essentials,

  Paragraph,

  Bold,
  Italic,
  Underline,
  Strikethrough,
  SubScript,
  SuperScript,

  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  ImageResize,

  Table,
  TableToolbar,
]

BalloonEditor.defaultConfig = {
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
}
