export type ContentMapping = {
  file: string
  hash: string
}

export type ContentData = {
  baseUrl: string
  content: ContentMapping[]
  contentDeclaration: string
}
let cachedData: ContentData | null = null
let entityPointerCachedData: ContentData | null = null

export async function getGenesisPlazaContent(): Promise<ContentData | undefined> {
  const contentUrl = 'https://peer.decentraland.org/content'
  if (cachedData) {
    return cachedData
  }

  try {
    const genesisPlazaUrl = `${contentUrl}/entities/scene?pointer=0,0`
    const genesisPlazaScene = ((await (await fetch(genesisPlazaUrl)).json()) as any)[0]
    const content = genesisPlazaScene.content as ContentMapping[]
    const contentDeclaration: string = `\n type GenesisPlazaContent = ${content.map(($) => `"${$.file}"`).join(' | ')}`

    cachedData = {
      baseUrl: `${contentUrl}/contents/`,
      content,
      contentDeclaration
    }
    return cachedData
  } catch (err) {}
}

export async function getEntityPointerContentMappings(): Promise<ContentData | undefined> {
  const contentUrl = 'https://peer.decentraland.org/content'
  if (entityPointerCachedData) {
    return entityPointerCachedData
  }
  try {
    const qs = new URLSearchParams(document.location.search)

    if (!qs.has('entity_pointer')) return

    const pointer = qs.get('entity_pointer')
    const pointerUrl = `${contentUrl}/entities/${pointer}`
    const pointerUrlResponse = ((await (await fetch(pointerUrl)).json()) as any)[0]
    const content = pointerUrlResponse.content as ContentMapping[]

    entityPointerCachedData = {
      baseUrl: `${contentUrl}/contents/`,
      content,
      contentDeclaration: ''
    }
    return entityPointerCachedData
  } catch (err) {}
}
