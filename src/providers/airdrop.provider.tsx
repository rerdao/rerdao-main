'use client'
import { Fragment, ReactNode, useCallback, useEffect } from 'react'
import { useAsync } from 'react-use'
import {
  DistributorData,
  MerkleDistributor,
  ReceiptData,
  Leaf,
} from '@sentre/utility'
import { produce } from 'immer'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import {
  Distribute,
  useGetMerkleMetadata,
  useParseMerkleType,
  useUtility,
} from '@/hooks/airdrop.hook'
import { useWallet } from '@solana/wallet-adapter-react'
import { env } from '@/configs/env'

export type RecipientData = {
  address: string
  amount: string
  unlockTime: number
}

export type Configs = {
  unlockTime: number
  expiration: number
  tgePercent: number
  tgeTime: number
  frequency: number
  distributeIn: number
  cliff: number
}
const ONE_MONTH = 2_592_000_000
const SIX_MONTH = 15_552_000_000

const defaultConfigs: Configs = {
  cliff: ONE_MONTH,
  distributeIn: SIX_MONTH,
  expiration: 0,
  frequency: ONE_MONTH,
  tgePercent: 0,
  tgeTime: 0,
  unlockTime: Date.now(),
}

export type AirdropStore = {
  distributors: Record<string, DistributorData>
  upsertDistributor: (address: string, newDistributor: DistributorData) => void
  receipts: Record<string, ReceiptData>
  upsertReceipt: (address: string, newReceipt: ReceiptData) => void
  recipients: RecipientData[]
  setRecipients: (newRecipient: RecipientData[]) => void
  upsertRecipient: (newRecipient: RecipientData) => void
  removeRecipient: (index: number) => void
  mintAddress: string
  setMintAddress: (mintAddress: string) => void
  configs: Configs
  upsertConfigs: (data: Partial<Configs>) => void
  destroy: () => void
}

export const useAirdropStore = create<AirdropStore>()(
  devtools(
    (set) => ({
      distributors: {},
      upsertDistributor: (address: string, distributor: DistributorData) =>
        set(
          produce<AirdropStore>(({ distributors }) => {
            distributors[address] = distributor
          }),
          false,
          'upsertDistributor',
        ),
      receipts: {},
      upsertReceipt: (address: string, receipt: ReceiptData) =>
        set(
          produce<AirdropStore>(({ receipts }) => {
            receipts[address] = receipt
          }),
          false,
          'upsertReceipt',
        ),
      recipients: [],
      setRecipients: (newRecipients: RecipientData[]) =>
        set({ recipients: newRecipients }, false, 'setRecipients'),
      upsertRecipient: (newRecipient: RecipientData) =>
        set(
          produce<AirdropStore>(({ recipients }) => {
            recipients.push(newRecipient)
          }),
          false,
          'upsertRecipient',
        ),
      removeRecipient: (index: number) =>
        set(
          produce<AirdropStore>(({ recipients }) => {
            recipients.splice(index, 1)
          }),
          false,
          'removeRecipient',
        ),
      mintAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',
      setMintAddress: (mintAddress) =>
        set({ mintAddress }, false, 'setMintAddress'),
      configs: defaultConfigs,
      upsertConfigs: (data: Partial<Configs>) =>
        set(
          produce<AirdropStore>(({ configs }) => {
            Object.assign(configs, data)
          }),
        ),
      destroy: () =>
        set(
          {
            recipients: [],
            configs: defaultConfigs,
            mintAddress: '',
          },
          false,
          'destroy',
        ),
    }),
    {
      name: 'airdrop',
      enabled: env === 'development',
    },
  ),
)

