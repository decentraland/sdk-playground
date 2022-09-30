import { Loader } from 'decentraland-ui'
import React, { useEffect, useState } from 'react'
import compile from './compile'

import './styles.css'

interface PropTypes {
  code: string
}

function Preview({ code }: PropTypes) {
  const [Preview, setPreview] = useState<any>()
  useEffect(() => {
    async function getPreview() {
      if (!code) return
      const Preview = (await compile(code)) as React.FC
      setPreview((<Preview />) as any)
    }

    getPreview().catch((error) => console.log(error.message))
  }, [code])

  return (
    <>
      <Loader active={!Preview} size="massive" />
      <div>{!!Preview && Preview}</div>
    </>
  )
}

export default Preview
