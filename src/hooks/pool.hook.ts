import { useCallback, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { utils, web3 } from '@coral-xyz/anchor'
import Senswap, {
  MintActionState,
  MintActionStates,
  PoolData,
} from '@sentre/senswap'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { WRAPPED_SOL_MINT } from '@metaplex-foundation/js'
import BN from 'bn.js'

import { useAnchorProvider } from '@/providers/wallet.provider'
import { decimalize, undecimalize } from '@/helpers/decimals'
import { usePoolByAddress, usePools } from '@/providers/pools.provider'
import {
  useAllTokenAccounts,
  useTokenAccountByMintAddress,
} from '@/providers/tokenAccount.provider'
import {
  usePoolStatStore,
  usePoolVolumesIn7Days,
} from '@/providers/stat.provider'
import { useInitPDAAccount, useMints, useSpl } from './spl.hook'
import solConfig from '@/configs/sol.config'
import { DateHelper } from '@/helpers/date'
import { useTvl } from './tvl.hook'

export const LPT_DECIMALS = 9
export const GENERAL_DECIMALS = 9
export const PRECISION = 1_000_000_000
export const GENERAL_NORMALIZED_NUMBER = 10 ** 9
const DEFAULT_FEE = new BN(2_500_000) // 0.25%
const DEFAULT_TAX = new BN(500_000) // 0.05%

export enum PoolFilter {
  AllPools = 'All Pools',
  MyPoolsOnly = 'My Pools Only',
}

export type VolumeData = { data: number; label: string }
export type ExtendedPoolData = PoolData & { address: string }

export type PoolPairLpData = {
  balanceIn: BN
  balanceOut: BN
  weightIn: number
  decimalIn: number
  swapFee: BN
}

export type MintSetup = {
  mintAddress: string
  weight: string
  isLocked: boolean
}

/**
 * Instantiate a balancer
 * @returns Balancer instance
 */
export const useSenswap = () => {
  const provider = useAnchorProvider()
  const senswap = useMemo(
    () => new Senswap(provider, solConfig.senswapAddress),
    [provider],
  )
  return senswap
}

/**
 * Get filtered Pools
 * @param filter filter key
 * @returns Filtered Pools
 */
export const useFilteredPools = (filter = PoolFilter.AllPools) => {
  const pools = usePools()
  const accounts = useAllTokenAccounts()
  const { publicKey } = useWallet()

  const accountAddresses = useMemo(() => Object.keys(accounts), [accounts])

  const filteredPools = useMemo(() => {
    return Object.keys(pools)
      .map((poolAddress) => {
        const pool = pools[poolAddress]
        const result = { ...pool, address: poolAddress }
        if (filter === PoolFilter.AllPools) return result
        if (!publicKey) return
        if (publicKey.equals(pool.authority)) return result
        if (
          accountAddresses.includes(
            utils.token
              .associatedAddress({
                owner: publicKey,
                mint: pool.mintLpt,
              })
              .toBase58(),
          )
        )
          return result
        return undefined
      })
      .filter((e) => !!e) as ExtendedPoolData[]
  }, [publicKey, pools, accountAddresses, filter])

  return filteredPools
}

/**
 * Wrap and Unwrap sol
 * @returns Wrap and Unwrap sol functions
 */
export const useWrapSol = () => {
  const spl = useSpl()
  const accounts = useAllTokenAccounts()
  const onInitAccount = useInitPDAAccount()
  const { publicKey } = useWallet()

  const { amount: wrapSolAmount } = useTokenAccountByMintAddress(
    WRAPPED_SOL_MINT.toBase58(),
  ) || { amount: new BN(0) }

  const createTxUnwrapSol = useCallback(
    async (owner: PublicKey) => {
      const ata = utils.token.associatedAddress({
        mint: WRAPPED_SOL_MINT,
        owner,
      })
      const tx = await spl.methods
        .closeAccount()
        .accounts({
          account: ata,
          destination: owner,
          owner: owner,
        })
        .transaction()
      return tx
    },
    [spl.methods],
  )

  const createWrapSol = useCallback(
    async (amount: BN) => {
      if (!publicKey) return
      const tx = new Transaction()
      const ataSol = utils.token.associatedAddress({
        mint: WRAPPED_SOL_MINT,
        owner: publicKey,
      })
      if (!accounts[ataSol.toBase58()]) {
        const txInitAcc = await onInitAccount(WRAPPED_SOL_MINT, publicKey)
        if (txInitAcc) tx.add(txInitAcc)
      }
      const txSolTransfer = await SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: ataSol,
        lamports: BigInt(amount.toString()),
      })
      const txSync = await spl.methods
        .syncNative()
        .accounts({ account: ataSol })
        .instruction()
      tx.add(txSolTransfer, txSync)

      return tx
    },
    [accounts, onInitAccount, publicKey, spl.methods],
  )

  const createWrapSolTxIfNeed = useCallback(
    async (mint: PublicKey, amount: BN) => {
      if (mint.equals(WRAPPED_SOL_MINT)) {
        const txWrapSol = await createWrapSol(amount.sub(wrapSolAmount))
        return txWrapSol
      }
    },
    [createWrapSol, wrapSolAmount],
  )

  return { createTxUnwrapSol, createWrapSol, createWrapSolTxIfNeed }
}

