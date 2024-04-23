'use client'
import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import BN from 'bn.js'
import { redirect } from 'next/navigation'

import { MintLogo, MintSymbol } from '@/components/mint'
import EditRowBulkSender from './row'

import {
  useBulkSenderData,
  useBulkSenderDecimalized,
  useBulkSenderMint,
} from '@/providers/bulkSender.provider'
import { isAddress, numeric } from '@/helpers/utils'
import { usePushMessage } from '@/components/message/store'
import { useTvl } from '@/hooks/tvl.hook'
import { useMints } from '@/hooks/spl.hook'
import { decimalize, undecimalize } from '@/helpers/decimals'
import { useSendBulk } from '@/hooks/airdrop.hook'
import { solscan } from '@/helpers/explorers'

enum RowStatus {
  Good,
  BadAddress,
  Duplicated,
  BadAmount,
  ZeroAmount,
}

const TX_SIZE = 7

function safeParseBN(a: string) {
  try {
    return new BN(a)
  } catch (er) {
    return new BN(0)
  }
}

export default function SummaryBulkSender() {
  const [loading, setLoading] = useState(false)
  const [newAmount, setNewAmount] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [isRetry, setIsRetry] = useState(false)
  const { mintAddress } = useBulkSenderMint()
  const { data, setData } = useBulkSenderData()
  const { decimalized, setDecimalized } = useBulkSenderDecimalized()
  const pushMessage = usePushMessage()
  const [mint] = useMints([mintAddress])
  const sendBulk = useSendBulk(mintAddress)

  const decimals = useMemo(() => mint?.decimals, [mint?.decimals])
  const amount = useMemo(
    () =>
      data.reduce((s, [_, a]) => {
        if (decimals === undefined) return new BN(0)
        if (decimalized) return s.add(safeParseBN(a))
        return decimalize(a, decimals).add(s)
      }, new BN(0)),
    [data, decimals, decimalized],
  )
  const tvl = useTvl([{ mintAddress, amount }])

  const statuses = useMemo(
    () =>
      data.map(([address, amount], i) => {
        if (!isAddress(address)) return RowStatus.BadAddress
        if (Number(amount) < 0) return RowStatus.BadAmount
        if (Number(amount) === 0) return RowStatus.ZeroAmount
        if (decimalized && Number(amount) % 1 !== 0) return RowStatus.BadAmount
        if (
          data
            .map(([next], j) => next === address && i !== j)
            .reduce((a, b) => a || b, false)
        )
          return RowStatus.Duplicated
        return RowStatus.Good
      }),
    [data, decimalized],
  )
  const errors = useMemo(
    () =>
      statuses
        .map((e) => e === RowStatus.BadAddress || e === RowStatus.BadAmount)
        .map((e) => (e ? 1 : 0))
        .reduce<number>((a, b) => a + b, 0),
    [statuses],
  )
  const warnings = useMemo(
    () =>
      statuses
        .map((e) => e === RowStatus.ZeroAmount || e === RowStatus.Duplicated)
        .map((e) => (e ? 1 : 0))
        .reduce<number>((a, b) => a + b, 0),
    [statuses],
  )

  const onDelete = useCallback(
    (i: number) => {
      const newData = [...data]
      newData.splice(i, 1)
      return setData(newData)
    },
    [data, setData],
  )

  const onAdd = useCallback(() => {
    const newData = [...data]
    newData.push([newAddress, newAmount])
    setData(newData)
    setNewAddress('')
    setNewAmount('')
  }, [data, setData, newAddress, newAmount])

  const onMergeDuplicates = useCallback(() => {
    if (decimals === undefined)
      return pushMessage('alert-error', 'Cannot read onchain data.')
    const mapping: Record<string, string[]> = {}
    data.forEach(([address, amount]) => {
      if (!mapping[address]) mapping[address] = []
      mapping[address].push(amount)
    })
    const newData = Object.keys(mapping).map((address) => [
      address,
      undecimalize(
        mapping[address].reduce(
          (a, b) => decimalize(b, decimals).add(a),
          new BN(0),
        ),
        decimals,
      ),
    ])
    return setData(newData)
  }, [data, setData, decimals, pushMessage])

  const onFilterZeros = useCallback(() => {
    if (decimals === undefined)
      return pushMessage('alert-error', 'Cannot read onchain data.')
    const newData = data.filter(
      ([_, amount]) => !decimalize(amount, decimals).isZero(),
    )
    return setData(newData)
  }, [data, setData, decimals, pushMessage])

  const onSend = useCallback(async () => {
    try {
      setLoading(true)
      const { errorData, txIds } = await sendBulk(data)
      if (!errorData.length) {
        setIsRetry(false)
        return pushMessage(
          'alert-success',
          `Successfully send ${data.length} receiver. Click here to view on explorer.`,
          { onClick: () => window.open(solscan(txIds.pop() || ''), '_blank') },
        )
      }

      for (let i = 1; i <= txIds.length; i++) {
        const curIdx = i * TX_SIZE
        pushMessage(
          'alert-success',
          `Successfully sent from receiver ${curIdx} to ${
            curIdx + TX_SIZE
          } receiver. Click here to view on explorer.`,
          { onClick: () => window.open(solscan(txIds[i]), '_blank') },
        )
      }
      setData(errorData)
      setIsRetry(true)
      return pushMessage(
        'alert-error',
        'Transaction interrupted. Please retry unexecuted transactions',
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [data, pushMessage, sendBulk, setData])

  if (!isAddress(mintAddress))
    return redirect('/token-distribution/bulk-sender')
  return (
    <div className="col-span-full card bg-base-100 rounded-3xl p-6 shadow-xl grid grid-cols-12 gap-y-8 gap-x-2">
      <h5 className="col-span-full">Bulk Sender</h5>
      <div className="col-span-full grid grid-cols-12 gap-x-2 gap-y-6">
        <div className="col-span-full card flex flex-row gap-2 items-center">
          <MintLogo
            className="h-9 w-9 rounded-full"
            mintAddress={mintAddress}
          />
          <p className="font-bold flex-auto">
            <MintSymbol mintAddress={mintAddress} />
          </p>
          <label className="label cursor-pointer gap-2">
            <span className="label-text">Enable decimals</span>
            <input
              type="checkbox"
              className="checkbox"
              checked={decimalized}
              onChange={(e) => setDecimalized(e.target.checked)}
            />
          </label>
        </div>
        <div className="col-span-full flex flex-col gap-2">
          {data.map(([address, amount], i) => (
            <EditRowBulkSender
              key={`${address}-${i}`}
              index={String(i + 1)}
              address={address}
              amount={amount}
              onClick={() => onDelete(i)}
              error={
                statuses[i] === RowStatus.BadAddress ||
                statuses[i] === RowStatus.BadAmount
              }
              warning={
                statuses[i] === RowStatus.Duplicated ||
                statuses[i] === RowStatus.ZeroAmount
              }
            />
          ))}
          <EditRowBulkSender
            index={String(data.length + 1)}
            address={newAddress}
            onAddress={setNewAddress}
            amount={newAmount}
            onAmount={setNewAmount}
            onClick={onAdd}
            toAdd
          />
        </div>
        <div className="col-span-full  @container">
          <div className="flex flex-row justify-between items-center mb-6">
            {errors > 0 && (
              <span className="text-error text-sm font-semibold">{`${errors} error(s)`}</span>
            )}
            {warnings > 0 && (
              <span className="text-warning text-sm font-semibold">{`${warnings} warning(s)`}</span>
            )}
            {!errors && !warnings && (
              <span className="text-success text-sm font-semibold">
                Optimized
              </span>
            )}
            <div className="flex flex-row gap-2 items-center">
              <button
                className="btn btn-xs btn-outline rounded-full btn-error"
                onClick={onFilterZeros}
                disabled={!statuses.find((e) => e === RowStatus.ZeroAmount)}
              >
                Remove zeros
              </button>

              <button
                className="btn btn-xs btn-outline rounded-full btn-error"
                onClick={onMergeDuplicates}
                disabled={!statuses.find((e) => e === RowStatus.Duplicated)}
              >
                Merge duplicates
              </button>
            </div>
          </div>
          <div className="card flex flex-col bg-base-200 rounded-box w-full p-4 gap-2">
            <div className=" flex flex-row justify-between">
              <p className="text-sm opacity-60">Receivers</p>
              {numeric(data.length).format('0,0')}
            </div>
            <div className="flex flex-row justify-between">
              <p className="text-sm opacity-60">Total value</p>
              <div className="flex flex-col gap-1">
                <div className="flex flex-row text-xl font-bold">
                  {numeric(undecimalize(amount, mint?.decimals || 0)).format(
                    '0,0.[0000]',
                  )}{' '}
                  <MintSymbol mintAddress={mintAddress} />
                </div>
                <p className="text-right opacity-60">
                  {numeric(tvl).format('$0a.[0000]')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Link
        href={'/token-distribution/bulk-sender'}
        className="col-span-6 btn btn-ghost rounded-full"
      >
        Back
      </Link>
      <button
        className="col-span-6 btn btn-primary rounded-full"
        onClick={onSend}
        disabled={loading || !data.length}
      >
        {loading && <span className="loading loading-spinner loading-sm" />}
        {isRetry ? 'Retry' : 'Send'}
      </button>
    </div>
  )
}
