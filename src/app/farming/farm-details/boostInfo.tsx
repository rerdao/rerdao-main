'use client'
import { useMemo } from 'react'
import BN from 'bn.js'

import { MintAmount, MintSymbol } from '@/components/mint'

import { precision, useNftsBoosted } from '@/hooks/farming.hook'
import {
  useBoostingByFarmAddress,
  useDebtByFarmAddress,
  useFarmByAddress,
} from '@/providers/farming.provider'
import { useNfts } from '@/hooks/mpl.hook'
import { numeric } from '@/helpers/utils'
import { decimalize, undecimalize } from '@/helpers/decimals'
import { useMintByAddress } from '@/providers/mint.provider'

type BoostInfoType = {
  farmAddress: string
  nfts: string[]
  amount: number
}

export default function BoostInfo({
  farmAddress,
  amount,
  nfts,
}: BoostInfoType) {
  const { inputMint } = useFarmByAddress(farmAddress)
  const debt = useDebtByFarmAddress(farmAddress)
  const boosting = useBoostingByFarmAddress(farmAddress)
  const { decimals = 0 } = useMintByAddress(inputMint.toBase58()) || {}
  const nftsMetadata = useNfts(nfts)
  const collections = nftsMetadata.map((metadata) =>
    metadata?.collection?.address.toBase58(),
  )
  const nftsBoosted = useNftsBoosted(farmAddress)
  const collectionBoosted = nftsBoosted.map(({ collection }) =>
    collection?.address.toBase58(),
  )

  const stakedAmount = useMemo(
    () =>
      !debt || (!amount && !nfts.length)
        ? new BN(0)
        : debt.shares.mul(precision).div(debt.leverage),
    [amount, debt, nfts.length],
  )

  const { boostRate, totalBoosted } = useMemo(() => {
    let boostRate = new BN(0)
    let totalBoosted = new BN(0)
    if (!nfts.length) return { boostRate, totalBoosted }

    for (const { boostingCollection, boostingCoefficient } of boosting) {
      if (collections.includes(boostingCollection.toBase58()))
        boostRate = boostRate.add(boostingCoefficient)
      if (collectionBoosted.includes(boostingCollection.toBase58()))
        totalBoosted = totalBoosted.add(boostingCoefficient)
    }

    return { boostRate, totalBoosted }
  }, [boosting, collectionBoosted, collections, nfts.length])
  const displayBoosted = !amount && !nfts.length ? new BN(0) : totalBoosted
  const totalBoostRate = displayBoosted.add(boostRate)

  const boostByNFT = useMemo(() => {
    if (!amount) return new BN(0)
    return stakedAmount
      .add(decimalize(amount.toString(), decimals))
      .mul(totalBoostRate)
      .div(precision)
  }, [amount, decimals, stakedAmount, totalBoostRate])

  const totalAmountIn = useMemo(
    () =>
      decimalize(amount.toString(), decimals).add(stakedAmount).add(boostByNFT),
    [amount, boostByNFT, decimals, stakedAmount],
  )

  return (
    <div className="card p-4 bg-base-300 mb-4 gap-2">
      <div className="flex justify-between  items-center">
        <p className="text-sm opacity-60">Staked LP</p>
        <MintAmount amount={stakedAmount} mintAddress={inputMint.toBase58()} />
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm opacity-60">LP amount</p>
        <p>
          {amount} <MintSymbol mintAddress={inputMint.toBase58()} />
        </p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm opacity-60">Total boost rate</p>
        <p> {numeric(undecimalize(totalBoostRate, 9)).format('0,0.[00]%')}</p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm opacity-60"> Boosted by NFT</p>
        <p>
          {numeric(undecimalize(boostByNFT, decimals)).format('0,0.[0000]')}
        </p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm opacity-60"> Total</p>
        <p>
          {numeric(undecimalize(totalAmountIn, decimals)).format('0,0.[0000]')}
        </p>
      </div>
      <p className="text-xs opacity-60 break-words">
        *Total = Staked LP + LP amount + Boosted LP
      </p>
    </div>
  )
}