/**
 * Deposit token into pool
 * @param poolAddress Pool address
 * @param amounts list amount in
 * @returns Deposit function
 */
export const useDeposit = (poolAddress: string, amounts: string[]) => {
  const senswap = useSenswap()
  const { publicKey } = useWallet()
  const accounts = useAllTokenAccounts()
  const pool = usePoolByAddress(poolAddress)
  const mints = useMints(pool.mints.map((mint: PublicKey) => mint.toBase58()))
  const decimals = mints.map((mint) => mint?.decimals || 0)
  const { createWrapSol } = useWrapSol()

  const onDeposit = useCallback(async () => {
    if (!publicKey || !senswap.program.provider.sendAndConfirm) return
    const transaction = new Transaction()
    const dAmounts = amounts.map((amount, i) => decimalize(amount, decimals[i]))

    for (const i in pool.mints) {
      const mint = pool.mints[i]
      const ataAddress = utils.token.associatedAddress({
        mint,
        owner: publicKey,
      })
      const { amount } = accounts[ataAddress.toBase58()] || {
        amount: new BN(0),
      }
      // Wrap sol token if needed
      if (mint.equals(WRAPPED_SOL_MINT) && dAmounts[i].gt(amount)) {
        const txWrapSol = await createWrapSol(dAmounts[i].sub(amount))
        if (txWrapSol) transaction.add(txWrapSol)
      }
    }
    const { tx } = await senswap.addLiquidity({
      poolAddress,
      amounts: dAmounts,
      sendAndConfirm: false,
    })
    transaction.add(tx)
    const txId = await senswap.program.provider.sendAndConfirm(transaction)
    return txId
  }, [
    accounts,
    amounts,
    senswap,
    createWrapSol,
    decimals,
    pool.mints,
    poolAddress,
    publicKey,
  ])

  return onDeposit
}

/**
 * Withdraw token one side or full side
 * @param poolAddress Pool address
 * @param amount amount take out pool
 * @param mintAddress (Optional) mint address for withdraw one side
 * @returns Deposit function
 */
export const useWithdraw = (poolAddress: string, amount: string) => {
  const senswap = useSenswap()
  const { publicKey } = useWallet()
  const { mints } = usePoolByAddress(poolAddress)
  const { createTxUnwrapSol } = useWrapSol()

  const onWithdraw = useCallback(async () => {
    if (!publicKey || !senswap.program.provider.sendAndConfirm) return ''
    const dAmount = decimalize(amount, LPT_DECIMALS)

    const transaction = new web3.Transaction()
    const { tx } = await senswap.removeLiquidity({
      poolAddress,
      amount: dAmount,
      sendAndConfirm: false,
    })
    transaction.add(tx)

    for (const mint of mints) {
      if (!WRAPPED_SOL_MINT.equals(mint)) continue
      const unwrapSolTx = await createTxUnwrapSol(publicKey)
      transaction.add(unwrapSolTx)
    }
    const txId = await senswap.program.provider.sendAndConfirm(transaction)
    return txId
  }, [amount, senswap, createTxUnwrapSol, mints, poolAddress, publicKey])

  return onWithdraw
}

