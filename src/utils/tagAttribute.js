export default function tagAttribute(editor) {
  // 保留questionBlock样式
  editor.model.schema.register('questionBlock', {
    inheritAllFrom: '$block',
  })

  // view-to-model
  editor.conversion.for('upcast').elementToElement({
    view: {
      name: 'p',
      classes: 'question-block',
    },
    model: (viewElement, modelWriter) => modelWriter.createElement('questionBlock', { cssClassName: [...viewElement.getClassNames()].join(' '), itemid: viewElement.getAttribute('data-itemid') }),
  })

  // model-to-view
  editor.conversion.for('downcast').elementToElement({
    model: 'questionBlock',
    view: (modelElement, writer) => writer.createContainerElement('p', {
      itemid: modelElement.getAttribute('itemid'),
      class: modelElement.getAttribute('cssClassName'), // <-- output it to the view
    }),
  })

  // 保留delIcon样式
  editor.model.schema.register('delIcon', {
    allowWhere: '$block',
    allowContentOf: '$inline',
    allowIn: '$block',
    isInline: true,
  })

  // view-to-model
  editor.conversion.for('upcast').elementToElement({
    view: {
      name: 'span',
      classes: 'del-icon',
    },
    model: (viewElement, modelWriter) => modelWriter.createElement('delIcon', { cssClassName: [...viewElement.getClassNames()].join(' '), 'data-itemid': viewElement.getAttribute('data-itemid') }),
  })

  // model-to-view
  editor.conversion.for('downcast').elementToElement({
    model: 'delIcon',
    view: (modelElement, writer) => writer.createContainerElement('span', {
      'data-itemid': modelElement.getAttribute('data-itemid'),
      class: modelElement.getAttribute('cssClassName'), // <-- output it to the view
    }),
  })

  // Allow <div> elements in the model.
  editor.model.schema.register('img', {
    allowWhere: '$block',
    allowContentOf: '$inline',
    allowIn: '$block',
    isInline: true,
    isObject: true,
  })

  // Allow <div> elements in the model to have all attributes.
  editor.model.schema.addAttributeCheck((context) => context.endsWith('img'))

  // The view-to-model converter converting a view <div> with all its attributes to the model.
  editor.conversion.for('upcast').elementToElement({
    view: 'img',
    model: (viewElement, modelWriter) => modelWriter.createElement('img', viewElement.getAttributes()),
  })

  // The model-to-view converter for the <div> element (attributes are converted separately).
  editor.conversion.for('downcast').elementToElement({
    model: 'img',
    view: 'img',
  })

  // The model-to-view converter for <div> attributes.
  // Note that a lower-level, event-based API is used here.
  editor.conversion.for('downcast').add((dispatcher) => {
    dispatcher.on('attribute', (evt, data, conversionApi) => {
      // Convert <div> attributes only.
      if (data.item.name !== 'img') {
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
