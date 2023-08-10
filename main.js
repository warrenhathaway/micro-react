import createElement from "./my-react/createElement";
import render from "./my-react/render";
const handleInput = (e) => {
  // console.log(e.target.value);
  renderer(e.target.value)
}

const renderer = (value) => {
  const root = document.querySelector('#root')
  const element = createElement(
    'div',
    null,
    createElement('input', {oninput: (e) => handleInput(e)}, null),
    createElement('h1', null, value)
  )
  render(element, root)
}
renderer('hello')
// renderer('111')
// const element = createElement(
//   'div',
//   null,
//   createElement('input', {oninput: handleInput}, null),
//   createElement('h1', null, 'hello')
// )

// const root = document.querySelector('#root')
// render(element, root)