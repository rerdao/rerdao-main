'use client'

import classNames from 'classnames'

import { useTotalPoolTvl } from '@/providers/stat.provider'
import { numeric } from '@/helpers/utils'
import { useSenSwapVol24h } from '@/hooks/pool.hook'

export default function LiquidityPoolPanel() {
  const tvl = useTotalPoolTvl()
  const vol24h = useSenSwapVol24h()

  return (
    <div className="card w-full shadow-lg p-8 ring-1 ring-base-100 bg-gradient-to-br from-cyan-200 to-indigo-300 flex flex-row-reverse flex-wrap gap-x-2 gap-y-16 justify-center">
      <div className="w-48 relative -mb-4">
        <img
          className="w-full"
          src="/farming-illustration.png"
          alt="farming-illustration"
        />
        <img
          className="absolute -top-6 left-4 animate-bounce"
          src="/farming-coin-1.svg"
          alt="farming-coin-1"
        />
        <img
          style={{ animationDelay: '150ms' }}
          className="absolute -top-12 right-2 animate-bounce"
          src="/farming-coin-2.svg"
          alt="farming-coin-2"
        />
      </div>
      <div className="flex-auto flex flex-col gap-8 text-slate-800">
        <h4>Liquidity Pools</h4>
        <div className="flex flex-row gap-2">
          <div>
            <p className="text-sm">TVL</p>
            <h5>{numeric(tvl).format('$0,0.[00]')}</h5>
          </div>
          <span className="divider divider-horizontal m-0" />
          <div>
            <p className="text-sm">Total volume 24h</p>
            <h5
              className={classNames({
                'loading loading-spinner loading-xs': false,
              })}
            >
              {numeric(vol24h).format('$0,0.[00]')}
            </h5>
          </div>
        </div>
      </div>
    </div>
  )
}
