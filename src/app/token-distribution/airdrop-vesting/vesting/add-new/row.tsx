'use client'
import { useMemo } from 'react'

import { UserPlus } from 'lucide-react'
import DatePicker from 'react-datepicker'

import { isAddress } from '@/helpers/utils'
import { useDistributeConfigs } from '@/providers/airdrop.provider'

type EditRecipientProps = {
  index?: string
  amount?: string
  address?: string
  time?: number
  onAmount?: (amount: string) => void
  onAddress?: (address: string) => void
  onTime?: (time: number) => void
  onAdd?: () => void
}

export default function EditRecipient({
  index = '',
  amount = '',
  address = '',
  time = 0,
  onTime = () => {},
  onAmount = () => {},
  onAddress = () => {},
  onAdd = () => {},
}: EditRecipientProps) {
  const {
    configs: { tgeTime },
  } = useDistributeConfigs()

  const ok = useMemo(() => {
    let isValidTime = true
    if (!tgeTime && !time) isValidTime = false
    return isAddress(address) && amount && isValidTime
  }, [address, amount, tgeTime, time])

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs">Wallet address {index}</p>
      <div className="grid grid-cols-12 gap-3">
        <div className="flex col-span-8 gap-3">
          <input
            type="text"
            placeholder="Receiver address"
            className="w-full join-item input focus:outline-0 p-3 bg-base-200"
            value={address}
            onChange={(e) => onAddress(e.target.value)}
          />
          {!tgeTime && (
            <DatePicker
              showIcon
              selected={time ? new Date(time) : null}
              onChange={(date) => onTime(date?.getTime() || 0)}
              className="bg-base-200 !p-3 rounded-lg w-56"
              placeholderText="Select time"
              dateFormat={'dd/MM/yyyy, HH:mm'}
              showTimeInput
              showTimeSelect
            />
          )}
        </div>
        <div className="col-span-4 relative join-item">
          <input
            type="number"
            placeholder="Amount"
            className="w-full input focus:outline-0 p-3 bg-base-200"
            value={amount}
            onChange={(e) => onAmount(e.target.value)}
          />
          <button
            onClick={onAdd}
            disabled={!ok}
            className="btn btn-xs btn-primary absolute right-1 top-1/2 -translate-y-1/2"
          >
            <UserPlus className="w-3 h-3" /> ADD
          </button>
        </div>
      </div>
    </div>
  )
}
