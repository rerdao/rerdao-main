'use client'
import { useMemo } from 'react'

import { Trash, UserPlus } from 'lucide-react'

import { isAddress } from '@/helpers/utils'

type EditRecipientProps = {
  index?: string
  amount?: string
  address?: string
  warning?: boolean
  error?: boolean
  onAmount?: (amount: string) => void
  onAddress?: (address: string) => void
  onAdd?: () => void
  onRemove?: () => void
}

export default function EditRecipient({
  index = '',
  amount = '',
  address = '',
  warning = false,
  error = false,
  onAmount = () => {},
  onAddress = () => {},
  onAdd = () => {},
  onRemove = () => {},
}: EditRecipientProps) {
  const Icon = useMemo(() => (!index ? UserPlus : Trash), [index])
  const onHandle = index ? onRemove : onAdd

  const color = useMemo(() => {
    if (warning) return ' bg-warning text-warning-content'
    if (error) return ' bg-error text-error-content'
    else return ' bg-base-200'
  }, [warning, error])

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs">Receiver Address {index}</p>
      <div className="relative flex flex-row items-center">
        <div className="flex-auto grid grid-cols-12 join">
          <input
            type="text"
            placeholder="Receiver address"
            className={'col-span-8 join-item input focus:outline-0 p-3' + color}
            value={address}
            onChange={(e) => onAddress(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            className={'col-span-4 join-item input focus:outline-0 p-3' + color}
            value={amount}
            onChange={(e) => onAmount(e.target.value)}
          />
        </div>
        <button
          onClick={onHandle}
          disabled={!isAddress(address) || !amount}
          className="btn btn-xs btn-primary absolute right-1"
        >
          <Icon className="w-3 h-3" /> {index ? 'REMOVE' : 'ADD'}
        </button>
      </div>
    </div>
  )
}
