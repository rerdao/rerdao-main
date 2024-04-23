'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { parse } from 'papaparse'
import classNames from 'classnames'

import { ChevronDown } from 'lucide-react'
import Dropzone from '@/components/dropzone'
import DatePicker from 'react-datepicker'
import TokenSelection from '@/components/tokenSelection'
import { MintLogo, MintSymbol } from '@/components/mint'

import { CreateStep } from '@/app/token-distribution/airdrop-vesting/constants'
import { isAddress } from '@/helpers/utils'
import { usePushMessage } from '@/components/message/store'
import {
  useDistributeConfigs,
  useAirdropMintAddress,
  useAirdropStore,
  useRecipients,
} from '@/providers/airdrop.provider'

export default function InputConfigs({
  setStep,
}: {
  setStep: (step: CreateStep) => void
}) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File>()
  const [unlimited, setUnlimited] = useState(true)

  const { push } = useRouter()
  const pushMessage = usePushMessage()
  const { mintAddress, setMintAddress } = useAirdropMintAddress()
  const { configs, upsertConfigs } = useDistributeConfigs()
  const { setRecipients } = useRecipients()
  const destroy = useAirdropStore(({ destroy }) => destroy)

  const { expiration, unlockTime } = configs

  const onMintAddress = useCallback(
    (value: string) => {
      setMintAddress(value)
      setOpen(false)
    },
    [setMintAddress],
  )

  const onTimeChange = (name: keyof typeof configs, value: Date | null) => {
    if (!value) return
    upsertConfigs({ [name]: new Date(value).getTime() })
  }

  const onBack = () => {
    destroy()
    return push('/token-distribution/airdrop-vesting/airdrop')
  }

  const timeError = useMemo(() => {
    if (unlimited) return ''
    if (expiration < Date.now()) return 'Must be greater than current time.'
    if (expiration < unlockTime) return 'Must be greater than unlock time.'
    return ''
  }, [expiration, unlimited, unlockTime])

  const ok = useMemo(
    () => unlockTime && isAddress(mintAddress) && !timeError,
    [unlockTime, mintAddress, timeError],
  )

  useEffect(() => {
    if (!file) return setRecipients([])
    parse<string[]>(file, {
      complete: ({ data, errors }) => {
        if (errors.length)
          errors.forEach((er) => pushMessage('alert-error', er.message))
        else {
          const recipients = data.map(([address, amount]) => ({
            address,
            amount,
            unlockTime,
          }))
          setRecipients(recipients)
        }
      },
    })
  }, [file, pushMessage, setRecipients, unlockTime])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-xs opacity-60">Select a token and template</p>
            <div
              className="flex items-center border cursor-pointer rounded-lg p-2"
              onClick={() => setOpen(true)}
            >
              {mintAddress ? (
                <div className="flex items-center gap-2 flex-auto">
                  <MintLogo
                    mintAddress={mintAddress}
                    className="w-8 h-8 rounded-full"
                  />
                  <MintSymbol mintAddress={mintAddress} />
                </div>
              ) : (
                <p className="font-bold flex-auto"> Select a token</p>
              )}
              <ChevronDown className="h-4 w-4" />
            </div>
            <TokenSelection
              open={open}
              onCancel={() => setOpen(false)}
              mintAddress={mintAddress}
              onChange={onMintAddress}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-xs opacity-60">Unlock time</p>
              <DatePicker
                showIcon
                selected={new Date(unlockTime)}
                onChange={(date) => onTimeChange('unlockTime', date)}
                className="bg-base-200 !p-3 rounded-lg w-full"
                dateFormat={'dd/MM/yyyy, HH:mm'}
                showTimeInput
                showTimeSelect
                placeholderText="Select time"
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                <p className="flex-auto text-xs opacity-60">Expiration time</p>
                <p className="mr-2 text-xs opacity-60">Unlimited</p>
                <input
                  onChange={(e) => {
                    setUnlimited(e.target.checked)
                    upsertConfigs({ expiration: 0 })
                  }}
                  className="toggle toggle-xs"
                  type="checkbox"
                  checked={unlimited}
                />
              </div>
              <DatePicker
                showIcon
                selected={expiration ? new Date(expiration) : null}
                onChange={(date) => onTimeChange('expiration', date)}
                className={classNames('bg-base-200 !p-3 rounded-lg w-full', {
                  'opacity-60 cursor-not-allowed': !timeError,
                })}
                placeholderText="Select time"
                dateFormat={'dd/MM/yyyy, HH:mm'}
                showTimeInput
                showTimeSelect
                disabled={unlimited}
              />
              {timeError && <p className="text-xs text-primary">{timeError}</p>}
            </div>
          </div>
        </div>
        <Dropzone file={file} onChange={setFile} templateFile="/airdrop.csv" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <button className="btn" onClick={onBack}>
          Cancel
        </button>
        <button
          onClick={() => setStep(CreateStep.InputRecipients)}
          className="btn btn-primary"
          disabled={!ok}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
