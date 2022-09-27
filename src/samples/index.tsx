import React from 'react'
import { Header } from 'decentraland-ui'

import Category from './category'
import Page from '../page'

import './styles.css'
import { SnippetInfo } from '../utils/bundle/types'

interface PropTypes {
  onClick(snippet: SnippetInfo): void
  snippets: SnippetInfo[]
}

const categoryName: { [key in SnippetInfo['category']]: string } = {
  component: 'Components',
  ui: 'UI Examples',
  sample: 'Scenes'
}

const Samples = (props: PropTypes) => {
  const categories = props.snippets.reduce((acc, snippet) => {
    acc[snippet.category] = acc[snippet.category] ?? []
    acc[snippet.category].push(snippet)
    return acc
  }, {} as { [key in SnippetInfo['category']]: SnippetInfo[] })
  return (
    <Page className="ui-samples">
      <div>
        <Header>Scene Examples</Header>
        <p className="secondary-text">Explore examples of scenes & components</p>
        <div className="categories">
          {Object.entries(categories).map(([name, snippets]) => (
            <Category
              key={name}
              name={categoryName[name as SnippetInfo['category']] || name}
              value={snippets}
              onClick={props.onClick}
            />
          ))}
        </div>
      </div>
    </Page>
  )
}

export default Samples
