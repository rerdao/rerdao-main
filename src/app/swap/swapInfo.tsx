'use client'
import { Fragment, useMemo } from 'react'
import classNames from 'classnames'

import Image from 'next/image'
import { ChevronRight, Diamond } from 'lucide-react'
import { MintSymbol } from '@/components/mint'
import Island from '@/components/island'

import { numeric } from '@/helpers/utils'
import { Platform, useSwap, useSwapStore } from '@/hooks/swap.hook'
import { useMintByAddress } from '@/providers/mint.provider'

import {
  jupiterLightSvg,
  jupiterDarkSvg,
} from '@/static/images/welcome/partners'
import { useTheme } from '@/providers/ui.provider'

function PriceImpact() {
  const { routes } = useSwap()

  return (
    <div className="flex flex-row gap-2 items-baseline">
      <p className="flex-auto text-sm opacity-60">Price Impact</p>
      <p className="text-sm font-bold">
        {numeric(routes?.priceImpactPct || 0).format('0.[000000]')}%
      </p>
    </div>
  )
}

function Price() {
  const { bidMintAddress, askMintAddress, bidAmount, askAmount } =
    useSwapStore()
  return (
    <div className="flex flex-row gap-2 items-baseline">
      <p className="flex-auto text-sm opacity-60">Price</p>
      <p className="text-sm font-bold">
        {numeric(Number(bidAmount || 0) / Number(askAmount || 1)).format(
          '0,0.[000000]',
        )}
      </p>
      <p className="text-sm font-bold opacity-60">
        <MintSymbol mintAddress={bidMintAddress} />
        <span>/</span>
        <MintSymbol mintAddress={askMintAddress} />
      </p>
    </div>
  )
}

function SlippageTolerance() {
  const slippage = useSwapStore(({ slippage }) => slippage)
  const value = slippage === 1 ? 'Free' : `${slippage * 100}%`
  return (
    <div className="flex flex-row gap-2 items-baseline">
      <p className="flex-auto text-sm opacity-60">Slippage Tolerance</p>
      <div
        className={classNames('badge', {
          'badge-error': slippage >= 1,
          'badge-warning': slippage >= 0.05 && slippage < 1,
          'badge-success': slippage < 0.05,
        })}
      >
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  )
}

function Hop({ mintAddress }: { mintAddress: string }) {
  const { logoURI = '', symbol = mintAddress.substring(0, 6) } =
    useMintByAddress(mintAddress) || {}

  return (
    <span className="tooltip flex" data-tip={symbol}>
      <div className="avatar placeholder cursor-pointer">
        <div className="w-6 h-6 rounded-full shadow-sm">
          {logoURI ? (
            <img src={logoURI} alt={symbol} />
          ) : (
            <Diamond className="text-base-content" />
          )}
        </div>
      </div>
    </span>
  )
}

function PoweredByJupAf() {
  const { theme } = useTheme()

  const jup = useMemo(() => {
    if (theme === 'light') return jupiterLightSvg
    return jupiterDarkSvg
  }, [theme])

  return (
    <span className="flex flex-row gap-2 justify-end items-center">
      <p className="text-[9px] opacity-60">Powered by</p>
      <Image className="w-12" src={jup} alt="jupiter" />
    </span>
  )
}

function Routes() {
  const { hops, platform, fetching } = useSwap()

  return (
    <div className="flex flex-row gap-1">
      <p className="text-sm opacity-60">Routes</p>
      <div className="flex-auto flex flex-col gap-2">
        <span className="flex flex-row gap-1 justify-end items-center">
          {hops.map((mintAddress, i) => (
            <Fragment key={i}>
              {i !== 0 && <ChevronRight className="w-4 h-4" />}
              <Hop mintAddress={mintAddress} />
            </Fragment>
          ))}
        </span>
        {platform === Platform.Jup && !fetching && (
          <span
            className={classNames('flex flex-row gap-2 justify-end', {
              hidden: !hops.length,
            })}
          >
            <Island>
              <PoweredByJupAf />
            </Island>
          </span>
        )}
      </div>
    </div>
  )
}

export default function SwapInfo() {
  return (
    <div className="card bg-base-100 p-4 rounded-3xl grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-12">
        <Price />
      </div>
      <div className="col-span-12">
        <PriceImpact />
      </div>
      <div className="col-span-12">
        <SlippageTolerance />
      </div>
      <div className="col-span-12">
        <Routes />
      </div>
    </div>
  )
}
