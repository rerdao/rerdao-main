'use client'
import { useCallback, useMemo, useState } from 'react'
import { isAddress } from '@sentre/utility'
import { BN } from 'bn.js'
import dayjs from 'dayjs'

import EditRecipient from './row'
import CardOverview from '@/app/token-distribution/airdrop-vesting/cardOverview'
import { Trash } from 'lucide-react'

import {
  RecipientData,
  useDistributeConfigs,
  useAirdropMintAddress,
  useRecipients,
} from '@/providers/airdrop.provider'
import { decimalize, undecimalize } from '@/helpers/decimals'
import { useMintByAddress } from '@/providers/mint.provider'
import { shortenAddress } from '@/helpers/utils'
import { useTotalDistribute } from '@/hooks/airdrop.hook'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import { CreateStep } from '@/app/token-distribution/airdrop-vesting/constants'

const RecipientsList = () => {
  const { recipients, setRecipients } = useRecipients()

  const formatRecipient = useMemo(() => {
    const result: Record<
      string,
      Array<Omit<RecipientData, 'address'> & { er: boolean }>
    > = {}
    recipients.forEach(({ address, amount, unlockTime }) => {
      let er = false
      if (Number(amount) < 0) er = true
      if (!new Date(unlockTime).getTime()) er = true

      if (!result[address])
        return (result[address] = [{ amount, unlockTime, er }])
      return result[address].push({ amount, unlockTime, er })
    })
    return result
  }, [recipients])

  const onRemove = (address: string) => {
    const nextRecipients = [...recipients].filter(
      (recipient) => recipient.address !== address,
    )
    setRecipients(nextRecipients)
  }

  return recipients.length ? (
    <div className="grid grid-cols-12 bg-base-200 rounded-lg">
      {/* Header */}
      <div className="col-span-12 grid grid-cols-12 gap-3 p-4 ">
        <div className="col-span-1">
          <p className="text-xs opacity-60">No.</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs opacity-60">Wallet address</p>
        </div>
        <div className="col-span-7">
          <p className="text-xs opacity-60">Amount & Unlock time</p>
        </div>
      </div>
      {/* list recipients body */}
      {Object.keys(formatRecipient).map((address, index) => (
        <div
          key={address}
          className="col-span-12 grid grid-cols-12 gap-3 px-4 py-2 items-center"
        >
          <div className="col-span-1">
            <p className="text-sm">#{index + 1}</p>
          </div>
          <div className="col-span-2">
            <p
              className="text-sm"
              style={!isAddress(address) ? { color: '#F9575E' } : {}}
            >
              {shortenAddress(address)}
            </p>
          </div>
          <div className="col-span-8 flex gap-2 flex-wrap">
            {formatRecipient[address].map(({ amount, unlockTime, er }) => (
              <p
                key={unlockTime}
                style={er ? { color: '#F9575E', borderColor: '#F9575E' } : {}}
                className="border px-2 py-1 text-sm"
              >
                {amount} / {dayjs(unlockTime).format('MMM DD, YYYY HH:mm')}
              </p>
            ))}
          </div>
          <div className="col-span-1">
            <button
              className="btn btn-ghost btn-sm btn-square"
              onClick={() => onRemove(address)}
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="bg-base-200 rounded-lg flex justify-center items-center p-3">
      Please input recipient information
    </div>
  )
}

type InputRecipientProps = {
  setStep: (step: CreateStep) => void
}
export default function InputRecipients({ setStep }: InputRecipientProps) {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [time, setTime] = useState(0)

  const { configs } = useDistributeConfigs()
  const { mintAddress } = useAirdropMintAddress()
  const { decimals = 0 } = useMintByAddress(mintAddress) || {}
  const { upsertRecipient, setRecipients, recipients } = useRecipients()
  const { total, quantity } = useTotalDistribute()
  const { amount: myAmount } = useTokenAccountByMintAddress(mintAddress) || {
    amount: new BN(0),
  }

  const removeExistedAddress = useCallback(() => {
    const nextRecipients = [...recipients].filter(
      (recipient) => recipient.address !== address,
    )
    setRecipients(nextRecipients)
  }, [address, recipients, setRecipients])

  const onAdd = useCallback(() => {
    // Input file methods
    if (time) {
      setAddress('')
      setAmount('')
      setTime(0)
      return upsertRecipient({ address, amount, unlockTime: time })
    }

    if (decimals === undefined) return
    const existed = recipients.find(
      (recipient) => recipient.address === address,
    )
    if (existed) removeExistedAddress()
    const { distributeIn, frequency, tgePercent, tgeTime, cliff } = configs
    const rewardAmount = Math.floor(distributeIn / frequency)
    let unlockTime = tgeTime

    // Fist time (TGE)
    const dAmount = decimalize(amount, decimals)
    const firstReward = tgePercent
      ? dAmount.mul(new BN(tgePercent)).div(new BN(100))
      : new BN(0)
    const restAmount = dAmount.sub(firstReward)
    upsertRecipient({
      address,
      amount: undecimalize(firstReward, decimals),
      unlockTime,
    })
    // Rest rewards
    const singleReward = restAmount.div(new BN(rewardAmount))
    let sum = new BN(0)
    for (let i = 0; i < rewardAmount; i++) {
      if (!i) unlockTime = tgeTime + cliff
      if (i) unlockTime = unlockTime + frequency

      let reward = singleReward
      if (i === rewardAmount - 1) reward = restAmount.sub(sum)
      sum = sum.add(reward)
      upsertRecipient({
        address,
        amount: undecimalize(reward, decimals),
        unlockTime,
      })
    }
    setAddress('')
    setAmount('')
  }, [
    decimals,
    time,
    recipients,
    removeExistedAddress,
    configs,
    amount,
    upsertRecipient,
    address,
  ])

  const ok = useMemo(() => {
    let error = false
    for (const { address, amount, unlockTime } of recipients) {
      const validAmount = Number(amount) > 0
      const validAddress = isAddress(address)
      const validTime = !!unlockTime
      if (!validAddress || !validAmount || !validTime) {
        error = true
        break
      }
    }
    return !!quantity && myAmount.gte(total) && !error
  }, [myAmount, quantity, recipients, total])

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <EditRecipient
          amount={amount}
          onAmount={setAmount}
          address={address}
          onAddress={setAddress}
          onAdd={onAdd}
          time={time}
          onTime={setTime}
        />
      </div>
      <div className="col-span-12">
        <RecipientsList />
      </div>
      <div className="col-span-12">
        <CardOverview showTotal />
      </div>
      <div className="col-span-6">
        <button
          onClick={() => {
            setStep(CreateStep.InputConfigs)
            setRecipients([])
          }}
          className="btn w-full"
        >
          Cancel
        </button>
      </div>
      <div className="col-span-6">
        <button
          disabled={!ok}
          className="btn btn-primary w-full"
          onClick={() => setStep(CreateStep.Confirm)}
        >
          {myAmount.lte(total) ? 'Insufficient balance' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
