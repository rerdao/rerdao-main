'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import classNames from 'classnames'
import isEqual from 'react-fast-compare'
import { PoolStates, isAddress } from '@sentre/senswap'

import { ChevronLeft } from 'lucide-react'
import SetupToken from './setupToken'
import SetLiquidity from './setLiquidity'
import PoolOverview from './poolOverview'

import { usePools } from '@/providers/pools.provider'
import { Step } from './step'

export default function NewPool() {
  const [step, setStep] = useState(Step.Setup)
  const [poolAddress, setPoolAddress] = useState('')
  const pools = usePools()
  const { publicKey } = useWallet()
  const { push } = useRouter()

  const resumeStep = useCallback(() => {
    if (!publicKey) return
    let step = Step.Setup
    let address = ''
    for (const pool in pools) {
      const { authority, state } = pools[pool]
      if (authority.equals(publicKey)) {
        if (isEqual(state, PoolStates.Uninitialized)) {
          step = Step.AddLiquidity
          address = pool
        }
        if (isEqual(state, PoolStates.Initializing)) {
          step = Step.Confirm
          address = pool
        }
      }
    }
    setStep(step)
    setPoolAddress(address)
  }, [pools, publicKey])

  const renderContent = useMemo(() => {
    switch (step) {
      case Step.Setup:
        return (
          <SetupToken
            onNext={() => setStep(Step.AddLiquidity)}
            setPoolAddress={setPoolAddress}
          />
        )
      case Step.AddLiquidity:
        return <SetLiquidity setStep={setStep} poolAddress={poolAddress} />
      case Step.Confirm:
        return <PoolOverview poolAddress={poolAddress} />
    }
  }, [poolAddress, step])

  useEffect(() => {
    if (!isAddress(poolAddress)) resumeStep()
  }, [poolAddress, resumeStep])

  return (
    <div className="w-full max-w-[660px] card bg-base-100 rounded-3xl p-6 grid grid-cols-12 gap-6">
      <div className="col-span-full flex justify-between items-center">
        <button
          onClick={() => push('/pools')}
          className="btn btn-circle btn-sm"
        >
          <ChevronLeft />
        </button>
        <h5>New Pool</h5>
      </div>
      <div className="col-span-full">
        <ul className="steps w-full">
          <li
            className={classNames('step', {
              'step-primary': step >= Step.Setup,
            })}
          >
            Select token & weights
          </li>
          <li
            className={classNames('step', {
              'step-primary': step >= Step.AddLiquidity,
            })}
          >
            Set liquidity
          </li>
          <li
            className={classNames('step', {
              'step-primary': step >= Step.Confirm,
            })}
          >
            Confirm
          </li>
        </ul>
      </div>
      <div className="col-span-full">{renderContent}</div>
    </div>
  )
}
