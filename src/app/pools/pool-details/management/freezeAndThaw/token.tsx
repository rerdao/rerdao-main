'use client'
import { useCallback, useState } from 'react'
import { MintActionState, MintActionStates } from '@sentre/senswap'

import { Info, Snowflake } from 'lucide-react'
import { MintLogo, MintSymbol } from '@/components/mint'

import { solscan } from '@/helpers/explorers'
import { usePoolManagement } from '@/hooks/pool.hook'
import { usePoolByAddress } from '@/providers/pools.provider'
import { usePushMessage } from '@/components/message/store'
import isEqual from 'react-fast-compare'

export default function FreezeAndThawToken({
  poolAddress,
}: {
  poolAddress: string
}) {
  const { mints, actions } = usePoolByAddress(poolAddress)

  const [mintActions, setMintActions] = useState<MintActionState[]>(actions)
  const [loading, setLoading] = useState(false)

  const pushMessage = usePushMessage()
  const { updateFreezeAndThawToken } = usePoolManagement(poolAddress)

  const onFreezeAndThawToken = async () => {
    setLoading(true)
    try {
      const txId = await updateFreezeAndThawToken(mintActions)
      return pushMessage('alert-success', 'Successfully Freeze Token', {
        onClick: () => window.open(solscan(txId || ''), '_blank'),
      })
    } catch (err: any) {
      pushMessage('alert-error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const onClickToken = useCallback(
    (index: number) => {
      const newMintActions = [...mintActions]
      if (isEqual(newMintActions[index], MintActionStates.Paused))
        newMintActions[index] = MintActionStates.Active
      else if (isEqual(newMintActions[index], MintActionStates.Active))
        newMintActions[index] = MintActionStates.Paused
      setMintActions(newMintActions)
    },
    [mintActions],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4">
          <Info className="w-4 h-4" />
          <p className="text-xs">
            Freezing tokens will prevent all actions until the tokens has been
            unfreezed.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {mints.map((mint, idx) => {
            const mintState = Object.keys(mintActions[idx])[0]
            return (
              <div
                key={mint.toBase58() + idx}
                onClick={() => onClickToken(idx)}
                className="card p-2 rounded-full border border-black flex flex-row gap-2 justify-center items-center cursor-pointer"
              >
                <MintLogo
                  mintAddress={mint.toBase58()}
                  className="w-6 h-6 rounded-full"
                />
                <h5 className="text-sm">
                  <MintSymbol mintAddress={mint.toBase58()} />
                </h5>
                {mintState === 'paused' && (
                  <div className="card absolute opacity-60 top-0 left-0 w-full h-full p-2 bg-black rounded-full flex justify-center items-center cursor-pointer">
                    <Snowflake className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={onFreezeAndThawToken}
        disabled={JSON.stringify(actions) === JSON.stringify(mintActions)}
        className="btn btn-primary w-full rounded-full"
      >
        {loading && <span className="loading loading-spinner" />}
        Confirm
      </button>
    </div>
  )
}
