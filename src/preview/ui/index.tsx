import React, { useEffect, useState } from 'react'
import { transformCode } from './compile-ui'

import './styles.css'

interface PropTypes {
  code: string
}

function Preview({ code }: PropTypes) {
  const [Preview, setPreview] = useState<any>()
  const [error, setError] = useState('')

  useEffect(() => {
    async function getPreview() {
      if (!code) return
      const Preview = (await transformCode(code)) as React.FC
      setPreview((<Preview />) as any)
    }

    getPreview().catch((error) => setError(error.message))
  }, [code])

  return (
    <div className="ui-preview-ui">
      {error && <div>{error}</div>}
      <div>{Preview ? Preview : 'loading'}</div>
    </div>
  )
}

export default Preview
