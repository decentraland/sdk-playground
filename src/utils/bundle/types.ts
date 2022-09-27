export type ListOfURL = {
  amdJsUrl: string
  ecs7IndexJsUrl: string
  ecs7IndexDTsUrl: string
  snippetsInfoJsonUrl: string
  snippetsBaseUrl: string
  reactEcs7IndexJsUrl: string
  reactEcs7IndexDTsUrl: string
}

export type Bundle = {
  js: string
  types: string
}

export type Category = 'ui' | 'sample' | 'component'

export type SnippetInfo = {
  category: Category
  name: string
  path: string
}

export type PackagesData = {
  scene: Bundle
  ui: Bundle
  snippetInfo: SnippetInfo[]
  urls: ListOfURL
}
