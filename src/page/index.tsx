import React from 'react'

import './styles.css'

interface PropTypes {
  children: React.ReactNode
  className?: string
}

const Page: React.FC<PropTypes> = ({ className, children }) => {
  return <div className={`ui-page ${className || 'asdsad'}`}>{children}</div>
}

export default Page
