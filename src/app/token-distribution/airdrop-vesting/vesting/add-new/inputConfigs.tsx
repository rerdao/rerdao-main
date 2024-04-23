'use client'
import {
  ChangeEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { parse } from 'papaparse'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useFloating, offset, flip, shift } from '@floating-ui/react'
import classNames from 'classnames'

import { ChevronDown } from 'lucide-react'
import { MintLogo, MintSymbol } from '@/components/mint'
import DatePicker from 'react-datepicker'
import TokenSelection from '@/components/tokenSelection'
import Dropzone from '@/components/dropzone'

import {
  useDistributeConfigs,
  useAirdropMintAddress,
  useAirdropStore,
  useRecipients,
} from '@/providers/airdrop.provider'
import { CreateStep } from '@/app/token-distribution/airdrop-vesting/constants'
import { usePushMessage } from '@/components/message/store'

dayjs.extend(duration)
dayjs.extend(relativeTime)

const IOS_STANDARD: Record<string, string> = {
  y: 'Y',
  year: 'Y',
  years: 'Y',
  month: 'M',
  months: 'M',
  d: 'D',
  day: 'D',
  days: 'D',
  h: 'H',
  hour: 'H',
  hours: 'H',
  m: 'M',
  minute: 'M',
  minutes: 'M',
  s: 'S',
  second: 'S',
  seconds: 'S',
}

const TEGTime = () => {
  const { configs, upsertConfigs } = useDistributeConfigs()
  const { tgePercent, tgeTime } = configs

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (Number(val) > 100 || Number(val) < 0) return
    upsertConfigs({ tgePercent: Number(val) })
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs opacity-60">TGE Percentage (Optional)</p>
        <input
          type="number"
          className="bg-base-200 p-3 rounded-lg"
          placeholder="Input %"
          value={tgePercent ? tgePercent : undefined}
          onChange={onChange}
        />
      </div>
      <div className="flex flex-col gap-3">
        <p className="flex-auto text-xs opacity-60">TGE Time</p>
        <DatePicker
          showIcon
          selected={tgeTime ? new Date(tgeTime) : null}
          onChange={(date) => upsertConfigs({ tgeTime: date?.getTime() })}
          className="bg-base-200 !p-3 rounded-lg w-full"
          placeholderText="Select time"
          dateFormat={'dd/MM/yyyy, HH:mm'}
          showTimeInput
          showTimeSelect
        />
      </div>
    </div>
  )
}

const listCliff = [
  dayjs.duration({ months: 1 }).asMilliseconds(),
  dayjs.duration({ months: 3 }).asMilliseconds(),
  dayjs.duration({ months: 6 }).asMilliseconds(),
  dayjs.duration({ months: 12 }).asMilliseconds(),
]
const CliffTime = () => {
  const [custom, setCustom] = useState<string>()
  const [cliffTimes, setCliffTimes] = useState(listCliff)

  const { configs, upsertConfigs } = useDistributeConfigs()

  const onAdd = () => {
    if (!custom) return

    const [duration, uint] = custom.split(/(\d+)/).filter(Boolean)
    const iosKey = IOS_STANDARD[uint.toLowerCase()]
    if (!Number(duration) || !iosKey) return

    const time = dayjs.duration(`P${duration + iosKey}`).asMilliseconds()
    const next = [...cliffTimes]
    next.push(time)
    setCliffTimes(next)
    upsertConfigs({ cliff: time })
    setCustom('')
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs opacity-60">Cliff</p>
      <div className="dropdown ">
        <label
          tabIndex={0}
          className="flex items-center bg-base-200 p-3 rounded-lg"
        >
          <p className="flex-auto">
            {dayjs.duration(configs.cliff, 'milliseconds').humanize()}
          </p>
          <ChevronDown className="w-3 h-3" />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full"
        >
          {cliffTimes.map((cliff) => (
            <li key={cliff} onClick={() => upsertConfigs({ cliff })}>
              <p>{dayjs.duration(cliff, 'milliseconds').humanize()}</p>
            </li>
          ))}
          <li className="relative">
            <input
              onChange={(e) => setCustom(e.target.value)}
              value={custom}
              placeholder="E.g: 1d, 1months, 1y,..."
              className="border mt-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') return onAdd()
              }}
            />
            <button
              onClick={onAdd}
              className="absolute btn btn-ghost btn-xs right-0 top-1/2 -translate-y-1/2"
            >
              Add
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

