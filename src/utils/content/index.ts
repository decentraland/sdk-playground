export type ContentMapping = {
  file: string
  hash: string
}

type ContentData = {
  baseUrl: string
  content: ContentMapping[]
  contentDeclaration: string
}
let cachedData: ContentData | null = null

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
