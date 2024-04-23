'use client'
import { useState } from 'react'
import classNames from 'classnames'

import { Info, Percent } from 'lucide-react'

import solConfig from '@/configs/sol.config'
import { solscan } from '@/helpers/explorers'
import { usePushMessage } from '@/components/message/store'
import { usePoolByAddress } from '@/providers/pools.provider'
import { PRECISION, usePoolManagement } from '@/hooks/pool.hook'

const taxmanAddress = solConfig.taxman

const Content = ({
  title,
  percent,
  currentPercent,
  onChangeValue = () => { },
  tooltipContent,
  disabled,
}: {
  title: string
  percent: number | string
  currentPercent: number
  onChangeValue?: (percent: string) => void
  tooltipContent: string
  disabled?: boolean
}) => (
  <div className="flex flex-col gap-4 ">
    <div className="flex flex-row justify-between items-center">
      <div className="flex flex-row gap-2 items-center">
        <p className="text-sm">{title}</p>
        <span className="tooltip" data-tip={tooltipContent}>
          <Info className="w-4 h-4 cursor-pointer" />
        </span>
      </div>
      <div className="flex flex-row gap-1">
        <p className="text-sm opacity-60 ">Current {title}:</p>
        <p className="text-sm">{currentPercent}%</p>
      </div>
    </div>
    <div className="flex flex-row items-center relative">
      <Percent className="w-4 h-4 absolute left-3" />
      <input
        type="number"
        placeholder="0"
        disabled={disabled}
        value={percent}
        onChange={(e) => onChangeValue(e.target.value)}
        className={classNames(
          'input p-4 text-sm bg-base-200 w-full rounded-full focus:outline-none pl-9',
          {
            'cursor-not-allowed opacity-60': disabled,
          },
        )}
      />
    </div>
  </div>
)

export default function Fee({ poolAddress }: { poolAddress: string }) {
  const poolData = usePoolByAddress(poolAddress)

  const currentFee = (poolData.fee.toNumber() * 100) / PRECISION
  const currentTax = (poolData.tax.toNumber() * 100) / PRECISION

  const [fee, setFee] = useState(currentFee.toString())
  const [tax, setTax] = useState(currentTax.toString())

  const [loading, setLoading] = useState(false)

  const { updateFee } = usePoolManagement(poolAddress)
  const pushMessage = usePushMessage()

  const onUpdateFee = async () => {
    setLoading(true)
    try {
      const txId = await updateFee(fee, tax)
      return pushMessage('alert-success', 'Successfully Update Fee', {
        onClick: () => window.open(solscan(txId || ''), '_blank'),
      })
    } catch (err: any) {
      pushMessage('alert-error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Content
        title="LP Incentive"
        percent={fee}
        currentPercent={currentFee}
        onChangeValue={setFee}
        tooltipContent={
          'The portion of trading fee will incentivize to the liquidity providers upon their deposites in the pool.'
        }
      />

      <Content
        title="Platform Fee"
        percent={tax}
        currentPercent={currentTax}
        onChangeValue={setTax}
        tooltipContent={
          'The portion of fee will be paid to Reverion for maintaining the system.'
        }
        disabled={poolData.authority.toBase58() !== taxmanAddress}
      />

      <button
        disabled={
          fee === currentFee.toString() && tax === currentTax.toString()
        }
        onClick={onUpdateFee}
        className="btn btn-primary w-full rounded-full"
      >
        {loading && <span className="loading loading-spinner" />}
        Update
      </button>
    </div>
  )
}
