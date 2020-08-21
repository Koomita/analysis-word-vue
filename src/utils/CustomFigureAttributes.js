/**
* Creates an upcast converter that will pass all classes from the view element to the model element.
*/
function upcastCustomClasses(elementName) {
  return (dispatcher) => dispatcher.on(`element:${elementName}`, (evt, data, conversionApi) => {
    const { viewItem } = data
    const { modelRange } = data

    const modelElement = modelRange && modelRange.start.nodeAfter

    if (!modelElement) {
      return
    }

    // The upcast conversion picks up classes from the base element and from the <figure> element so it should be extensible.
    const currentAttributeValue = modelElement.getAttribute('customClass') || []

    currentAttributeValue.push(...viewItem.getClassNames())

    conversionApi.writer.setAttribute('customClass', currentAttributeValue, modelElement)
  })
}

/**
* Creates a downcast converter that adds classes defined in the `customClass` attribute to a <figure> element.
*
* This converter expects that the view element is nested in a <figure> element.
*/
function downcastCustomClassesToFigure(modelElementName) {
  return (dispatcher) => dispatcher.on(`insert:${modelElementName}`, (evt, data, conversionApi) => {
    const modelElement = data.item

    const viewFigure = conversionApi.mapper.toViewElement(modelElement)

    if (!viewFigure) {
      return
    }

    // The code below assumes that classes are set on the <figure> element.
    conversionApi.writer.addClass(modelElement.getAttribute('customClass'), viewFigure)
  })
}

/**
* Returns the custom attribute upcast converter.
*/
function upcastAttribute(viewElementName, viewAttribute, modelAttribute) {
  return (dispatcher) => dispatcher.on(`element:${viewElementName}`, (evt, data, conversionApi) => {
    const { viewItem } = data
    const { modelRange } = data

    const modelElement = modelRange && modelRange.start.nodeAfter

    if (!modelElement) {
      return
    }

    conversionApi.writer.setAttribute(modelAttribute, viewItem.getAttribute(viewAttribute), modelElement)
  })
}

/**
* Helper method that searches for a given view element in all children of the model element.
*
* @param {module:engine/view/item~Item} viewElement
* @param {String} viewElementName
* @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
* @return {module:engine/view/item~Item}
*/
function findViewChild(viewElement, viewElementName, conversionApi) {
  const viewChildren = Array.from(conversionApi.writer.createRangeIn(viewElement).getItems())

  return viewChildren.find((item) => item.is('element', viewElementName))
}

/**
* Returns the custom attribute downcast converter.
*/
function downcastAttribute(modelElementName, viewElementName, viewAttribute, modelAttribute) {
  return (dispatcher) => dispatcher.on(`insert:${modelElementName}`, (evt, data, conversionApi) => {
    const modelElement = data.item

    const viewFigure = conversionApi.mapper.toViewElement(modelElement)
    const viewElement = findViewChild(viewFigure, viewElementName, conversionApi)

    if (!viewElement) {
      return
    }

    conversionApi.writer.setAttribute(viewAttribute, modelElement.getAttribute(modelAttribute), viewElement)
  })
}

/**
* Sets up a conversion that preserves classes on <img> and <table> elements.
*/
function setupCustomClassConversion(viewElementName, modelElementName, editor) {
  // The 'customClass' attribute stores custom classes from the data in the model so that schema definitions allow this attribute.
  editor.model.schema.extend(modelElementName, { allowAttributes: ['customClass'] })

  // Defines upcast converters for the <img> and <table> elements with a "low" priority so they are run after the default converters.
  editor.conversion.for('upcast').add(upcastCustomClasses(viewElementName), { priority: 'low' })

  // Defines downcast converters for a model element with a "low" priority so they are run after the default converters.
  // Use `downcastCustomClassesToFigure` if you want to keep your classes on <figure> element or `downcastCustomClassesToChild`
  // if you would like to keep your classes on a <figure> child element, i.e. <img>.
  editor.conversion.for('downcast').add(downcastCustomClassesToFigure(modelElementName), { priority: 'low' })
  // editor.conversion.for( 'downcast' ).add( downcastCustomClassesToChild( viewElementName, modelElementName ), { priority: 'low' } );
}

/**
* Sets up a conversion for a custom attribute on the view elements contained inside a <figure>.
*
* This method:
* - Adds proper schema rules.
* - Adds an upcast converter.
* - Adds a downcast converter.
*/
function setupCustomAttributeConversion(viewElementName, modelElementName, viewAttribute, editor) {
  // Extends the schema to store an attribute in the model.
  const modelAttribute = `custom${viewAttribute}`

  editor.model.schema.extend(modelElementName, { allowAttributes: [modelAttribute] })

  editor.conversion.for('upcast').add(upcastAttribute(viewElementName, viewAttribute, modelAttribute))
  editor.conversion.for('downcast').add(downcastAttribute(modelElementName, viewElementName, viewAttribute, modelAttribute))
}

/**
* Creates a downcast converter that adds classes defined in the `customClass` attribute to a <figure> child element.
*
* This converter expects that the view element is nested in a <figure> element.
*/
function downcastCustomClassesToChild(viewElementName, modelElementName) {
  return (dispatcher) => dispatcher.on(`insert:${modelElementName}`, (evt, data, conversionApi) => {
    const modelElement = data.item

    const viewFigure = conversionApi.mapper.toViewElement(modelElement)

    if (!viewFigure) {
      return
    }

    // The code below assumes that classes are set on the element inside the <figure>.
    const viewElement = findViewChild(viewFigure, viewElementName, conversionApi)

    conversionApi.writer.addClass(modelElement.getAttribute('customClass'), viewElement)
  })
}

/**
 * A plugin that converts custom attributes for elements that are wrapped in <figure> in the view.
 */
export default class CustomFigureAttributes {
  /**
   * Plugin's constructor - receives an editor instance on creation.
   */
  constructor(editor) {
    // Save reference to the editor.
    this.editor = editor
  }

  /**
   * Sets the conversion up and extends the table & image features schema.
   *
   * Schema extending must be done in the "afterInit()" call because plugins define their schema in "init()".
   */
  afterInit() {
    const { editor } = this

    // Define on which elements the CSS classes should be preserved:
    setupCustomClassConversion('img', 'image', editor)
    setupCustomClassConversion('table', 'table', editor)

    editor.conversion.for('upcast').add(upcastCustomClasses('figure'), { priority: 'low' })

    // Define custom attributes that should be preserved.
    setupCustomAttributeConversion('img', 'image', 'id', editor)
    setupCustomAttributeConversion('table', 'table', 'id', editor)
  }
}
