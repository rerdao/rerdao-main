import { useCallback, useMemo } from 'react'
import { useAsync } from 'react-use'
import useSWR from 'swr'
import { Utility, Leaf, MerkleDistributor, ReceiptData } from '@sentre/utility'
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react'
import { ParsedAccountData, PublicKey, Transaction } from '@solana/web3.js'
import { decode, encode } from 'bs58'
import { utils } from '@coral-xyz/anchor'
import BN from 'bn.js'
import axios from 'axios'

import solConfig from '@/configs/sol.config'
import { decimalize } from '@/helpers/decimals'
import { useMints } from './spl.hook'
import { isAddress } from '@/helpers/utils'
import {
  RecipientData,
  useDistributeConfigs,
  useAirdropMintAddress,
  useDistributors,
  useMyReceipts,
  useRecipients,
} from '@/providers/airdrop.provider'
import { MetadataBackup, toFilename, uploadFileToAws } from '@/helpers/aws'
import { useMintByAddress } from '@/providers/mint.provider'
import { useAnchorProvider } from '@/providers/wallet.provider'
import { ReceiptState } from '@/app/token-distribution/airdrop-vesting/statusTag'

/**
 * Instantiate a utility
 * @returns Utility instance
 */
export const useUtility = () => {
  const wallet = useAnchorWallet()
  const utility = useMemo(
    () =>
      wallet
        ? new Utility(wallet, solConfig.rpc, solConfig.utilityProgram)
        : undefined,
    [wallet],
  )
  return utility
}

/**
 * Get utility's bulk sender function
 * @param mintAddress Mint address
 * @returns Bulk sender function
 */
export const useSendBulk = (mintAddress: string) => {
  const utility = useUtility()
  const { publicKey, sendTransaction } = useWallet()
  const { connection: conn } = useConnection()
  const { wallet } = useAnchorProvider()
  const [mint] = useMints([mintAddress])

  const decimals = useMemo(() => mint?.decimals, [mint?.decimals])

  const TX_SIZE = 7

  const sendBulk = useCallback(
    async (data: string[][]) => {
      if (!utility || !publicKey || !sendTransaction)
        throw new Error('Wallet is not connected yet.')
      if (!isAddress(mintAddress)) throw new Error('Invalid mint address.')
      if (decimals === undefined) throw new Error('Cannot read onchain data.')

      const totalTx = Math.ceil(data.length / TX_SIZE)
      const transactions: Transaction[] = []

      // Instructions
      const ixs = await Promise.all(
        data
          .map(([address, amount]): [string, BN] => [
            address,
            decimalize(amount, decimals),
          ])
          .map(async ([address, amount]) => {
            const { tx } = await utility.safeTransfer({
              amount,
              tokenAddress: mintAddress,
              dstWalletAddress: address,
              sendAndConfirm: false,
              feeOptions: {
                fee: new BN(solConfig.fee),
                feeCollectorAddress: solConfig.taxman,
              },
            })
            return tx
          }),
      )

      const {
        value: { blockhash, lastValidBlockHeight },
      } = await conn.getLatestBlockhashAndContext()

      for (let i = 0; i < totalTx; i++) {
        const transaction = new Transaction({
          blockhash,
          lastValidBlockHeight,
          feePayer: publicKey,
        })
        const curIdx = i * TX_SIZE
        for (let j = 0; j < TX_SIZE; j++) {
          const insIndex = curIdx + j
          if (ixs[insIndex]) transaction.add(ixs[insIndex])
        }
        transactions.push(transaction)
      }

      // Sign all and broadcast transactions
      const signedTxs = await wallet.signAllTransactions(transactions)
      const txIds: string[] = []
      const listErrLocation: number[] = []

      await Promise.all(
        signedTxs.map(async (tx, idx) => {
          try {
            const signature = await conn.sendRawTransaction(tx.serialize())
            await conn.confirmTransaction({
              blockhash,
              lastValidBlockHeight,
              signature,
            })
            txIds.push(signature)
          } catch {
            listErrLocation.push(idx)
          }
        }),
      )

      // Get errors data
      const errorData: string[][] = []
      listErrLocation.forEach((errorIndex) => {
        for (let i = 0; i < TX_SIZE; i++) {
          const dataIndex = errorIndex * TX_SIZE + i
          if (data[dataIndex]) errorData.push(data[dataIndex])
        }
      })

      return { errorData, txIds }
    },
    [utility, publicKey, sendTransaction, mintAddress, decimals, conn, wallet],
  )

  return sendBulk
}

