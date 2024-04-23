'use client'
import { useCallback, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

import { isAddress } from '@/helpers/utils'
import { useTransferOwnership } from '@/hooks/farming.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

export type OwnershipProps = {
  farmAddress: string
}

export default function Ownership({ farmAddress }: OwnershipProps) {
  const [loading, setLoading] = useState(false)
  const [owner, setOwner] = useState('')
  const { publicKey } = useWallet()
  const pushMessage = usePushMessage()

  const transferOwnership = useTransferOwnership(farmAddress, owner)
  const onTransferOwnership = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await transferOwnership()
      pushMessage(
        'alert-success',
        'Successfully transfer the ownership. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId), '_blank'),
        },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [transferOwnership, pushMessage])

  return (
    <div className="grid grid-cols-12 gap-2">
      <p className="col-span-full text-sm opacity-60">
        ⓘ Your current account will lose the farm control when you transfer the
        ownership.
      </p>
      <div className="col-span-full">
        <div className="card bg-base-300 p-4 grid grid-cols-12 gap-2">
          <p className="col-span-full text-sm opacity-60 flex-auto">
            New Owner
          </p>
          <input
            type="text"
            name="new-owner"
            className="col-span-full input input-ghost text-xl"
            placeholder={publicKey?.toBase58() || 'Wallet Address'}
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          />
        </div>
      </div>
      <button
        className="col-span-full btn btn-primary btn-sm"
        onClick={onTransferOwnership}
        disabled={!isAddress(owner) || loading}
      >
        {loading && <span className="loading loading-spinner loading-xs" />}
        Transfer Ownership
      </button>
    </div>
  )
}
