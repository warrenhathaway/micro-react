import createElement from "./my-react/createElement";
import render, { useState } from "./my-react/render";

const Counter = () => {
  const [state, setState] = useState(0)
  return createElement(
    'h1', 
    { onclick: () => setState(prev => prev + 1) },
    state
  )
}

const container = document.querySelector('#root')

const element = createElement(Counter)
render(element, container)