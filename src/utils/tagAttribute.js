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
}
