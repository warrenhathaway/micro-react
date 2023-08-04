import createElement from "./my-react/createElement";
import render from "./my-react/render";


const element = createElement(
  'h1',
  {id: 'title', style: 'background: orange'},
  'hello world',
  createElement('a', { href: 'https://www.bilibili.com', style: 'color: red' }, 'bilibili')
)

const root = document.querySelector('#root')
render(element, root)