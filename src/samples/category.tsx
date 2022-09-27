import React from 'react'
import { Header } from 'decentraland-ui'

import { SnippetInfo } from '../utils/bundle/types'

interface PropTypes {
  name: string
  value: SnippetInfo[]
  onClick(value: SnippetInfo): void
}

const Category = ({ name, value, onClick }: PropTypes) => {
  return (
    <div className="category">
      <div>
        <Header size="medium">{name}</Header>
      </div>
      <div>
        {value.map((card) => (
          <div className="card" key={card.path} onClick={() => onClick(card)}>
            {card.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Category
