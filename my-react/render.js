function render(element, container) {
  const {type, props} = element
  const dom = type == 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(type)

  // 给dom添加属性，是nodeValue属性的话添加文本内容
  Object.keys(props).filter(key => key != 'children').forEach(name => dom[name] = props[name])

  // 递归render每个节点
  props.children.forEach(child => render(child, dom))
  // console.log(element);
  container.appendChild(dom)
}


export default render