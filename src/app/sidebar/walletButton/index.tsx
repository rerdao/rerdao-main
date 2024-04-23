'use client'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

import WalletConnect from './walletConntect'
import WalletInfo from './walletInfo'

export default function WalletButton() {
  const { wallet, disconnect } = useWallet()
  const { setVisible } = useWalletModal()

  if (!wallet) return <WalletConnect onClick={() => setVisible(true)} />
  return <WalletInfo wallet={wallet} onDisconnect={disconnect} />
}
