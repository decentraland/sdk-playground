import React from 'react'
import ReactDOM from 'react-dom/client'
import Editor from './editor'
import 'decentraland-ui/dist/themes/alternative/dark-theme.css'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(<Editor />)