/**
 * Init and delete pool
 * @returns Init and delete pool functions
 */
export const useInitAndDeletePool = () => {
  const senswap = useSenswap()

  const initializePool = useCallback(
    async (mints: MintSetup[]) => {
      const mintsConfigs = mints.map(({ mintAddress, weight }) => {
        const dWeight = decimalize(weight, GENERAL_DECIMALS)
        return {
          publicKey: new PublicKey(mintAddress),
          action: MintActionStates.Active,
          amountIn: new BN(0),
          weight: dWeight,
        }
      })
      const { txId, poolAddress } = await senswap.initializePool({
        fee: DEFAULT_FEE,
        tax: DEFAULT_TAX,
        mintsConfigs,
        taxman: solConfig.taxman,
        sendAndConfirm: true,
      })
      return { txId, poolAddress }
    },
    [senswap],
  )

  const cancelPool = useCallback(
    async (poolAddress: string) => {
      const { txId } = await senswap.closePool({ poolAddress })
      return txId
    },
    [senswap],
  )

  return { initializePool, cancelPool }
}

/**
 * Initialize joins when create new pool
 * @param poolAddress Pool address
 * @param amountIns List amount in
 * @returns Add liquidity function
 */
export const useInitializeJoin = (poolAddress: string, amountIns: string[]) => {
  const senswap = useSenswap()
  const { publicKey } = useWallet()
  const accounts = useAllTokenAccounts()
  const pool = usePoolByAddress(poolAddress)
  const mints = useMints(pool.mints.map((mint: PublicKey) => mint.toBase58()))
  const decimals = mints.map((mint) => mint?.decimals || 0)
  const { createWrapSol } = useWrapSol()

  const onInitializeJoin = useCallback(async () => {
    if (!publicKey || !senswap.program.provider.sendAll) return
    const dAmountIns = amountIns.map((amount, i) =>
      decimalize(amount, decimals[i]),
    )
    const transactions: Transaction[] = []
    const splitArray: { mints: PublicKey[]; amounts: BN[]; reserves: BN[] }[] =
      []
    const size = 3

    for (let i = 0; i < pool.mints.length; i += size) {
      const mints = pool.mints.slice(i, i + size)
      const amounts = dAmountIns.slice(i, i + size)
      const reserves = pool.reserves.slice(i, i + size)
      splitArray.push({ mints, amounts, reserves })
    }

    for (const { amounts, mints, reserves } of splitArray) {
      const transaction = new Transaction()

      for (let i = 0; i < mints.length; i++) {
        const mint = mints[i]
        if (!reserves[i].isZero()) continue
        const ataAddress = utils.token.associatedAddress({
          mint,
          owner: publicKey,
        })
        const { amount } = accounts[ataAddress.toBase58()] || {
          amount: new BN(0),
        }
        // Wrap sol token if needed
        if (mint.equals(WRAPPED_SOL_MINT) && amounts[i].gt(amount)) {
          const txWrapSol = await createWrapSol(amounts[i].sub(amount))
          if (txWrapSol) transaction.add(txWrapSol)
        }
        const { tx } = await senswap.initializeJoin({
          poolAddress,
          mint,
          amount: amounts[i],
          sendAndConfirm: false,
        })
        transaction.add(tx)
      }

      transactions.push(transaction)
    }

    const [txId] = await senswap.program.provider.sendAll(
      transactions.map((tx) => ({ tx })),
    )
    return txId
  }, [
    accounts,
    amountIns,
    senswap,
    createWrapSol,
    decimals,
    pool,
    poolAddress,
    publicKey,
  ])

  return onInitializeJoin
}

