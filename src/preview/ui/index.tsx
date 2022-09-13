import React from 'react'

interface PropTypes {
  code: string
}

const PreviewUi = ({ code }: PropTypes) => {
  return <div>{code}</div>
}

export default PreviewUi
