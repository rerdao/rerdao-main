'use client'
import { ChevronDown, ChevronUp } from 'lucide-react'
import classNames from 'classnames'

import { SortState } from '@/providers/farming.provider'

export type SortProps = {
  title: string
  value?: SortState
  onChange?: (value: SortState) => void
}

export default function Sort({
  title,
  value = 0,
  onChange = () => {},
}: SortProps) {
  const states: SortState[] = [-1, 0, 1]
  return (
    <label
      className="flex flex-row gap-2 items-center cursor-pointer"
      onClick={() => onChange(states[(value + 2) % 3])}
    >
      <span className="text-sm font-bold select-none">{title}</span>
      <span className="flex flex-col items-center">
        <ChevronUp
          className={classNames('w-3 h-3 opacity-40 stroke-[4px]', {
            '!opacity-100': value === 1,
          })}
        />
        <ChevronDown
          className={classNames('w-3 h-3 opacity-40 stroke-[4px]', {
            '!opacity-100': value === -1,
          })}
        />
      </span>
    </label>
  )
}
