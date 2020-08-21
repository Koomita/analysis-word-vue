export default function tagAttribute(editor) {
  // 保留questionBlock样式
  editor.model.schema.register('questionBlock', {
    inheritAllFrom: '$block',
  })

  editor.conversion.elementToElement({
    model: 'questionBlock',
    view: {
      name: 'p',
      classes: 'question-block',
    },
    converterPriority: 'high',
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

  // 保留del-icon样式
  editor.model.schema.register('delIcon', {
    inheritAllFrom: '$block',
  })

  editor.conversion.elementToElement({
    model: 'delIcon',
    view: {
      name: 'span',
      classes: 'del-icon',
    },
    converterPriority: 'high',
  })

  // view-to-model
  editor.conversion.for('upcast').elementToElement({
    view: {
      name: 'span',
      classes: 'del-icon',
    },
    model: (viewElement, modelWriter) => modelWriter.createElement('delIcon', { cssClassName: [...viewElement.getClassNames()].join(' '), itemid: viewElement.getAttribute('data-itemid') }),
  })

  // model-to-view
  editor.conversion.for('downcast').elementToElement({
    model: 'delIcon',
    view: (modelElement, writer) => writer.createContainerElement('span', {
      itemid: modelElement.getAttribute('itemid'),
      class: modelElement.getAttribute('cssClassName'), // <-- output it to the view
    }),
  })
}
