import { useCallback, useMemo, useState } from 'react'
import SenFarmingProgram from '@sentre/farming'
import BN from 'bn.js'
import { useAsync, useInterval } from 'react-use'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  Signer,
  Transaction,
} from '@solana/web3.js'

import solConfig from '@/configs/sol.config'
import { useAnchorProvider } from '@/providers/wallet.provider'
import {
  useAllBoostings,
  useAllFarms,
  useDebtByFarmAddress,
  useFarmByAddress,
} from '@/providers/farming.provider'
import { isAddress } from '@/helpers/utils'
import { useMpl } from './mpl.hook'
import { useMints } from './spl.hook'
import { decimalize } from '@/helpers/decimals'

export type Reward = {
  mintAddress: string
  budget: string
}

export type BoostData = {
  collection: string
  percentage: number
}

/**
 * Velocity precision
 */
export const precision = new BN(10 ** 9)

/**
 * Instantiate a farming
 * @returns Farming instance
 */
export const useFarming = () => {
  const provider = useAnchorProvider()
  const farming = useMemo(
    () => new SenFarmingProgram(provider, solConfig.senFarmingProgram),
    [provider],
  )
  return farming
}

/**
 * Get farm's lifetime
 * @param farmAddress Farm address
 * @returns Lifetime
 */
export const useFarmLifetime = (farmAddress: string) => {
  const { startDate, endDate } = useFarmByAddress(farmAddress)
  const lifetime = useMemo(() => endDate.sub(startDate), [startDate, endDate])
  return lifetime
}

/**
 * (Intervally) Get farm's time passed
 * @param farmAddress Farm address
 * @returns Time passed
 */
export const useFarmTimePassed = (
  farmAddress: string,
  delay: number | null = null,
) => {
  const [currentDate, setCurrentDate] = useState(Math.round(Date.now() / 1000))
  const { startDate } = useFarmByAddress(farmAddress)
  const lifetime = useFarmLifetime(farmAddress)

  useInterval(() => setCurrentDate(Math.round(Date.now() / 1000)), delay)

  const timePassed = useMemo(
    () =>
      BN.min(BN.max(new BN(currentDate).sub(startDate), new BN(0)), lifetime),
    [startDate, lifetime, currentDate],
  )

  return timePassed
}

/**
 * Get farm's velocity
 * @param farmAddress Farm address
 * @returns Velocity (out_tokens/seconds) with precision
 */
export const useFarmVelocity = (farmAddress: string) => {
  const { totalRewards } = useFarmByAddress(farmAddress)
  const lifetime = useFarmLifetime(farmAddress)
  const velocity = useMemo(
    () => totalRewards.mul(precision).div(lifetime),
    [totalRewards, lifetime],
  )
  return velocity
}

/**
 * Get farm's emission rate
 * @param farmAddress Farm address
 * @returns Emission rate (out_tokens/seconds/in_tokens) with precision
 */
export const useFarmEmissionRate = (farmAddress: string) => {
  const { totalShares } = useFarmByAddress(farmAddress)
  const velocity = useFarmVelocity(farmAddress)
  const emissionRate = useMemo(
    () => (totalShares.isZero() ? velocity : velocity.div(totalShares)),
    [totalShares, velocity],
  )
  return emissionRate
}

/**
 * Sort farm in the time order
 * @param farmAddresses Farm addresses
 * @param active Manually turn on/off the hook
 * @returns Sorted farm addresses
 */
export const useSortedFarmsByStartDate = (
  farmAddresses: string[],
  active = true,
) => {
  const farms = useAllFarms()

  const sortedFarmAddresses = useMemo(() => {
    if (!active) return farmAddresses
    return farmAddresses.sort((a, b) => {
      const { startDate: ad } = farms[a]
      const { startDate: bd } = farms[b]
      if (ad.eq(bd)) return 0
      else if (ad.lt(bd)) return 1
      else return -1
    })
  }, [farms, farmAddresses, active])

  return sortedFarmAddresses
}

