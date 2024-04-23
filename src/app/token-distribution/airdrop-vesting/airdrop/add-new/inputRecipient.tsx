'use client'
import { useCallback, useMemo, useState } from 'react'
import { BN } from 'bn.js'

import EditRecipient from './row'
import CardOverview from '@/app/token-distribution/airdrop-vesting/cardOverview'

import {
  RecipientData,
  useDistributeConfigs,
  useAirdropMintAddress,
  useRecipients,
} from '@/providers/airdrop.provider'
import { isAddress } from '@/helpers/utils'
import { CreateStep } from '@/app/token-distribution/airdrop-vesting/constants'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import { useTotalDistribute } from '@/hooks/airdrop.hook'
import { useMintByAddress } from '@/providers/mint.provider'
import { usePushMessage } from '@/components/message/store'
import { decimalize, undecimalize } from '@/helpers/decimals'

enum RowStatus {
  Good,
  BadAddress,
  Duplicated,
  BadAmount,
  ZeroAmount,
}

type InputRecipientProps = {
  setStep: (step: CreateStep) => void
}
export default function InputRecipient({ setStep }: InputRecipientProps) {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const { mintAddress } = useAirdropMintAddress()
  const { recipients, upsertRecipient, removeRecipient, setRecipients } =
    useRecipients()
  const { configs } = useDistributeConfigs()
  const { total, quantity } = useTotalDistribute()
  const { amount: myAmount } = useTokenAccountByMintAddress(mintAddress) || {
    amount: new BN(0),
  }
  const { decimals = 0 } = useMintByAddress(mintAddress) || {}
  const pushMessage = usePushMessage()

  const statuses = useMemo(
    () =>
      recipients.map(({ address, amount }, i) => {
        if (!isAddress(address)) return RowStatus.BadAddress
        if (Number(amount) < 0) return RowStatus.BadAmount
        if (Number(amount) === 0) return RowStatus.ZeroAmount
        if (
          recipients
            .map(({ address: next }, j) => next === address && i !== j)
            .reduce((a, b) => a || b, false)
        )
          return RowStatus.Duplicated
        return RowStatus.Good
      }),
    [recipients],
  )

  const errors = useMemo(
    () =>
      statuses
        .map((e) => e === RowStatus.BadAddress || e === RowStatus.BadAmount)
        .map((e) => (e ? 1 : 0))
        .reduce<number>((a, b) => a + b, 0),
    [statuses],
  )

  const onAdd = () => {
    if (!isAddress(address) || !amount) return
    upsertRecipient({ address, amount, unlockTime: configs.unlockTime })
    setAddress('')
    setAmount('')
  }

  const onMergeDuplicates = useCallback(() => {
    if (decimals === undefined)
      return pushMessage('alert-error', 'Cannot read onchain data.')

    const newData: Record<string, RecipientData> = {}
    recipients.forEach((recipient) => {
      const { address, amount } = recipient
      if (!newData[address]) return (newData[address] = recipient)

      const oldAmount = decimalize(newData[address].amount, decimals)
      const newAmount = decimalize(amount, decimals)
      newData[address].amount = undecimalize(oldAmount.add(newAmount), decimals)
    })
    return setRecipients(Object.values(newData))
  }, [decimals, pushMessage, recipients, setRecipients])

  const ok = useMemo(
    () => quantity && myAmount.gte(total) && !errors,
    [errors, myAmount, quantity, total],
  )

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex items-center">
        <p className="flex-auto">Fill in recipient information</p>
        <button
          className="btn btn-xs btn-accent"
          onClick={onMergeDuplicates}
          disabled={!statuses.find((e) => e === RowStatus.Duplicated)}
        >
          Merge duplicates
        </button>
      </div>

      <div className="gid grid-cols-1 gap-3">
        <EditRecipient
          address={address}
          amount={amount}
          onAddress={setAddress}
          onAmount={setAmount}
          onAdd={onAdd}
        />
        {recipients.map(({ address, amount }, i) => (
          <EditRecipient
            address={address}
            amount={amount}
            key={`${address}-${i}`}
            index={`${i + 1}`}
            onRemove={() => removeRecipient(i)}
            warning={
              statuses[i] === RowStatus.Duplicated ||
              statuses[i] === RowStatus.ZeroAmount
            }
            error={
              statuses[i] === RowStatus.BadAddress ||
              statuses[i] === RowStatus.BadAmount
            }
          />
        ))}
      </div>
      <CardOverview showUnlock showTotal />
      <div className="grid grid-cols-2 gap-6">
        <button
          className="btn"
          onClick={() => {
            setStep(CreateStep.InputConfigs)
            setRecipients([])
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => setStep(CreateStep.Confirm)}
          className="btn btn-primary"
          disabled={!ok}
        >
          {myAmount.lte(total) ? 'Insufficient balance' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
