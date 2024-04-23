type Theme = 'light' | 'dark'

type ChainId = 101 | 102 | 103

type MintMetadata = {
  address: string
  chainId: ChainId
  decimals: number
  name: string
  symbol: string
  logoURI: string
  tags: string[]
  extensions: {
    coingeckoId?: string
  }
}

type PageMetadata = {
  title: string
  publishedAt: number
  tags: string[]
  description: string
  thumbnail: string
  pinned: boolean
}

type PageMap = Record<string, PageMetadata>