export default function AirdropProvider({ children }: { children: ReactNode }) {
  const utility = useUtility()
  const { publicKey } = useWallet()
  const upsertReceipt = useAirdropStore(({ upsertReceipt }) => upsertReceipt)
  const upsertDistributor = useAirdropStore(
    ({ upsertDistributor }) => upsertDistributor,
  )

  const fetchDistributors = useCallback(async () => {
    if (!utility) return
    const { account } = utility.program
    const distributors = await account.distributor.all()
    for (const { publicKey, account: distributorData } of distributors) {
      const address = publicKey.toBase58()
      upsertDistributor(address, distributorData)
    }
  }, [upsertDistributor, utility])

  useEffect(() => {
    fetchDistributors()
  }, [fetchDistributors])

  const fetchReceipts = useCallback(async () => {
    if (!publicKey || !utility) return
    const { account } = utility.program
    const receipts = await account.receipt.all([
      { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
    ])
    for (const { publicKey, account: receiptData } of receipts) {
      const address = publicKey.toBase58()
      upsertReceipt(address, receiptData)
    }
  }, [publicKey, upsertReceipt, utility])

  useEffect(() => {
    fetchReceipts()
  }, [fetchReceipts])

  return <Fragment>{children}</Fragment>
}

/**
 * Get all distributors
 * @returns Distributors list
 */
export const useDistributors = () => {
  const distributors = useAirdropStore(({ distributors }) => distributors)
  return distributors
}

/**
 * Get all my distributes
 * @returns Distributes list
 */
export const useMyDistributes = () => {
  const distributors = useAirdropStore(({ distributors }) => distributors)
  const { publicKey } = useWallet()
  const getMetadata = useGetMerkleMetadata()
  const parseMerkleType = useParseMerkleType()

  const { value } = useAsync(async () => {
    const airdrops: string[] = []
    const vesting: string[] = []
    if (!publicKey) return { airdrops, vesting }
    const createdTime: { [address: string]: number } = {}
    for (const address in distributors) {
      const { authority } = distributors[address]
      if (!authority.equals(publicKey)) continue

      const metadata = await getMetadata(address)
      const root = MerkleDistributor.fromBuffer(Buffer.from(metadata.data))
      createdTime[address] = metadata.createAt // for sorted purpose
      const merkleType = parseMerkleType(root)
      if (!merkleType) continue

      if (merkleType === Distribute.Airdrop) airdrops.push(address)
      if (merkleType === Distribute.Vesting) vesting.push(address)
    }

    const sortedAirdrops = airdrops.sort(
      (a, b) => createdTime[b] - createdTime[a],
    )
    const sortedVesting = vesting.sort(
      (a, b) => createdTime[b] - createdTime[a],
    )

    return { airdrops: sortedAirdrops, vesting: sortedVesting }
  }, [publicKey, distributors])

  return { airdrops: value?.airdrops || [], vesting: value?.vesting || [] }
}

/**
 * Get my reward received list
 * @returns Reward received list
 */
export const useMyReceivedList = () => {
  const distributors = useDistributors()
  const getMetadata = useGetMerkleMetadata()
  const parseMerkleType = useParseMerkleType()
  const { publicKey } = useWallet()
  const utility = useUtility()

  const { value, error, loading } = useAsync(async () => {
    if (!publicKey || !utility) return {}
    const result: Record<string, Array<Leaf & { receiptAddress: string }>> = {}

    for (const address in distributors) {
      const metadata = await getMetadata(address)
      if (!metadata.data) continue
      const root = MerkleDistributor.fromBuffer(
        Buffer.from(metadata.data || metadata.data.data),
      )
      const merkleType = parseMerkleType(root)
      if (!merkleType) continue
      const recipients = await Promise.all(
        root.receipients
          .filter(({ authority }) => authority.equals(publicKey))
          .map(async (recipient) => {
            const receiptAddress = await utility.deriveReceiptAddress(
              recipient.salt,
              address,
            )
            return { ...recipient, receiptAddress }
          }),
      )

      if (recipients.length) result[address] = recipients
    }
    return result
  }, [distributors, publicKey])

  return { receivedList: value, error, loading }
}

/**
 * Get all my receipts
 * @returns Receipts list
 */
export const useMyReceipts = () => {
  const myReceipts = useAirdropStore(({ receipts }) => receipts)
  return myReceipts
}

/**
 * Get all recipients
 * @returns Recipients list && upsert a recipient to list
 */
export const useRecipients = () => {
  const recipients = useAirdropStore(({ recipients }) => recipients)
  const setRecipients = useAirdropStore(({ setRecipients }) => setRecipients)
  const upsertRecipient = useAirdropStore(
    ({ upsertRecipient }) => upsertRecipient,
  )
  const removeRecipient = useAirdropStore(
    ({ removeRecipient }) => removeRecipient,
  )

  return { upsertRecipient, removeRecipient, setRecipients, recipients }
}

/**
 * Get/Set distribute configs
 * @returns Like-useState object
 */
export const useDistributeConfigs = () => {
  const configs = useAirdropStore(({ configs }) => configs)
  const upsertConfigs = useAirdropStore(({ upsertConfigs }) => upsertConfigs)
  return { configs, upsertConfigs }
}

/**
 * Get/Set airdropped mint address
 * @returns Like-useState object
 */
export const useAirdropMintAddress = () => {
  const mintAddress = useAirdropStore(({ mintAddress }) => mintAddress)
  const setMintAddress = useAirdropStore(({ setMintAddress }) => setMintAddress)
  return { mintAddress, setMintAddress }
}