/**
 * Filter boosted farms
 * @param farmAddresses Farm addresses
 * @param active Manually turn on/off the hook
 * @returns Filtered farm addresses
 */
export const useFilterFarmsByNFTBoosted = (
  farmAddresses: string[],
  active = true,
) => {
  const rewards = useAllBoostings()

  const filteredFarmAddresses = useMemo(() => {
    if (!active) return farmAddresses
    const boostedFarmAddress = Object.values(rewards).map(({ farm }) =>
      farm.toBase58(),
    )
    return farmAddresses.filter((farmAddress) =>
      boostedFarmAddress.includes(farmAddress),
    )
  }, [rewards, farmAddresses, active])

  return filteredFarmAddresses
}

/**
 * Get farm's harvest function
 * @param farmAddress Farm address
 * @returns Harvest function
 */
export const useHarvest = (farmAddress: string) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { connection } = useConnection()
  const farming = useFarming()

  const harvest = useCallback(async () => {
    if (!publicKey || !signTransaction || !sendTransaction)
      throw new Error('Wallet is not connected yet.')
    if (!isAddress(farmAddress)) throw new Error('Invalid farm address.')
    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext()
    const tx = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: publicKey,
    })
    const txs = await Promise.all([
      farming.unstake({ farm: farmAddress, sendAndConfirm: false }),
      farming.stake({ farm: farmAddress, sendAndConfirm: false }),
      farming.claim({ farm: farmAddress, sendAndConfirm: false }),
      farming.convertRewards({ farm: farmAddress, sendAndConfirm: false }),
    ])
    tx.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
      ...txs.map(({ tx }) => tx),
    )
    const signature = await sendTransaction(tx, connection, {
      minContextSlot,
    })
    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    })
    return signature
  }, [
    farmAddress,
    publicKey,
    signTransaction,
    sendTransaction,
    connection,
    farming,
  ])

  return harvest
}

/**
 * Get farm's stake function
 * @param farmAddress Farm address
 * @param amount Stake amount
 * @returns Stake function
 */
export const useStake = (
  farmAddress: string,
  amount: BN,
  nfts: string[] = [],
) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { connection } = useConnection()
  const farming = useFarming()
  const { shares } = useDebtByFarmAddress(farmAddress) || {}
  const mpl = useMpl()

  const stake = useCallback(async () => {
    if (!publicKey || !signTransaction || !sendTransaction)
      throw new Error('Wallet is not connected yet.')
    if (!isAddress(farmAddress)) throw new Error('Invalid farm address.')
    if (amount.isZero()) throw new Error('Invalid amount.')
    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext()
    const tx = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: publicKey,
    })
    const txs = await Promise.all([
      ...(!shares
        ? [farming.initializeDebt({ farm: farmAddress, sendAndConfirm: false })]
        : [
            farming.unstake({ farm: farmAddress, sendAndConfirm: false }),
            farming.withdraw({
              farm: farmAddress,
              shares,
              sendAndConfirm: false,
            }),
          ]),
      ...nfts.map(async (nft) => {
        const { metadataAddress, collection } = await mpl
          .nfts()
          .findByMint({ mintAddress: new PublicKey(nft) })
        return farming.lock({
          farm: farmAddress,
          nft,
          metadata: metadataAddress,
          collection: collection?.address || '',
          sendAndConfirm: false,
        })
      }),
      farming.deposit({
        farm: farmAddress,
        inAmount: amount.add(shares || new BN(0)),
        sendAndConfirm: false,
      }),
      farming.stake({ farm: farmAddress, sendAndConfirm: false }),
    ])
    tx.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
      ...txs.map(({ tx }) => tx),
    )
    const signature = await sendTransaction(tx, connection, {
      minContextSlot,
    })
    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    })
    return signature
  }, [
    farmAddress,
    amount,
    nfts,
    shares,
    publicKey,
    signTransaction,
    sendTransaction,
    connection,
    farming,
    mpl,
  ])

  return stake
}

