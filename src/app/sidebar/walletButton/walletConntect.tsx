'use client'
import { Wallet } from 'lucide-react'

export type WalletConnectProps = {
  onClick: () => void
}

export default function WalletConnect({ onClick }: WalletConnectProps) {
  return (
    <div className="menu-item gap-2" onClick={onClick}>
      <Wallet className="menu-logo" />
      <p className="menu-option font-semibold">Connect Wallet</p>
    </div>
  )
}
