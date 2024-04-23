'use client'
import classNames from 'classnames'

import { Settings } from 'lucide-react'

import { useSwapStore } from '@/hooks/swap.hook'

function SlippageOptions({
  active = false,
  title = '',
  onClick = () => {},
}: {
  active?: boolean
  title?: string
  onClick?: () => void
}) {
  return (
    <button
      className={classNames('btn join-item', { 'btn-primary': active })}
      onClick={onClick}
    >
      {title}
    </button>
  )
}

export default function SwapSettings() {
  const slippage = useSwapStore(({ slippage }) => slippage)
  const setSlippage = useSwapStore(({ setSlippage }) => setSlippage)

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-sm btn-ghost btn-circle">
        <Settings className="h-5 w-5" />
      </label>
      <div tabIndex={0} className="dropdown-content z-10">
        <div className="card bg-base-100 shadow-xl p-4 flex flex-col gap-2">
          <p className="text-sm font-bold">Slippage Tolerance</p>
          <div className="join">
            {[0.01, 0.05, 0.1, 1].map((value) => (
              <SlippageOptions
                key={value}
                title={value === 1 ? 'Free' : `${value * 100}%`}
                active={slippage === value}
                onClick={() => setSlippage(value)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