/**
 * Get farm's unstake function
 * @param farmAddress Farm address
 * @param amount Unstake amount
 * @returns Unstake function
 */
export const useUnstake = (farmAddress: string, shares: BN) => {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const farming = useFarming()

  const unstake = useCallback(async () => {
    if (!publicKey || !sendTransaction)
      throw new Error('Wallet is not connected yet.')
    if (!isAddress(farmAddress)) throw new Error('Invalid farm address.')
    if (shares.isZero()) throw new Error('Invalid amount.')
    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext()
    const tx = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: publicKey,
    })
    const txs = await Promise.all([
      farming.unstake({ farm: farmAddress, sendAndConfirm: false }),
      farming.withdraw({ farm: farmAddress, shares, sendAndConfirm: false }),
      farming.stake({ farm: farmAddress, sendAndConfirm: false }),
    ])
    tx.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
      ...txs.map(({ tx }) => tx),
    )
    const signature = await sendTransaction(tx, connection, {
      minContextSlot,
    })
    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    })
    return signature
  }, [farmAddress, shares, publicKey, sendTransaction, connection, farming])

  return unstake
}

/**
 * Get farm's unstake nft function
 * @param farmAddress Farm address
 * @param nft Unstake nft address
 * @returns Unstake nft function
 */
export const useUnstakeNft = (farmAddress: string, nft: string) => {
  const farming = useFarming()
  const debtData = useDebtByFarmAddress(farmAddress)
  const mpl = useMpl()

  const withdraw = useCallback(
    (mi_mint_amount: BN) => {
      if (!debtData?.leverage) return new BN(0)
      const input_mint_out = mi_mint_amount
        .mul(precision)
        .div(debtData.leverage)
      return input_mint_out
    },
    [debtData?.leverage],
  )

  const unstakeNft = useCallback(async () => {
    const metadata = await mpl
      .nfts()
      .findByMint({ mintAddress: new PublicKey(nft) })
    if (!metadata.collection?.address) throw new Error('Not found collection!')

    const shareAmount = debtData?.shares || new BN(0)
    const depositAmount = withdraw(shareAmount)
    // Validate
    const transaction = new Transaction()
    // Initialize debt if needed
    if (!debtData) {
      const { tx } = await farming.initializeDebt({
        farm: farmAddress,
        sendAndConfirm: false,
      })
      transaction.add(tx)
    }
    // Unstake
    if (!shareAmount.isZero()) {
      const { tx } = await farming.unstake({
        farm: farmAddress,
        sendAndConfirm: false,
      })
      transaction.add(tx)
    }
    // Withdraw
    if (!shareAmount.isZero()) {
      const { tx } = await farming.withdraw({
        farm: farmAddress,
        shares: shareAmount,
        sendAndConfirm: false,
      })
      transaction.add(tx)
    }
    // Unlock
    const { tx: txUnlock } = await farming.unlock({
      nft,
      collection: metadata.collection.address,
      farm: farmAddress,
      metadata: metadata.metadataAddress,
      sendAndConfirm: false,
    })
    transaction.add(txUnlock)
    // Deposit
    if (!depositAmount.isZero()) {
      const { tx } = await farming.deposit({
        farm: farmAddress,
        inAmount: depositAmount,
        sendAndConfirm: false,
      })
      transaction.add(tx)
    }
    // Stake
    const { tx: txStake } = await farming.stake({
      farm: farmAddress,
      sendAndConfirm: false,
    })
    transaction.add(txStake)

    const provider = farming.provider
    const txId = await provider.sendAndConfirm(transaction)

    return txId
  }, [debtData, farmAddress, farming, mpl, nft, withdraw])

  return unstakeNft
}

/**
 * Get farm's transfer ownership function
 * @param farmAddress Farm address
 * @returns Transfer ownership function
 */
