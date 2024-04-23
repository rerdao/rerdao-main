'use client'
import { useCallback, useState } from 'react'
import { BN } from 'bn.js'
import { ReceiptData } from '@sentre/utility'
import { PublicKey } from '@solana/web3.js'
import dayjs from 'dayjs'

import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'
import StatusTag, { ReceiptState } from './statusTag'

import { ReceiveItem } from './page'
import { shortenAddress } from '@/helpers/utils'
import { useClaim } from '@/hooks/airdrop.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'
import { useAirdropStore } from '@/providers/airdrop.provider'

export default function RewardCard(props: ReceiveItem) {
  const { leaf, endedAt, mintAddress, sender, status, receiptAddress } = props
  const [loading, setLoading] = useState(false)
  const pushMessage = usePushMessage()
  const upsertReceipt = useAirdropStore(({ upsertReceipt }) => upsertReceipt)

  const startTime = leaf.startedAt.toNumber() * 1000

  const claim = useClaim(props.distributor, leaf)
  const onClaim = useCallback(async () => {
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
  }, [
    claim,
    leaf,
    props.distributor,
    pushMessage,
    receiptAddress,
    upsertReceipt,
  ])

  return (
    <tr className="hover cursor-pointer">
      <td>
        {!startTime
          ? 'Immediately'
          : dayjs(startTime).format('DD/MM/YYYY, HH:mm')}
      </td>
      <td>
        {!endedAt ? 'Unlimited' : dayjs(endedAt).format('DD/MM/YYYY, HH:mm')}
      </td>
      <td>
        <p
          onClick={() => window.open(solscan(sender), '_blank')}
          className="text-sm cursor-pointer underline"
        >
          {shortenAddress(sender)}
        </p>
      </td>
      <td>
        <div className="flex gap-2 items-center">
          <MintLogo
            mintAddress={mintAddress}
            className="w-6 h-6 rounded-full bg-base-300"
          />
          <MintSymbol mintAddress={mintAddress} />
        </div>
      </td>
      <td>
        <MintAmount mintAddress={mintAddress} amount={leaf.amount} />
      </td>
      <td>
        <StatusTag state={status} />
      </td>
      <td>
        <button
          className="col-span-full btn btn-primary btn-sm"
          onClick={onClaim}
          disabled={status !== ReceiptState.ready || loading}
        >
          {loading && <span className="loading loading-spinner loading-xs" />}
          Claim
        </button>
      </td>
    </tr>
  )
}
