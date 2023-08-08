function createDom(fiber) { 
  const {type, props} = fiber
  const dom = type == 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(type)

  // 给dom添加属性，是nodeValue属性的话添加文本内容
  Object.keys(props).filter(key => key != 'children').forEach(name => dom[name] = props[name])

  // 递归render每个节点
  // props.children.forEach(child => render(child, dom))

  // container.appendChild(dom)
  return dom
}
function render(element, container) {
   wipRoot = {
    dom: container,
    props: {
      children: [element]
    }
  }
  nextUnitOfwork = wipRoot
}


let nextUnitOfwork = null
let wipRoot = null

function commitRoot() {
  commitWork(wipRoot.child)
  wipRoot = null
}

function commitWork(fiber) {
  if(!fiber) {
    return
  }
  const parentDOM = fiber.parent.dom
  parentDOM.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

// 调度函数
function workLoop(deadline) {
  let shouleYield = false
  while(nextUnitOfwork && !shouleYield) {
    console.log(shouleYield);
    nextUnitOfwork = performUnitOfWork(nextUnitOfwork)
    shouleYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)

  // commit阶段
  if(!nextUnitOfwork && wipRoot) {
    commitRoot()
  }
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
  if(!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  // 将render和commit分离
  // if(fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }

  const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  while(index < elements.length) {
    const element = elements[index]
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }
    if(index == 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
    index++
  }

  if(fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber) {
    if(nextFiber.sibling) {
        return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }

}
export default render