/**
 * Oracles functions
 * @returns Oracles functions
 */
export const useOracles = () => {
  const calcNormalizedWeight = useCallback((weights: BN[], weightToken: BN) => {
    const numWeightsIn = weights.map((value) =>
      Number(undecimalize(value, GENERAL_DECIMALS)),
    )
    const numWeightToken = Number(undecimalize(weightToken, GENERAL_DECIMALS))
    const weightSum = numWeightsIn.reduce((pre, curr) => pre + curr, 0)
    return numWeightToken / weightSum
  }, [])

  const getMintInfo = useCallback(
    (poolData: PoolData, inputMint: PublicKey) => {
      const mintIdx = poolData.mints.findIndex((mint: PublicKey) =>
        mint.equals(inputMint),
      )

      if (mintIdx === -1) throw new Error('Can not find mint in pool')

      const normalizedWeight = calcNormalizedWeight(
        poolData.weights,
        poolData.weights[mintIdx],
      )
      return {
        reserve: poolData.reserves[mintIdx],
        normalizedWeight: normalizedWeight,
        treasury: poolData.treasuries[mintIdx],
      }
    },
    [calcNormalizedWeight],
  )

  const calcLptOut = useCallback(
    (
      tokenAmountIns: BN[],
      balanceIns: BN[],
      weightIns: BN[],
      totalSupply: BN,
      decimalIns: number[],
      swapFee: BN,
    ) => {
      const fee = Number(undecimalize(swapFee, GENERAL_DECIMALS))
      const numTotalSupply = Number(undecimalize(totalSupply, LPT_DECIMALS))
      const numBalanceIns = balanceIns.map((value, idx) =>
        Number(undecimalize(value, decimalIns[idx])),
      )
      const numAmountIns = tokenAmountIns.map((value, idx) =>
        Number(undecimalize(value, decimalIns[idx])),
      )
      const balanceRatiosWithFee = new Array(tokenAmountIns.length)

      let invariantRatioWithFees = 0
      for (let i = 0; i < tokenAmountIns.length; i++) {
        const nomalizedWeight = calcNormalizedWeight(weightIns, weightIns[i])

        balanceRatiosWithFee[i] =
          (numBalanceIns[i] + numAmountIns[i]) / numBalanceIns[i]

        invariantRatioWithFees += balanceRatiosWithFee[i] * nomalizedWeight
      }

      let invariantRatio = 1

      for (let i = 0; i < tokenAmountIns.length; i++) {
        const nomalizedWeight = calcNormalizedWeight(weightIns, weightIns[i])
        let amountInWithoutFee = numAmountIns[i]
        if (balanceRatiosWithFee[i] > invariantRatioWithFees) {
          const nonTaxableAmount =
            numBalanceIns[i] * (invariantRatioWithFees - 1)
          const taxableAmount = numAmountIns[i] - nonTaxableAmount
          amountInWithoutFee = nonTaxableAmount + taxableAmount * (1 - fee)
        }
        const balanceRatio =
          (numBalanceIns[i] + amountInWithoutFee) / numBalanceIns[i]
        invariantRatio = invariantRatio * balanceRatio ** nomalizedWeight
      }
      if (invariantRatio > 1) return numTotalSupply * (invariantRatio - 1)
      return 0
    },
    [calcNormalizedWeight],
  )

  const spotPriceAfterSwapTokenInForExactLPTOut = useCallback(
    (poolPairData: PoolPairLpData) => {
      const { balanceOut, balanceIn, swapFee, decimalIn } = poolPairData
      const Bo = Number(undecimalize(balanceOut, LPT_DECIMALS))
      const Ao = Number(undecimalize(new BN(0), LPT_DECIMALS))
      const wi = poolPairData.weightIn
      const Bi = Number(undecimalize(balanceIn, decimalIn))
      const f = Number(undecimalize(swapFee, GENERAL_DECIMALS))

      return (
        (Math.pow((Ao + Bo) / Bo, 1 / wi) * Bi) /
        ((Ao + Bo) * (1 + f * (-1 + wi)) * wi)
      )
    },
    [],
  )

  const calcLpForTokensZeroPriceImpact = useCallback(
    (
      tokenAmountIns: BN[],
      balanceIns: BN[],
      weightIns: BN[],
      totalSupply: BN,
      decimalIns: number[],
    ) => {
      const numTokenAmountIns = tokenAmountIns.map((value, idx) =>
        Number(undecimalize(value, decimalIns[idx])),
      )
      const amountLpOut = numTokenAmountIns.reduce(
        (totalBptOut, amountIn, i) => {
          const normalizedWeight = calcNormalizedWeight(weightIns, weightIns[i])
          const poolPairData: PoolPairLpData = {
            balanceIn: balanceIns[i],
            balanceOut: totalSupply,
            weightIn: normalizedWeight,
            decimalIn: decimalIns[i],
            swapFee: new BN(0),
          }
          const LpPrice = spotPriceAfterSwapTokenInForExactLPTOut(poolPairData)
          const LpOut = amountIn / LpPrice
          return totalBptOut + LpOut
        },
        0,
      )

      return amountLpOut
    },
    [calcNormalizedWeight, spotPriceAfterSwapTokenInForExactLPTOut],
  )

  const calcOutGivenInSwap = useCallback(
    (
      amountIn: BN,
      askReserve: BN,
      bidReserve: BN,
      askWeight: number,
      bidWeight: number,
      swapFee: BN,
    ): BN => {
      const numSwapFee = Number(swapFee) / GENERAL_NORMALIZED_NUMBER
      const numAmountIn = (1 - numSwapFee) * Number(amountIn)
      const numBalanceOut = Number(askReserve)
      const numBalanceIn = Number(bidReserve)
      const balanceRatio = numBalanceIn / (numAmountIn + numBalanceIn)
      const weightRatio = bidWeight / askWeight
      const askAmount = (1 - balanceRatio ** weightRatio) * numBalanceOut
      return decimalize(askAmount.toString(), 0)
    },
    [],
  )

  function calcSpotPriceExactInSwap(params: {
    amount: BN
    balanceIn: BN
    balanceOut: BN
    weightIn: number
    weightOut: number
    decimalIn: number
    decimalOut: number
    swapFee: BN
  }) {
    const {
      balanceIn,
      decimalIn,
      balanceOut,
      decimalOut,
      weightIn,
      weightOut,
      swapFee,
      amount,
    } = params
    const Bi = Number(undecimalize(balanceIn, decimalIn))
    const Bo = Number(undecimalize(balanceOut, decimalOut))
    const wi = weightIn
    const wo = weightOut
    const Ai = Number(undecimalize(amount, decimalIn))
    const f = Number(undecimalize(swapFee, GENERAL_DECIMALS))
    return -(
      (Bi * wo) /
      (Bo * (-1 + f) * (Bi / (Ai + Bi - Ai * f)) ** ((wi + wo) / wo) * wi)
    )
  }

  const calcPriceImpactSwap = useCallback(
    (
      bidAmount: BN,
      params: {
        balanceIn: BN
        balanceOut: BN
        weightIn: number
        weightOut: number
        decimalIn: number
        decimalOut: number
        swapFee: BN
      },
    ) => {
      const currentSpotPrice = calcSpotPriceExactInSwap({
        ...params,
        amount: new BN(0),
      })
      const spotPriceAfterSwap = calcSpotPriceExactInSwap({
        ...params,
        amount: bidAmount,
      })

      if (spotPriceAfterSwap < currentSpotPrice) return 0
      const impactPrice = 1 - currentSpotPrice / spotPriceAfterSwap
      return impactPrice
    },
    [],
  )
  return {
    calcNormalizedWeight,
    getMintInfo,
    calcLptOut,
    calcLpForTokensZeroPriceImpact,
    calcOutGivenInSwap,
    calcPriceImpactSwap,
  }
}

