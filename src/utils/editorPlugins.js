import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials'

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph'

import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold'
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic'
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline'
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough'
import SubScript from '@ckeditor/ckeditor5-basic-styles/src/subscript'
import SuperScript from '@ckeditor/ckeditor5-basic-styles/src/superscript'
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote'

import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters'
import SpecialCharactersMathematical from '@ckeditor/ckeditor5-special-characters/src/specialcharactersmathematical'
import SpecialCharactersCurrency from '@ckeditor/ckeditor5-special-characters/src/specialcharacterscurrency'
import SpecialCharactersArrows from '@ckeditor/ckeditor5-special-characters/src/specialcharactersarrows'
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials'

import Image from '@ckeditor/ckeditor5-image/src/image'
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption'
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle'
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar'
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload'
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize'

import Table from '@ckeditor/ckeditor5-table/src/table'
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar'

import Widget from '@ckeditor/ckeditor5-widget/src/widget'

import UploadAdapter from './uploadAdapter'

import TagAttribute from './tagAttribute'
// import CustomFigureAttributes from './CustomFigureAttributes'

// import RestrictedEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/restrictededitingmode'

// import Wirter from '@ckeditor/ckeditor5-engine/src/view/writer'

function UploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => new UploadAdapter(loader, '/api/upload/upload/many/base64.do')
}

export default [
  Essentials,

  Paragraph,

  Bold,
  Italic,
  Underline,
  Strikethrough,
  SubScript,
  SuperScript,
  BlockQuote,

  SpecialCharacters,
  SpecialCharactersMathematical,
  SpecialCharactersCurrency,
  SpecialCharactersArrows,
  SpecialCharactersEssentials,

  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  ImageResize,

  Table,
  TableToolbar,

  Widget,
  UploadAdapterPlugin,
  TagAttribute,
  // CustomFigureAttributes,
]