export enum Distribute {
  Vesting = 'vesting',
  Airdrop = 'airdrop',
}

/**
 * Get type's merkle distributor
 * @param merkle MerkleDistributor
 * @returns Vesting or Airdrop type
 */
export const useParseMerkleType = () => {
  const parseMerkleType = useCallback((merkle: MerkleDistributor) => {
    try {
      const types = [Distribute.Airdrop, Distribute.Vesting]
      for (const type of types) {
        const airdropSalt_v1 = MerkleDistributor.salt('0')
        const airdropSalt_v2 = MerkleDistributor.salt(
          `lightning_tunnel/${type}/0`,
        )
        const salt = merkle.receipients[0].salt
        const x1 = Buffer.compare(airdropSalt_v1, salt)
        const x2 = Buffer.compare(airdropSalt_v2, salt)

        if (x1 !== 0 && x2 !== 0) continue
        return type
      }
      return null
    } catch (error) {
      return null
    }
  }, [])

  return parseMerkleType
}

/**
 * Function get merkle distributor bytes by metadata
 * @param distributor distributor address
 * @returns  Function get
 */
export const useGetMerkleMetadata = () => {
  const distributors = useDistributors()
  const getMetadata = useCallback(
    async (distributor: string) => {
      try {
        const { metadata } = distributors[distributor]
        let cid = encode(Buffer.from(metadata))
        if (MetadataBackup[distributor]) cid = MetadataBackup[distributor]

        const fileName = toFilename(cid)
        const url = 'https://sen-storage.s3.us-west-2.amazonaws.com/' + fileName
        const { data } = await axios.get(url)
        return data
      } catch (error) {
        return { data: '', createdAt: 0 }
      }
    },
    [distributors],
  )

  return getMetadata
}

/**
 * Get merkle distributor bytes by metadata
 * @param address distributor address
 * @returns  merkle distributor bytes and createdAt
 */
export const useMerkleMetadata = (address: string) => {
  const getMetadata = useGetMerkleMetadata()
  const { data } = useSWR([address, 'metadata'], ([address]) =>
    getMetadata(address),
  )
  return data
}

/**
 * Get receipt status
 * @param distributor distributor address
 * @param receiptAddress receipt address
 * @param startedAt Time to claim reward
 * @returns  receipt status
 */
export const useReceiptStatus = () => {
  const distributors = useDistributors()
  const myReceipts = useMyReceipts()

  const getReceiptStatus = useCallback(
    (distributor: string, receiptAddress: string, startedAt: BN) => {
      const { endedAt } = distributors[distributor]
      const receiptData = myReceipts[receiptAddress]
      const { claimed, expired, ready, waiting } = ReceiptState

      if (receiptData) return claimed
      if (Date.now() && endedAt.toNumber() > Date.now()) return expired

      const starttime = startedAt.toNumber()
      if (starttime * 1000 > Date.now() && startedAt) return waiting

      return ready
    },
    [distributors, myReceipts],
  )

  return getReceiptStatus
}

/**
 * Get total value distribute and quantity of recipients
 * @returns quantity of recipients & total distribute
 */
export const useTotalDistribute = () => {
  const { recipients } = useRecipients()
  const { mintAddress } = useAirdropMintAddress()

  const { decimals = 0 } = useMintByAddress(mintAddress) || {}

  const total = useMemo(
    () =>
      recipients.reduce(
        (pre, curr) => pre.add(decimalize(curr.amount, decimals)),
        new BN(0),
      ),
    [decimals, recipients],
  )

  const quantity = useMemo(() => {
    const mapping: Record<string, RecipientData> = {}
    recipients.forEach((recipient) => (mapping[recipient.address] = recipient))
    return Object.keys(mapping).length
  }, [recipients])

  return { total, quantity }
}

/**
 * Claim reward
 * @param address distributor's address
 * @param recipientData recipient's information
 * @returns Claim reward function
 */
export const useClaim = (address: string, recipientData: Leaf) => {
  const getMetadata = useGetMerkleMetadata()
  const utility = useUtility()

  const onClaim = useCallback(async () => {
    if (!utility) return ''
    const { data } = await getMetadata(address)
    const merkle = MerkleDistributor.fromBuffer(Buffer.from(data))
    const proof = merkle.deriveProof(recipientData)
    const validProof = merkle.verifyProof(proof, recipientData)
    if (!validProof) throw "You don't belong this merkle tree!"
    const { txId } = await utility.claim({
      distributorAddress: address,
      proof,
      data: recipientData,
      feeOptions: {
        fee: new BN(solConfig.fee),
        feeCollectorAddress: solConfig.taxman,
      },
    })
    return txId
  }, [address, getMetadata, recipientData, utility])

  return onClaim
}

