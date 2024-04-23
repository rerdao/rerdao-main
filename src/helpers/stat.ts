import axios from 'axios'

import mintConfig from '@/configs/mint.config'

export const getPrice = async (mintAddress: string) => {
  try {
    const { data: price } = await axios.get<number>(
      `${mintConfig.host}/price/${mintAddress}`,
    )
    return price
  } catch (er) {
    return 0
  }
}

export const getAllTokens = async () => {
  try {
    const { data } = await axios.get<MintMetadata[]>('https://token.jup.ag/all')
    return data
  } catch (er) {
    return []
  }
}
