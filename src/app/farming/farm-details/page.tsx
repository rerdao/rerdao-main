'use client'
import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import classNames from 'classnames'

import { MintLogo, MintName, MintSymbol } from '@/components/mint'
import FarmTimeline from '../farmCard/farmTimeline'
import FarmStatus from '../farmCard/farmStatus'
import FarmReward from './farmReward'
import MyReward from './myReward'
import FarmApr from '../farmCard/farmApr'
import FarmTvl from '../farmCard/farmTvl'
import UserStake from '../farmCard/userStake'
import UserPosition from '../farmCard/userPosition'
import Stake from './stake'
import Unstake from './unstake'
import Ownership from './ownership'
import UnstakeNft from './unstakeNft'

import { isAddress } from '@/helpers/utils'
import {
  useBoostingByFarmAddress,
  useFarmByAddress,
} from '@/providers/farming.provider'
import { useWallet } from '@solana/wallet-adapter-react'

enum FarmAction {
  Stake = 'Stake',
  Unstake = 'Unstake',
  Admin = 'Admin',
}

export default function FarmDetails() {
  const { push } = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState(FarmAction.Stake)
  const { publicKey } = useWallet()

  const farmAddress = searchParams.get('farmAddress') || ''
  const { inputMint, authority } = useFarmByAddress(farmAddress)
  const boosting = useBoostingByFarmAddress(farmAddress)
  const inputMintAddress = useMemo(
    () => inputMint?.toBase58() || '',
    [inputMint],
  )
  const auth = authority && publicKey && authority.equals(publicKey)

  if (!isAddress(farmAddress)) return push('/farming')
  return (
    <div className="grid grid-cols-12 gap-4 @container/main">
      <div className="col-span-full @2xl/main:col-span-7 @3xl/main:col-span-8 grid grid-cols-12 gap-4 @container/left">
        <div className="col-span-full flex flex-row items-center gap-2">
          <MintLogo mintAddress={inputMintAddress} />
          <span className="flex-auto flex flex-col gap-0">
            <h4>
              <MintSymbol mintAddress={inputMintAddress} />
            </h4>
            <p className="text-sm opacity-60">
              <MintName mintAddress={inputMintAddress} />
            </p>
          </span>
          <FarmStatus farmAddress={farmAddress} />
        </div>
        <div className="col-span-full">
          <FarmTimeline farmAddress={farmAddress} />
        </div>
        <div className="col-span-6 @xl/left:col-span-3">
          <FarmApr farmAddress={farmAddress} />
        </div>
        <div className="col-span-6 @xl/left:col-span-3">
          <FarmTvl farmAddress={farmAddress} />
        </div>
        <div className="col-span-6 @xl/left:col-span-3">
          <UserStake farmAddress={farmAddress} />
        </div>
        <div className="col-span-6 @xl/left:col-span-3">
          <UserPosition farmAddress={farmAddress} />
        </div>
        <div className="col-span-full @lg/left:col-span-6 card bg-base-200 p-4">
          <FarmReward farmAddress={farmAddress} />
        </div>
        <div className="col-span-full @lg/left:col-span-6 card bg-base-200 p-4">
          <MyReward farmAddress={farmAddress} />
        </div>
        {!!boosting.length && (
          <div className="col-span-full">
            <UnstakeNft farmAddress={farmAddress} />
          </div>
        )}
      </div>
      <div className="col-span-full @2xl/main:col-span-5 @3xl/main:col-span-4 card bg-base-200 p-4">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-full mb-4">
            <div className="flex flex-row justify-center">
              <div className="tabs tabs-boxed flex-nowrap">
                {Object.values(FarmAction).map((value) => (
                  <button
                    key={value}
                    className={classNames('tab', {
                      'tab-active': tab === value,
                    })}
                    onClick={() => setTab(value)}
                    disabled={value === FarmAction.Admin && !auth}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="col-span-full">
            {tab === FarmAction.Stake ? (
              <Stake farmAddress={farmAddress} />
            ) : tab === FarmAction.Unstake ? (
              <Unstake farmAddress={farmAddress} />
            ) : (
              <Ownership farmAddress={farmAddress} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