/**
 *
 * Init new airdrop or vesting by merkle tree
 * @param type Vesting or Airdrop type
 * @returns Init new merkle tree function
 */
export const useInitMerkleTree = (type: Distribute) => {
  const { recipients } = useRecipients()
  const {
    configs: { expiration },
  } = useDistributeConfigs()
  const { mintAddress } = useAirdropMintAddress()
  const { decimals = 0 } = useMintByAddress(mintAddress) || {}
  const utility = useUtility()

  const toUnitTime = useCallback((time: number) => {
    const unitDate = new Date(time).toUTCString()
    const unitTime = new Date(unitDate).getTime()
    return unitTime
  }, [])

  const onInitMerkleTree = useCallback(async () => {
    if (!utility) return
    if (![Distribute.Airdrop, Distribute.Vesting].includes(type)) return

    // Build tree
    const leafs: Leaf[] = recipients.map(
      ({ address, unlockTime, amount }, i) => {
        const unitTime = toUnitTime(unlockTime)
        return {
          amount: decimalize(amount, decimals),
          authority: new PublicKey(address),
          startedAt: new BN(unitTime / 1000),
          salt: MerkleDistributor.salt(
            `lightning_tunnel/${type}/${i.toString()}`,
          ),
        }
      },
    )
    const merkleDistributor = new MerkleDistributor(leafs)
    const data = {
      createAt: Math.floor(Date.now() / 1000),
      data: merkleDistributor.toBuffer(),
    }
    const blob = [
      new Blob([JSON.stringify({ ...data }, null, 2)], {
        type: 'application/json',
      }),
    ]

    const file = new File(blob, 'metadata.txt')
    const cid = await uploadFileToAws(file)
    const { txId } = await utility.initializeDistributor({
      tokenAddress: mintAddress,
      total: merkleDistributor.getTotal(),
      merkleRoot: merkleDistributor.deriveMerkleRoot(),
      metadata: decode(cid),
      endedAt: expiration / 1000,
      feeOptions: {
        fee: new BN(solConfig.fee),
        feeCollectorAddress: solConfig.taxman,
      },
    })
    return txId || ''
  }, [decimals, expiration, mintAddress, recipients, toUnitTime, utility, type])

  return onInitMerkleTree
}

/**
 *
 * Revoke reward
 * @param address distributor's address
 * @returns revoke function
 */
export const useRevoke = (address: string) => {
  const utility = useUtility()

  const onRevoke = useCallback(async () => {
    if (!utility) return
    const { txId } = await utility.revoke({
      distributorAddress: address,
      feeOptions: {
        fee: new BN(solConfig.fee),
        feeCollectorAddress: solConfig.taxman,
      },
    })
    return txId
  }, [address, utility])

  return onRevoke
}

/**
 * Get all receipts by distributor address
 * @param address distributor address
 * @returns Receipts list
 */
export const useReceiptByDistributorAddress = (address: string) => {
  const utility = useUtility()

  const { value: receipts } = useAsync(async () => {
    if (!utility) return
    const result: Record<string, ReceiptData> = {}
    const { account } = utility.program
    const receipts = await account.receipt.all([
      { memcmp: { offset: 40, bytes: address } },
    ])
    for (const { publicKey, account: receiptData } of receipts) {
      const address = publicKey.toBase58()
      result[address] = receiptData
    }
    return result
  }, [utility])

  return receipts
}

/**
 *
 * Balance on merkle tree
 * @param address distributor's address
 * @returns remaining balance
 */
export const useRemainingBalance = (address: string) => {
  const { connection } = useConnection()
  const distributors = useDistributors()
  const { mint } = distributors[address]
  const utility = useUtility()

  const { value: remaining } = useAsync(async () => {
    if (!utility) return
    const treasurerAddress = await utility.deriveTreasurerAddress(address)
    const associated = await utils.token.associatedAddress({
      mint,
      owner: new PublicKey(treasurerAddress),
    })
    const { value } = await connection.getParsedAccountInfo(associated)
    if (!value) return '0'
    const data = value.data as ParsedAccountData
    return data.parsed.info.tokenAmount.amount || '0'
  }, [address, utility])

  return remaining
}
