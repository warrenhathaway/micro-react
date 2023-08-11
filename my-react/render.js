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
    },
    sibling: null,
    parent: null,
    child: null,
    alternate: currentRoot
  }
  deletions = []
  nextUnitOfwork = wipRoot
}


let nextUnitOfwork = null
let wipRoot = null
let currentRoot = null
let deletions = null
function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber) {
  if(!fiber) {
    return
  }
  
  let domParentFiber = fiber.parent
  while(!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const parentDOM = domParentFiber.dom
  // const parentDOM = fiber.parent.dom
  if(fiber.effectTag === "PLACEMENT" && fiber.dom) {
    parentDOM.appendChild(fiber.dom)
  } else if(fiber.effectTag === "DELETION") {
    // parentDOM.removeChild(fiber.dom)
    commitDeletion(fiber, parentDOM)
  } else if(fiber.effectTag === "UPDATE" && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(fiber, parentDOM) {
  if(fiber.dom) {
    parentDOM.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, parentDOM)
  }
}
function updateDom(dom, prevProps, nextProps) {
  const isEvent = key => key.startsWith('on')
  // 删除没有的或者发生改变的事件处理
  Object.keys(prevProps).filter(isEvent).filter(key => !key in nextProps || prevProps[key] !== nextProps[key])
  .forEach(key => {
    const eventType = key.toLowerCase().substring(2)
    dom.removeEventListener(eventType, prevProps[key])
  })
  // 添加事件
  Object.keys(nextProps).filter(isEvent).filter(key => prevProps[key] !== nextProps[key])
  .forEach(key => {
    const eventType = key.toLowerCase().substring(2)
    dom.addEventListener(eventType, nextProps[key])
  })
  // 删除已经没有的props
  Object.keys(prevProps).filter(key => key !== 'children').filter(key => !key in nextProps).forEach(name => dom[name] = '')
  // 赋予新的或者改变的props
  Object.keys(nextProps).filter(key => key !== 'children').filter(key => !key in prevProps || prevProps[key] !== prevProps).forEach(key => {
    dom[key] = nextProps[key]
  })
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
  const isFunctionComponent = fiber.type instanceof Function
  if(isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
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

function updateHostComponent(fiber) {
  if(!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  const elements = fiber.props.children
  reconcileChildren(fiber, elements)
}
function updateFunctionComponent(fiber) {
  const elements = [fiber.type(fiber.props)]
  reconcileChildren(fiber, elements)
}

function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null
  while(index < elements.length || oldFiber) {
    const element = elements[index]
    const sameType =  element && oldFiber && element.type === oldFiber.type
    let newFiber = null

    if(sameType) {
      // 更新
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }

    if(element && !sameType) {
      // 新建
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "PLACEMENT",
      }
    }

    if(oldFiber && !sameType) {
      // 删除
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }

    if(oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if(index === 0) {
      wipFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
    index++
  }
}

export default render