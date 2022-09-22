import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import 'decentraland-ui/dist/themes/alternative/dark-theme.css'

import Editor from './editor'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(<Editor />)