const distributesIn = [
  dayjs.duration({ months: 6 }).asMilliseconds(),
  dayjs.duration({ years: 1 }).asMilliseconds(),
  dayjs.duration({ years: 2 }).asMilliseconds(),
  dayjs.duration({ years: 4 }).asMilliseconds(),
]
const DistributeIn = () => {
  const [custom, setCustom] = useState<string>()
  const [distributesTime, setDistributesTime] = useState(distributesIn)
  const {
    refs: { setReference, setFloating },
    floatingStyles,
  } = useFloating({
    middleware: [offset(5), flip(), shift()],
  })
  const { configs, upsertConfigs } = useDistributeConfigs()
  const { distributeIn, expiration, frequency } = configs

  const error = useMemo(() => {
    if (expiration < distributeIn && expiration)
      return 'Must be less than the expiration time.'
    if (distributeIn < frequency)
      return 'Must be greater than the distribution frequency.'
    return ''
  }, [distributeIn, expiration, frequency])

  const onAdd = () => {
    if (!custom) return

    const [duration, uint] = custom.split(/(\d+)/).filter(Boolean)
    const iosKey = IOS_STANDARD[uint.toLowerCase()]
    if (!Number(duration) || !iosKey) return

    const time = dayjs.duration(`P${duration + iosKey}`).asMilliseconds()
    const next = [...distributesTime]
    next.push(time)
    setDistributesTime(next)
    upsertConfigs({ distributeIn: time })
    setCustom('')
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="flex-auto text-xs opacity-60">Distribute in</p>
      <div className="dropdown ">
        <label
          tabIndex={0}
          className="flex items-center bg-base-200 p-3 rounded-lg"
          ref={setReference}
        >
          <p className="flex-auto">
            {dayjs.duration(distributeIn, 'milliseconds').humanize()}
          </p>
          <ChevronDown className="w-3 h-3" />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full"
          style={floatingStyles}
          ref={setFloating}
        >
          {distributesTime.map((time) => (
            <li
              key={time}
              onClick={() => upsertConfigs({ distributeIn: time })}
            >
              <p>{dayjs.duration(time, 'milliseconds').humanize()}</p>
            </li>
          ))}
          <li className="relative">
            <input
              onChange={(e) => setCustom(e.target.value)}
              value={custom}
              placeholder="E.g: 1d, 1months, 1y,..."
              className="border mt-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') return onAdd()
              }}
            />
            <button
              onClick={onAdd}
              className="absolute btn btn-ghost btn-xs right-0 top-1/2 -translate-y-1/2"
            >
              Add
            </button>
          </li>
        </ul>
      </div>
      {error && <p className="text-xs text-[#F9575E]">{error}</p>}
    </div>
  )
}

const frequencies = [
  dayjs.duration({ months: 1 }).asMilliseconds(),
  dayjs.duration({ months: 3 }).asMilliseconds(),
  dayjs.duration({ months: 6 }).asMilliseconds(),
  dayjs.duration({ months: 12 }).asMilliseconds(),
]
const DistributeFrequency = () => {
  const [custom, setCustom] = useState<string>()
  const [frequenciesTime, setFrequenciesTime] = useState(frequencies)

  const { configs, upsertConfigs } = useDistributeConfigs()
  const { frequency } = configs

  const onAdd = () => {
    if (!custom) return

    const [duration, uint] = custom.split(/(\d+)/).filter(Boolean)
    const iosKey = IOS_STANDARD[uint.toLowerCase()]
    if (!Number(duration) || !iosKey) return

    const time = dayjs.duration(`P${duration + iosKey}`).asMilliseconds()
    const next = [...frequenciesTime]
    next.push(time)
    setFrequenciesTime(next)
    upsertConfigs({ frequency: time })
    setCustom('')
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs opacity-60">Distribution frequency</p>
      <div className="dropdown ">
        <label
          tabIndex={0}
          className="flex items-center bg-base-200 p-3 rounded-lg"
        >
          <p className="flex-auto">
            {dayjs.duration(frequency, 'milliseconds').humanize()}
          </p>
          <ChevronDown className="w-3 h-3" />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full"
        >
          {frequenciesTime.map((frequency) => (
            <li key={frequency} onClick={() => upsertConfigs({ frequency })}>
              <p>{dayjs.duration(frequency, 'milliseconds').humanize()}</p>
            </li>
          ))}
          <li className="relative">
            <input
              onChange={(e) => setCustom(e.target.value)}
              value={custom}
              placeholder="E.g: 1d, 1months, 1y,..."
              className="border mt-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') return onAdd()
              }}
            />
            <button
              onClick={onAdd}
              className="absolute btn btn-ghost btn-xs right-0 top-1/2 -translate-y-1/2"
            >
              Add
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