/**
 * Calculate volumes in 7 days of pool
 * @param poolAddress Pool address
 * @returns Total vol in 7 days, vol24h
 */
export const useVol24h = (poolAddress: string) => {
  const vols = usePoolVolumesIn7Days(poolAddress)

  const vol24h = useMemo(() => {
    if (!vols) return 0
    const { volumes } = vols
    const today = volumes[new DateHelper().ymd()]
    const yesterday = volumes[new DateHelper().subtractDay(1).ymd()]
    const hour = new Date().getHours()
    return today + (hour * yesterday) / 24
  }, [vols])

  return { vols, vol24h }
}

export const useSenSwapVol24h = () => {
  const volumes = usePoolStatStore(({ volumes }) => volumes)

  const vol24h = useMemo(() => {
    const today = new DateHelper()
    const yesterday = today.subtractDay(1)
    const hour = new Date().getHours()
    let total = 0

    for (const poolAddr in volumes) {
      const { volumes: volIn7Days } = volumes[poolAddr]
      total +=
        volIn7Days[today.ymd()] + (hour * volIn7Days[yesterday.ymd()]) / 24
    }
    return total
  }, [volumes])

  return vol24h
}

/**
 * Calculate apy pool
 * @param poolAddress Pool address
 * @returns apy
 */