export const useTransferOwnership = (
  farmAddress: string,
  ownerAddress: string,
) => {
  const farming = useFarming()

  const transferOwnership = useCallback(async () => {
    if (!isAddress(farmAddress)) throw new Error('Invalid farm address.')
    if (!isAddress(ownerAddress)) throw new Error('Invalid owner address.')
    const { txId } = await farming.transferOwnership({
      farm: farmAddress,
      newOwner: ownerAddress,
    })
    return txId
  }, [farmAddress, ownerAddress, farming])

  return transferOwnership
}

/**
 * Get farm's transfer ownership function
 * @param farmAddress Farm address
 * @returns Transfer ownership function
 */
export const useInitializeFarm = (
  inputMint: string,
  startAt: number,
  endAt: number,
  boostsData: BoostData[],
  tokenRewards: Reward[],
) => {
  const farming = useFarming()
  const mints = useMints(tokenRewards.map(({ mintAddress }) => mintAddress))
  const decimals = mints.map((mint) => mint?.decimals || 0)

  const onInitializeFarm = useCallback(async () => {
    const mintPubKey = new PublicKey(inputMint)
    const allTxs: { tx: Transaction; signers: Signer[] }[] = []
    // Check time
    const currentTime = new Date().getTime()
    let startAfter = 0
    if (startAt > currentTime)
      startAfter = Math.floor((startAt - currentTime) / 1000)
    const endAfter = Math.floor((endAt - currentTime) / 1000)

    // Initialize farm
    const farmKeypair = Keypair.generate()
    const { tx: txInitializeFarm } = await farming.initializeFarm({
      inputMint: mintPubKey,
      startAfter: startAfter + 10,
      endAfter: endAfter,
      sendAndConfirm: false,
      farmKeypair,
    })
    allTxs.push({ tx: txInitializeFarm, signers: [farmKeypair] })

    // Add Boosting
    if (boostsData.length) {
      const txBoosts = new Transaction()
      await Promise.all(
        boostsData.map(async ({ collection, percentage }) => {
          const { tx: txPushFarmBoostingCollection } =
            await farming.pushFarmBoostingCollection({
              farm: farmKeypair.publicKey,
              collection: collection,
              coefficient: new BN((percentage / 100) * precision.toNumber()),
              sendAndConfirm: false,
            })
          txBoosts.add(txPushFarmBoostingCollection)
        }),
      )
      allTxs.push({ tx: txBoosts, signers: [] })
    }

    // Add Reward
    const txRewards = new Transaction()
    await Promise.all(
      tokenRewards.map(async ({ mintAddress, budget }, index) => {
        const rewardAmount = decimalize(budget, decimals[index])
        const { tx: txPushFarmReward } = await farming.pushFarmReward({
          farm: farmKeypair.publicKey,
          rewardMint: mintAddress,
          rewardAmount,
          sendAndConfirm: false,
        })
        txRewards.add(txPushFarmReward)
      }),
    )
    allTxs.push({ tx: txRewards, signers: [] })

    const [txId] = await farming.provider.sendAll(allTxs)

    return { txId, farmAddress: farmKeypair.publicKey.toBase58() }
  }, [boostsData, decimals, endAt, farming, inputMint, startAt, tokenRewards])

  return onInitializeFarm
}

/**
 * Get nfts boosted
 * @param farmAddress Farm address
 * @returns List nfts boosted by farm address
 */
export const useNftsBoosted = (farmAddress: string) => {
  const debt = useDebtByFarmAddress(farmAddress)
  const farming = useFarming()
  const mpl = useMpl()

  const { value: nfts } = useAsync(async () => {
    if (!debt || debt.leverage.eq(precision)) return []
    const PDAs = await farming.deriveAllPDAs({ farm: farmAddress })
    const nfts = await mpl.nfts().findAllByOwner({ owner: PDAs.debtTreasurer })
    return nfts
  }, [mpl, farming, debt])

  return nfts || []
}
