import { useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { splTokenProgram } from '@coral-xyz/spl-token'
import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { Address, utils, web3 } from '@coral-xyz/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { toPublicKey } from '@metaplex-foundation/js'

import { isAddress } from '@/helpers/utils'
import { useAnchorProvider } from '@/providers/wallet.provider'

export const TOKEN_20202_PROGRAM_ID = new web3.PublicKey(
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
)

/**
 * Create an SPL instance
 * @returns SPL instance
 */
export const useSpl = () => {
  const provider = useAnchorProvider()
  const spl = useMemo(() => splTokenProgram({ provider }), [provider])
  return spl
}

/**
 * Create an Token2022 instance
 * @returns Token2022 instance
 */
export const useToken2022 = () => {
  const provider = useAnchorProvider()
  const token2022 = useMemo(
    () => splTokenProgram({ provider, programId: TOKEN_20202_PROGRAM_ID }),
    [provider],
  )
  return token2022
}

/**
 * Get mint data
 * @param mintAddresses Mint addresses
 * @returns Mint data
 */
export const useMints = (mintAddresses: string[]) => {
  const spl = useSpl()
  const fetcher = useCallback(
    async ([mintAddresses]: [string[]]) => {
      for (const mintAddress of mintAddresses)
        if (!isAddress(mintAddress)) return undefined
      const data = await Promise.all(
        mintAddresses.map(
          async (mintAddress) => await spl.account.mint.fetch(mintAddress),
        ),
      )
      return data
    },
    [spl],
  )
  const { data } = useSWR([mintAddresses, 'spl'], fetcher)

  return data || []
}

/**
 * Create PDA account
 * @param mint mint account
 * @param owner your public key
 * @returns Init PDA account function
 */
export const useInitPDAAccount = () => {
  const { publicKey } = useWallet()
  const initPDAAccount = useCallback(
    async (mint: PublicKey, owner: PublicKey) => {
      if (!publicKey) return
      const associatedTokenAccount = await utils.token.associatedAddress({
        mint,
        owner,
      })
      const ix = new TransactionInstruction({
        keys: [
          {
            pubkey: publicKey,
            isSigner: true,
            isWritable: true,
          },
          {
            pubkey: associatedTokenAccount,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: owner,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: mint,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: utils.token.TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
          },
        ],
        programId: utils.token.ASSOCIATED_PROGRAM_ID,
        data: Buffer.from([]),
      })
      const tx = new Transaction().add(ix)
      return tx
    },
    [publicKey],
  )

  return initPDAAccount
}

export const useInitMultiTokenAccount = () => {
  const initPDAAccount = useInitPDAAccount()
  const { connection } = useConnection()
  const initTxCreateMultiTokenAccount = useCallback(
    async (mints: Address[], owner: PublicKey) => {
      const transactions: web3.Transaction[] = []
      const tokenAccounts = []
      for (const mint of mints) {
        const mintPublicKey = toPublicKey(mint)
        const associatedTokenAccount = await utils.token.associatedAddress({
          mint: mintPublicKey,
          owner,
        })
        tokenAccounts.push(associatedTokenAccount)
      }
      const accounts = await connection.getMultipleAccountsInfo(tokenAccounts)
      await Promise.all(
        accounts.map(async (value, index) => {
          if (value !== null) return
          const tx = await initPDAAccount(toPublicKey(mints[index]), owner)
          if (tx) transactions.push(tx)
        }),
      )

      return transactions
    },
    [connection, initPDAAccount],
  )

  return initTxCreateMultiTokenAccount
}
