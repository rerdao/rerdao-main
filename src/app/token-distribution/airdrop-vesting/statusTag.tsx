'use client'
import { useMemo } from 'react'

export enum ReceiptState {
  waiting = 'Waiting',
  ready = 'Ready',
  claimed = 'Claimed',
  expired = 'Expired',
  loading = 'Loading',
}

const STATUS_COLOR: Record<ReceiptState, string> = {
  Waiting: '#D4B106',
  Ready: '#03A326',
  Claimed: '#40A9FF',
  Expired: '#F9575E',
  Loading: '#F4F5F5',
}

export default function StatusTag({ state }: { state?: ReceiptState }) {
  const tagColor = useMemo(() => {
    const color = !state
      ? STATUS_COLOR[ReceiptState.loading]
      : STATUS_COLOR[state]
    return color
  }, [state])

  return (
    <div
      className="px-2 py-1 border rounded-lg text-center"
      style={{ color: tagColor, borderColor: tagColor }}
    >
      {state}
    </div>
  )
}
