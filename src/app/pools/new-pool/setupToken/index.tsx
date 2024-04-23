'use client'
import { useCallback, useMemo, useState } from 'react'

import MintInput from './mintInput'
import { Plus } from 'lucide-react'

import { isAddress } from '@/helpers/utils'
import { MintSetup, useInitAndDeletePool } from '@/hooks/pool.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

const emptyMint: MintSetup = {
  mintAddress: '',
  weight: '',
  isLocked: false,
}
const MAX_AMOUNT = 8
const MIN_AMOUNT = 2

type SetupTokenProps = {
  setPoolAddress: (val: string) => void
  onNext: () => void
}

export default function SetupToken({
  onNext,
  setPoolAddress,
}: SetupTokenProps) {
  const [loading, setLoading] = useState(false)
  const [dataSetup, setDataSetup] = useState<MintSetup[]>([
    emptyMint,
    emptyMint,
  ])
  const pushMessage = usePushMessage()

  const { initializePool } = useInitAndDeletePool()
  const onInitPool = useCallback(async () => {
    try {
      setLoading(true)
      const { txId, poolAddress } = await initializePool(dataSetup)
      pushMessage(
        'alert-success',
        'Successfully initialize pool. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
      setPoolAddress(poolAddress)
      return onNext()
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [initializePool, pushMessage, setPoolAddress, onNext, dataSetup])

  const onChangeMint = (
    name: keyof MintSetup,
    value: string | boolean,
    index: number,
  ) => {
    const nextData = JSON.parse(JSON.stringify(dataSetup))
    nextData[index][name] = value
    return setDataSetup(nextData)
  }

  const onDelete = (index: number) => {
    const nextData = JSON.parse(JSON.stringify(dataSetup))
    nextData.splice(index, 1)
    setDataSetup(nextData)
  }

  const onAdd = () => {
    if (dataSetup.length === MAX_AMOUNT) return

    const nextData = JSON.parse(JSON.stringify(dataSetup))
    nextData.push(emptyMint)
    setDataSetup(nextData)
  }

  const error = useMemo(() => {
    let totalWeight = 0
    const mintAddresses: string[] = []
    for (const { mintAddress, weight } of dataSetup) {
      if (!isAddress(mintAddress)) return 'Please select token!'
      if (!Number(weight)) return 'Please input weight!'
      if (mintAddresses.includes(mintAddress))
        return 'Several token addresses are repeated!'

      totalWeight += Number(weight)
      mintAddresses.push(mintAddress)
    }
    const currAmount = dataSetup.length
    if (totalWeight !== 100) return 'Total weight must equal 100%'
    if (currAmount < MIN_AMOUNT) return 'Must have at least 2 tokens!'
    if (currAmount > MAX_AMOUNT) return 'Maximum only 8 tokens!'
    return ''
  }, [dataSetup])

  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-full flex items-center">
        <p className="flex-auto text-sm">Token</p>
        <p className="text-sm">Weight</p>
      </div>
      {dataSetup.map((data, i) => (
        <div className="col-span-full" key={data.mintAddress + i}>
          <MintInput
            setupData={data}
            onChange={(name, val) => onChangeMint(name, val, i)}
            onDelete={() => onDelete(i)}
          />
        </div>
      ))}
      <div className="col-span-full">
        <button
          disabled={dataSetup.length === MAX_AMOUNT}
          onClick={onAdd}
          className="btn btn-ghost btn-sm  rounded-3xl"
        >
          <Plus size={16} />
          Add New
        </button>
      </div>
      <div className="col-span-full mt-2">
        <button
          onClick={onInitPool}
          disabled={!!error}
          className="btn btn-primary w-full"
        >
          {loading && <span className="loading loading-spinner loading-xs" />}
          {error ? error : 'Supply'}
        </button>
      </div>
    </div>
  )
}
