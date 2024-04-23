import { useCallback, useMemo } from 'react'
import useSWR from 'swr'
import {
  Metaplex,
  PublicKey,
  bundlrStorage,
  walletAdapterIdentity,
} from '@metaplex-foundation/js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { walletAdapterIdentity as umiWalletAdapter } from '@metaplex-foundation/umi-signer-wallet-adapters'

import { isAddress } from '@/helpers/utils'
import solConfig from '@/configs/sol.config'

/**
 * Create an MPL instance
 * @returns MPL instance
 */
export const useMpl = () => {
  const { connection } = useConnection()
  const { wallet } = useWallet()
  const mpl = useMemo(() => {
    if (!wallet) return new Metaplex(connection)
    return Metaplex.make(connection)
      .use(walletAdapterIdentity(wallet.adapter))
      .use(
        bundlrStorage({
          address: solConfig.bundlStorage,
          providerUrl: solConfig.rpc,
          timeout: 6000,
        }),
      )
  }, [connection, wallet])
  return mpl
}

/**
 * Create an Umi instance
 * @returns Umi instance
 */
export const useUmi = () => {
  const { wallet } = useWallet()
  const umi = useMemo(() => {
    if (!wallet) return createUmi(solConfig.rpc).use(mplTokenMetadata())
    return createUmi(solConfig.rpc)
      .use(mplTokenMetadata())
      .use(umiWalletAdapter(wallet.adapter))
  }, [wallet])
  return umi
}

/**
 * Get NFT data
 * @param mintAddresses Mint addresses
 * @returns NFT data
 */
export const useNfts = (mintAddresses: string[]) => {
  const mpl = useMpl()
  const fetcher = useCallback(
    async ([mintAddresses]: [string[]]) => {
      const data = await Promise.all(
        mintAddresses.map((mintAddress) =>
          isAddress(mintAddress)
            ? mpl.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) })
            : undefined,
        ),
      )
      return data
    },
    [mpl],
  )
  const { data } = useSWR([mintAddresses, 'mpl'], fetcher)
  return data || []
}

/**
 * Get NFT by owner
 * @param walletAddress Wallet addresses
 * @returns List nfts by owner
 */
export const useNftsByOwner = (walletAddress: string) => {
  const mpl = useMpl()
  const fetcher = useCallback(
    async (walletAddress: string) => {
      if (!isAddress(walletAddress)) return []
      const nfts = await mpl.nfts().findAllByOwner({
        owner: new PublicKey(walletAddress),
      })
      return nfts
    },
    [mpl],
  )

  const { data } = useSWR(walletAddress, fetcher)
  return data || []
}
