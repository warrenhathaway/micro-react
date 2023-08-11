import createElement from "./my-react/createElement";
import render from "./my-react/render";

const App = (props) => {
  return createElement('h1', null, 'Hi', props.name)
}

const container = document.querySelector('#root')

const element = createElement(App, { name: 'lufei' })
render(element, container)