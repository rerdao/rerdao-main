'use client'
import { Fragment, ReactNode, useCallback, useEffect } from 'react'
import { splTokenProgram } from '@coral-xyz/spl-token'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useWallet } from '@solana/wallet-adapter-react'
import { KeyedAccountInfo } from '@solana/web3.js'
import { produce } from 'immer'

import { env } from '@/configs/env'
import { isAddress } from '@/helpers/utils'
import { useSpl } from '@/hooks/spl.hook'

export type TokenAccount = Awaited<
  ReturnType<ReturnType<typeof splTokenProgram>['account']['account']['fetch']>
>

/**
 * Store
 */

export type TokenAccountStore = {
  tokenAccounts: Record<string, TokenAccount>
  setTokenAccounts: (tokenAccounts: Record<string, TokenAccount>) => void
  upsertTokenAccount: (payload: Record<string, TokenAccount>) => void
}

export const useTokenAccountStore = create<TokenAccountStore>()(
  devtools(
    (set) => ({
      tokenAccounts: {},
      setTokenAccounts: (tokenAccounts: Record<string, TokenAccount>) =>
        set({ tokenAccounts }, false, 'setTokenAccounts'),
      upsertTokenAccount: (payload: Record<string, TokenAccount>) =>
        set(
          produce<TokenAccountStore>(({ tokenAccounts }) => {
            Object.assign(tokenAccounts, payload)
          }),
          false,
          'upsertTokenAccount',
        ),
    }),
    {
      name: 'toke-account',
      enabled: env === 'development',
    },
  ),
)

/**
 * Provider
 */

export default function TokenAccountProvider({
  children,
}: {
  children: ReactNode
}) {
  const setTokenAccounts = useTokenAccountStore(
    ({ setTokenAccounts }) => setTokenAccounts,
  )
  const upsertTokenAccount = useTokenAccountStore(
    ({ upsertTokenAccount }) => upsertTokenAccount,
  )
  const spl = useSpl()
  const { publicKey } = useWallet()

  const fetch = useCallback(async () => {
    if (!publicKey) return []
    const data = await spl.account.account.all([
      {
        memcmp: { offset: 32, bytes: publicKey.toBase58() },
      },
    ])
    const tokenAccounts: Record<string, TokenAccount> = {}
    data.forEach(
      ({ publicKey, account }) =>
        (tokenAccounts[publicKey.toBase58()] = account),
    )
    return setTokenAccounts(tokenAccounts)
  }, [publicKey, spl, setTokenAccounts])

  const watch = useCallback(() => {
    if (!publicKey) return () => {}
    const id = spl.provider.connection.onProgramAccountChange(
      spl.programId,
      ({ accountId, accountInfo }: KeyedAccountInfo) => {
        const data = spl.coder.accounts.decode('account', accountInfo.data)
        return upsertTokenAccount({ [accountId.toBase58()]: data })
      },
      'confirmed',
      [{ memcmp: { bytes: publicKey.toBase58(), offset: 32 } }],
    )
    return () => spl.provider.connection.removeProgramAccountChangeListener(id)
  }, [publicKey, spl, upsertTokenAccount])

  useEffect(() => {
    fetch()
    return watch()
  }, [fetch, watch])

  return <Fragment>{children}</Fragment>
}

/**
 * Get all my token accounts
 * @returns Token account list
 */
export const useAllTokenAccounts = () => {
  const tokenAccounts = useTokenAccountStore(
    ({ tokenAccounts }) => tokenAccounts,
  )
  return tokenAccounts
}

/**
 * Get all my token account by mint address
 * @param mintAddress Mint address
 * @returns Token account
 */
export const useTokenAccountByMintAddress = (mintAddress: string) => {
  const tokenAccount = useTokenAccountStore(({ tokenAccounts }) => {
    const tokenAccountAddress = Object.keys(tokenAccounts).find(
      (tokenAccountAddress) => {
        const { mint } = tokenAccounts[tokenAccountAddress]
        return mint.toBase58() === mintAddress
      },
    )
    if (!isAddress(tokenAccountAddress)) return undefined
    return tokenAccounts[tokenAccountAddress]
  })
  return tokenAccount
}
