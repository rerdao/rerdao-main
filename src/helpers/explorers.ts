import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

import solConfig from '@/configs/sol.config'
import { isAddress } from './utils'

/**
 * Get chain id
 * @returns Chain ID
 */
export const getChainId = () => {
  if (solConfig.network === WalletAdapterNetwork.Mainnet) return 101
  else if (solConfig.network === WalletAdapterNetwork.Testnet) return 102
  else return 103
}

/**
 * Build an explorer url by the context including addresses or transaction ids
 * @param addressOrTxId - Address or TxId
 * @param cluster - Network
 * @returns Solcan URL
 */
export const solscan = (addressOrTxId: string): string => {
  if (!addressOrTxId) return '#'
  if (isAddress(addressOrTxId)) {
    return `https://solscan.io/account/${addressOrTxId}?cluster=${solConfig.network}`
  }
  return `https://solscan.io/tx/${addressOrTxId}?cluster=${solConfig.network}`
}
