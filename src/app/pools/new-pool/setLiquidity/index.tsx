'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BN } from 'bn.js'
import { WRAPPED_SOL_MINT } from '@metaplex-foundation/js'
import { useWallet } from '@solana/wallet-adapter-react'
import { utils } from '@coral-xyz/anchor'

import MintInput from '../../mintInput'
import ListMintInfo from './mintInfo'

import { usePushMessage } from '@/components/message/store'
import { usePoolByAddress } from '@/providers/pools.provider'
import { usePrices } from '@/providers/mint.provider'
import { useAllTokenAccounts } from '@/providers/tokenAccount.provider'
import { useLamports } from '@/providers/wallet.provider'
import { useMints } from '@/hooks/spl.hook'
import {
  useInitializeJoin,
  useInitAndDeletePool,
  useOracles,
} from '@/hooks/pool.hook'
import { decimalize } from '@/helpers/decimals'
import { solscan } from '@/helpers/explorers'
import { Step } from '../step'

export type SetLiquidityProps = {
  poolAddress: string
  setStep: (step: number) => void
}

export default function SetLiquidity({
  poolAddress,
  setStep,
}: SetLiquidityProps) {
  const [amounts, setAmounts] = useState<string[]>([])
  const [activeIndx, setActiveIndx] = useState<number>()
  const [closing, setClosing] = useState(false)
  const [funding, setFunding] = useState(false)

  const { mints, weights } = usePoolByAddress(poolAddress)
  const mintInfos = useMints(mints.map((mint) => mint.toBase58()))
  const decimals = mintInfos.map((mint) => mint?.decimals || 0)
  const { calcNormalizedWeight } = useOracles()
  const mintAddresses = mints.map((mint) => mint.toBase58())
  const prices = usePrices(mintAddresses)
  const { publicKey } = useWallet()
  const accounts = useAllTokenAccounts()
  const lamports = useLamports()
  const pushMessage = usePushMessage()

  const { cancelPool } = useInitAndDeletePool()
  const onCancelPool = useCallback(async () => {
    try {
      setClosing(true)
      const txId = await cancelPool(poolAddress)
      pushMessage(
        'alert-success',
        'Successfully canceled the pool. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
      return setStep(Step.Setup)
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setClosing(false)
    }
  }, [cancelPool, poolAddress, pushMessage, setStep])

  const initializeJoin = useInitializeJoin(poolAddress, amounts)
  const onInitializeJoin = useCallback(async () => {
    try {
      setFunding(true)
      const txId = await initializeJoin()
      pushMessage(
        'alert-success',
        'Successfully fund the pool. Click here to view details.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
      return setStep(Step.Confirm)
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setFunding(false)
    }
  }, [initializeJoin, pushMessage, setStep])

  const onAmounts = async (activeIndx: number, amount: string) => {
    const nextAmounts = [...amounts]
    nextAmounts[activeIndx] = amount
    setActiveIndx(activeIndx)
    setAmounts(nextAmounts)
  }

  const amountSuggest = useMemo(() => {
    const result: string[] = []
    if (!prices || activeIndx === undefined) return []

    const basePrice = prices[activeIndx]
    const baseNormalizedWeight = calcNormalizedWeight(
      weights,
      weights[activeIndx],
    )

    for (const index in mints) {
      const numIdx = Number(index)
      const price = prices[numIdx]
      if (activeIndx === numIdx || !price) {
        result.push('')
        continue
      }
      const appliedNormalizedWeight = calcNormalizedWeight(
        weights,
        weights[numIdx],
      )
      const suggestedAmount = (
        ((basePrice * Number(amounts[activeIndx])) / baseNormalizedWeight) *
        (appliedNormalizedWeight / price)
      ).toFixed(decimals[numIdx])

      result.push(suggestedAmount)
    }
    return result
  }, [
    activeIndx,
    amounts,
    calcNormalizedWeight,
    decimals,
    mints,
    prices,
    weights,
  ])

  const ok = useMemo(() => {
    if (!publicKey) return false
    for (const index in amounts) {
      if (!Number(amounts[index])) return false
      const mint = mints[index]
      const ataAddress = utils.token.associatedAddress({
        mint,
        owner: publicKey,
      })
      let { amount: mintAmount } = accounts[ataAddress.toBase58()] || {
        amount: new BN(0),
      }

      if (WRAPPED_SOL_MINT.equals(mint))
        mintAmount = mintAmount.add(new BN(lamports))

      const amount = decimalize(amounts[index], decimals[index])
      if (mintAmount.lt(amount)) return false
    }
    return true
  }, [accounts, amounts, decimals, lamports, mints, publicKey])

  useEffect(() => {
    if (mints.length) setAmounts(new Array(mints.length).fill('0'))
  }, [mints])

  return (
    <div className="grid grid-cols-12 gap-2">
      {mints.map((mint, i) => (
        <div className="col-span-full" key={mint.toBase58()}>
          <MintInput
            mintAddress={mint.toBase58()}
            amount={amounts[i]}
            onAmount={(val) => onAmounts(i, val)}
            suggestAmount={amountSuggest[i]}
            visibleSuggest={
              activeIndx !== undefined &&
              !!amounts[activeIndx] &&
              !!amountSuggest[i] &&
              Number(amountSuggest[i]) !== Number(amounts[i])
            }
            weights={weights}
            index={i}
          />
        </div>
      ))}
      <div className="col-span-full mt-4 ">
        <ListMintInfo
          amounts={amounts}
          mintAddresses={mintAddresses}
          prices={prices}
        />
      </div>
      <div className="col-span-full grid grid-cols-12 gap-2 mt-4">
        <button onClick={onCancelPool} className="col-span-6 btn">
          {closing && <span className="loading loading-spinner loading-xs" />}
          Cancel Pool
        </button>
        <button
          onClick={onInitializeJoin}
          disabled={!ok}
          className="col-span-6 btn btn-primary"
        >
          {funding && <span className="loading loading-spinner loading-xs" />}
          Supply
        </button>
      </div>
    </div>
  )
}