const Expiration = ({
  unlimited,
  onChange,
}: {
  unlimited: boolean
  onChange: (val: boolean) => void
}) => {
  const { configs, upsertConfigs } = useDistributeConfigs()
  const expiration = configs.expiration

  const error = useMemo(() => {
    const { cliff, tgeTime, distributeIn } = configs
    if (unlimited || !expiration || !tgeTime) return ''
    if (expiration < Date.now()) return 'Must be greater than current time.'
    const lastVestingTime = tgeTime + cliff + distributeIn
    if (expiration < lastVestingTime)
      return 'Must be greater than the total vesting time.'
    return ''
  }, [configs, expiration, unlimited])

  return (
    <div className="flex flex-col gap-3 ">
      <div className="flex items-center">
        <p className="flex-auto text-xs opacity-60">Expiration time</p>
        <p className="mr-2 text-xs opacity-60">Unlimited</p>
        <input
          onChange={(e) => {
            onChange(e.target.checked)
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
        onChange={(date) => upsertConfigs({ expiration: date?.getTime() })}
        className={classNames('bg-base-200 !p-3 rounded-lg w-full', {
          'opacity-60 cursor-not-allowed': unlimited,
        })}
        placeholderText="Select time"
        dateFormat={'dd/MM/yyyy, HH:mm'}
        showTimeInput
        showTimeSelect
        disabled={unlimited}
      />
      {error && <p className="text-xs text-primary">{error}</p>}
    </div>
  )
}

const MintSelection = () => {
  const [open, setOpen] = useState(false)
  const { mintAddress, setMintAddress } = useAirdropMintAddress()

  const onMintAddress = useCallback(
    (value: string) => {
      setMintAddress(value)
      setOpen(false)
    },
    [setMintAddress],
  )

  return (
    <div className="col-span-12 flex flex-col gap-3">
      <p>Select a token and input configs or drop the file</p>
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
  )
}

export default function InputConfigs({
  setStep,
}: {
  setStep: (step: CreateStep) => void
}) {
  const [file, setFile] = useState<File>()
  const [unlimited, setUnlimited] = useState(true)

  const { push } = useRouter()
  const pushMessage = usePushMessage()
  const { mintAddress } = useAirdropMintAddress()
  const { configs, upsertConfigs } = useDistributeConfigs()
  const { setRecipients, recipients } = useRecipients()
  const destroy = useAirdropStore(({ destroy }) => destroy)

  const onBack = () => {
    destroy()
    return push('/token-distribution/airdrop-vesting/vesting')
  }

  const ok = useMemo(() => {
    const { expiration, tgeTime, distributeIn, frequency } = configs
    const lastVestingTime = distributeIn + tgeTime
    const validExpiration = unlimited
      ? unlimited
      : expiration > Date.now() && expiration > lastVestingTime
    if (file) return !!recipients && !!mintAddress && validExpiration

    const validDistributeIn = distributeIn >= frequency
    return !!mintAddress && !!tgeTime && validExpiration && validDistributeIn
  }, [file, recipients, mintAddress, configs, unlimited])

  useEffect(() => {
    if (!file) return setRecipients([])
    parse<string[]>(file, {
      complete: ({ data, errors }) => {
        if (errors.length)
          errors.forEach((er) => pushMessage('alert-error', er.message))
        else {
          const recipients = data.map(([address, amount, time]) => ({
            address,
            amount,
            unlockTime: new Date(time).getTime(),
          }))
          upsertConfigs({ tgeTime: 0 }) //use to check user input by file or not?
          setRecipients(recipients)
        }
      },
    })
  }, [file, pushMessage, setRecipients, upsertConfigs])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid  md:grid-cols-2 grid-cols-1 gap-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <MintSelection />
          </div>
          {!file && (
            <Fragment>
              <div className="col-span-12">
                <TEGTime />
              </div>
              <div className="col-span-6">
                <CliffTime />
              </div>
              <div className="col-span-6">
                <DistributeFrequency />
              </div>
              <div className="col-span-6">
                <DistributeIn />
              </div>
            </Fragment>
          )}
          <div className="col-span-6">
            <Expiration unlimited={unlimited} onChange={setUnlimited} />
          </div>
        </div>
        <Dropzone file={file} onChange={setFile} templateFile="/vesting.csv" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <button className="btn" onClick={onBack}>
          Cancel
        </button>
        <button
          onClick={() => setStep(CreateStep.InputRecipients)}
          disabled={!ok}
          className="btn btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
