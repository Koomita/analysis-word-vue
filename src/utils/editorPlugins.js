import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials'

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph'

import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold'
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic'
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline'
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough'
import SubScript from '@ckeditor/ckeditor5-basic-styles/src/subscript'
import SuperScript from '@ckeditor/ckeditor5-basic-styles/src/superscript'

import Image from '@ckeditor/ckeditor5-image/src/image'
// import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption'
// import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle'
// import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar'
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload'
// import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize'

import Table from '@ckeditor/ckeditor5-table/src/table'
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar'

import Widget from '@ckeditor/ckeditor5-widget/src/widget'

import UploadAdapter from './uploadAdapter'

// import RestrictedEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/restrictededitingmode'

// import Wirter from '@ckeditor/ckeditor5-engine/src/view/writer'

function UploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => new UploadAdapter(loader, '/api/upload/upload/many/base64.do')
}

// 允许标签自带样式
function AttributeElement(editor) {
  const tags = ['div', 'img', 'p', 'span']
  for (const tag of tags) {
    // Allow <div> elements in the model.
    editor.model.schema.register(tag, {
      allowWhere: '$block',
      allowContentOf: tag === 'div' ? '$root' : '',
    })

    // Allow <div> elements in the model to have all attributes.
    editor.model.schema.addAttributeCheck((context) => context.endsWith(tag))

    // The view-to-model converter converting a view <div> with all its attributes to the model.
    editor.conversion.for('upcast').elementToElement({
      view: tag,
      model: (viewElement, modelWriter) => modelWriter.createElement(tag, viewElement.getAttributes()),
    })

    // The model-to-view converter for the <div> element (attributes are converted separately).
    editor.conversion.for('downcast').elementToElement({
      model: tag,
      view: tag,
    })

    // The model-to-view converter for <div> attributes.
    // Note that a lower-level, event-based API is used here.
    editor.conversion.for('downcast').add((dispatcher) => {
      dispatcher.on('attribute', (evt, data, conversionApi) => {
        // Convert <div> attributes only.
        if (data.item.name !== tag) {
          return
        }

        const viewWriter = conversionApi.writer
        const viewDiv = conversionApi.mapper.toViewElement(data.item)

        // In the model-to-view conversion we convert changes.
        // An attribute can be added or removed or changed.
        // The below code handles all 3 cases.
        if (data.attributeNewValue) {
          viewWriter.setAttribute(data.attributeKey, data.attributeNewValue, viewDiv)
        } else {
          viewWriter.removeAttribute(data.attributeKey, viewDiv)
        }
      })
    })
  }
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

  Image,
  // ImageCaption,
  // ImageStyle,
  // ImageToolbar,
  ImageUpload,
  // ImageResize,

  Table,
  TableToolbar,

  Widget,
  AttributeElement,
  UploadAdapterPlugin,
]