export const useApy = (poolAddress: string) => {
  const { reserves, mints, tax, fee } = usePoolByAddress(poolAddress)
  const { vols } = useVol24h(poolAddress)
  const poolReserves = useMemo(
    () =>
      reserves.map((reserve, i) => ({
        mintAddress: mints[i].toBase58(),
        amount: reserve,
      })),
    [reserves, mints],
  )
  const tvl = useTvl(poolReserves)

  const apy = useMemo(() => {
    if (!vols || !tvl) return 0
    const dateRange = 7

    const { totalVol } = vols
    const totalFee =
      Number(undecimalize(fee.add(tax), GENERAL_DECIMALS)) * totalVol
    const feePerDay = totalFee / dateRange
    const roi = feePerDay / tvl
    const apy = Math.pow(1 + roi, 365) - 1

    return Number.isFinite(apy) ? apy : 0
  }, [fee, tax, tvl, vols])

  return apy
}

/**
 * List actions pool management
 * @param poolAddress pool address
 * @returns Actions pool management function
 */
export const usePoolManagement = (poolAddress: string) => {
  const senswap = useSenswap()

  const updateWeights = useCallback(
    async (tokensInfo: Record<string, MintSetup>) => {
      const weights = Object.values(tokensInfo).map(({ weight }) => {
        const newWeight = decimalize(weight, GENERAL_DECIMALS)
        return newWeight
      })
      const { txId } = await senswap.updateWeights({ poolAddress, weights })
      return txId
    },
    [senswap, poolAddress],
  )

  const freezePool = useCallback(async () => {
    const { txId } = await senswap.freezePool({ poolAddress })
    return txId
  }, [senswap, poolAddress])

  const thawPool = useCallback(async () => {
    const { txId } = await senswap.thawPool({ poolAddress })
    return txId
  }, [senswap, poolAddress])

  const updateFreezeAndThawToken = useCallback(
    async (mintActions: MintActionState[]) => {
      const { txId } = await senswap.updateActions({
        poolAddress,
        actions: mintActions,
      })
      return txId
    },
    [senswap, poolAddress],
  )

  const updateFee = useCallback(
    async (fee: string, tax: string) => {
      const { txId } = await senswap.updateFee({
        poolAddress,
        fee: new BN((Number(fee) * PRECISION) / 100),
        tax: new BN((Number(tax) * PRECISION) / 100),
      })
      return txId
    },
    [senswap, poolAddress],
  )

  const transferOwnership = useCallback(
    async (newOwner: string) => {
      const { txId } = await senswap.transferOwnership({
        poolAddress,
        newOwner,
      })
      return txId
    },
    [senswap, poolAddress],
  )

  return {
    updateWeights,
    freezePool,
    thawPool,
    updateFreezeAndThawToken,
    updateFee,
    transferOwnership,
  }
}
