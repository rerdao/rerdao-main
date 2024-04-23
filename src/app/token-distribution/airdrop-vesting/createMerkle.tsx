'use client'
import { useCallback, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { MintAmount, MintSymbol } from '@/components/mint'
import CardOverview from './cardOverview'

import {
  Distribute,
  useInitMerkleTree,
  useTotalDistribute,
} from '@/hooks/airdrop.hook'
import {
  useAirdropMintAddress,
  useAirdropStore,
} from '@/providers/airdrop.provider'
import { CreateStep } from '@/app/token-distribution/airdrop-vesting/constants'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

export default function CreateMerkle({
  setStep,
}: {
  setStep: (step: CreateStep) => void
}) {
  const [loading, setLoading] = useState(false)
  const { total } = useTotalDistribute()
  const { mintAddress } = useAirdropMintAddress()
  const destroy = useAirdropStore(({ destroy }) => destroy)

  const pushMessage = usePushMessage()
  const { push } = useRouter()
  const pathname = usePathname()

  const type = useMemo(() => {
    const hops = pathname.split('/')
    if (hops.slice(2, hops.length).includes('token-distribution'))
      return Distribute.Airdrop
    return Distribute.Vesting
  }, [pathname])

  const initMerkle = useInitMerkleTree(type)
  const onInitMerkleTree = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await initMerkle()
      pushMessage(
        'alert-success',
        'Successfully airdrop. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
      destroy()
      push('/token-distribution/airdrop-vesting')
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [destroy, initMerkle, push, pushMessage])
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-2 justify-items-center">
        <p className="text-sm mb-1">Total transfer</p>
        <h4>
          <MintAmount amount={total} mintAddress={mintAddress} />
        </h4>
        <p className="px-3 py-1 rounded-lg bg-[#f9575e1a] text-primary ">
          <MintSymbol mintAddress={mintAddress} />
        </p>
      </div>
      <CardOverview showUnlock />
      <div className="grid grid-cols-2 gap-6">
        <button
          className="btn"
          onClick={() => setStep(CreateStep.InputRecipients)}
        >
          Cancel
        </button>
        <button
          disabled={loading}
          onClick={onInitMerkleTree}
          className="btn btn-primary"
        >
          {loading && <span className="loading loading-spinner loading-xs" />}
          Transfer
        </button>
      </div>
    </div>
  )
}
