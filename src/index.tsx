import 'react-hot-loader'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

function renderApp() {
  ReactDOM.render(<h1>It works</h1>, document.getElementById('app')!)
}

renderApp()
;(module as any).hot.accept(renderApp)
