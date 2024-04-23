'use client'
import { MouseEvent, useCallback, useState } from 'react'
import { BN } from 'bn.js'
import { ReceiptData } from '@sentre/utility'
import { PublicKey } from '@solana/web3.js'
import dayjs from 'dayjs'

import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'
import ExpandCard from '@/components/expandCard'
import StatusTag, { ReceiptState } from './statusTag'

import { ReceiveItem } from './page'
import { shortenAddress } from '@/helpers/utils'
import { useClaim } from '@/hooks/airdrop.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'
import { useAirdropStore } from '@/providers/airdrop.provider'

export default function ExpandReward(
  props: ReceiveItem & { forceExpand: boolean },
) {
  const { leaf, endedAt, mintAddress, sender, status, receiptAddress } = props
  const [loading, setLoading] = useState(false)
  const pushMessage = usePushMessage()
  const upsertReceipt = useAirdropStore(({ upsertReceipt }) => upsertReceipt)

  const startTime = leaf.startedAt.toNumber() * 1000

  const claim = useClaim(props.distributor, leaf)
  const onClaim = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      try {
        setLoading(true)
        const txId = await claim()

        const receiptData: ReceiptData = {
          amount: leaf.amount,
          authority: leaf.authority,
          salt: Array.from(leaf.salt),
          startedAt: leaf.startedAt,
          claimedAt: new BN(Date.now() / 1000),
          distributor: new PublicKey(props.distributor),
        }
        upsertReceipt(receiptAddress, receiptData)

        pushMessage(
          'alert-success',
          'Successfully claim. Click here to view on explorer.',
          {
            onClick: () => window.open(solscan(txId), '_blank'),
          },
        )
      } catch (er: any) {
        pushMessage('alert-error', er.message)
      } finally {
        setLoading(false)
      }
    },
    [
      claim,
      leaf,
      props.distributor,
      pushMessage,
      receiptAddress,
      upsertReceipt,
    ],
  )

  return (
    <ExpandCard
      isExpand={props.forceExpand}
      header={
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center justify-between">
            <div className="flex !gap-2 items-center">
              <MintLogo
                mintAddress={mintAddress}
                className="w-6 h-6 rounded-full bg-base-300"
              />
              <p>
                <MintAmount mintAddress={mintAddress} amount={leaf.amount} />{' '}
                <MintSymbol mintAddress={mintAddress} />
              </p>
            </div>
            <StatusTag state={status} />
          </div>
          <div className="flex gap-2 items-center justify-between">
            <p
              onClick={() => window.open(solscan(sender), '_blank')}
              className="text-sm opacity-60 cursor-pointer"
            >
              Sender:{' '}
              <span className="underline"> {shortenAddress(sender)}</span>
            </p>
            <button
              className="col-span-full btn btn-primary btn-sm"
              onClick={onClaim}
              disabled={status !== ReceiptState.ready || loading}
            >
              {loading && (
                <span className="loading loading-spinner loading-xs" />
              )}
              Claim
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-2 ">
        <div className="flex gap-2 items-center justify-between">
          <p className="opacity-60">Unlock time</p>
          <p>
            {!startTime
              ? 'Immediately'
              : dayjs(startTime).format('DD/MM/YYYY, HH:mm')}
          </p>
        </div>
        <div className="flex gap-2 items-center justify-between">
          <p className="opacity-60">Expiration time</p>
          <p>
            {!endedAt
              ? 'Unlimited'
              : dayjs(endedAt).format('DD/MM/YYYY, HH:mm')}
          </p>
        </div>
      </div>
    </ExpandCard>
  )
}
