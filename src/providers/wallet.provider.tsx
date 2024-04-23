'use client'
import { Fragment, ReactNode, useCallback, useEffect, useMemo } from 'react'
import {
  Coin98WalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  AnchorWallet,
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react'
import { SystemProgram } from '@solana/web3.js'
import { AnchorProvider } from '@coral-xyz/anchor'

import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'

import { env } from '@/configs/env'
import solConfig from '@/configs/sol.config'

const SUPPORTED_WALLETS = [
  new PhantomWalletAdapter(),
  new TorusWalletAdapter(),
  new Coin98WalletAdapter(),
  new LedgerWalletAdapter(),
  new SolflareWalletAdapter(),
]

/**
 * Store
 */

export type WalletStore = {
  lamports: number
  setLamports: (lamports: number) => void
}

export const useWalletStore = create<WalletStore>()(
  devtools(
    (set) => ({
      lamports: 0,
      setLamports: (lamports: number) =>
        set({ lamports }, false, 'setLamports'),
    }),
    {
      name: 'wallet',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */

function LamportsProvider({ children }: { children: ReactNode }) {
  const setLamports = useWalletStore(({ setLamports }) => setLamports)
  const { publicKey } = useWallet()
  const { connection } = useConnection()

  const fetch = useCallback(async () => {
    if (!publicKey) return setLamports(0)
    const lamports = await connection.getBalance(publicKey)
    return setLamports(lamports)
  }, [publicKey, connection, setLamports])

  const watch = useCallback(() => {
    if (!publicKey) return () => {}
    const watchId = connection.onAccountChange(publicKey, ({ lamports }) =>
      setLamports(lamports),
    )
    return () => connection.removeAccountChangeListener(watchId)
  }, [publicKey, connection, setLamports])

  useEffect(() => {
    fetch()
    return watch()
  }, [fetch, watch])

  return <Fragment>{children}</Fragment>
}

export default function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <ConnectionProvider endpoint={solConfig.rpc}>
      <SolanaWalletProvider wallets={SUPPORTED_WALLETS} autoConnect>
        <WalletModalProvider>
          <LamportsProvider>{children}</LamportsProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}

/**
 * Create an Anchor provider
 * @returns Anchor provider
 */
export const useAnchorProvider = () => {
  const wallet = useAnchorWallet()
  const { connection } = useConnection()
  const provider = useMemo(() => {
    const _wallet: AnchorWallet = wallet || {
      publicKey: SystemProgram.programId,
      signTransaction: async (tx) => tx,
      signAllTransactions: async (txs) => txs,
    }
    return new AnchorProvider(connection, _wallet, { commitment: 'confirmed' })
  }, [connection, wallet])
  return provider
}

/**
 * Get lamports balance
 * @returns Lamports
 */
export const useLamports = () => {
  const lamports = useWalletStore(({ lamports }) => lamports)
  return lamports
}
