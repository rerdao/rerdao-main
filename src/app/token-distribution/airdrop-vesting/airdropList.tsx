'use client'
import { useState } from 'react'

import RewardCard from './rewardCard'
import ExpandReward from './expandReward'
import { ChevronDown } from 'lucide-react'

import { ReceiveItem } from './page'

const DEFAULT_AMOUNT = 4

type AirdropListProps = {
  airdrops: ReceiveItem[]
  loading: boolean
}

export default function AirdropList({ airdrops, loading }: AirdropListProps) {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)

  return (
    <div className="@container/airdrop card bg-base-100 grid grid-cols-12 p-4 gap-6 justify-center">
      <div className="col-span-full flex">
        <p>
          Airdrop receive
          <span className="ml-2">{airdrops.length}</span>
        </p>
      </div>
      {loading && !airdrops.length && (
        <div className="col-span-full text-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      )}
      {/* Mobile display */}
      <div className="col-span-full grid grid-cols-12 gap-4  @3xl/airdrop:hidden">
        {airdrops.slice(0, showAirdrop).map((props: ReceiveItem, i) => (
          <div key={props.distributor} className="col-span-full">
            <ExpandReward {...props} forceExpand={!i} />
          </div>
        ))}
      </div>

      {/* Desktop display */}
      <div className="col-span-full hidden @3xl/airdrop:block overflow-x-auto">
        <table className="table ">
          <thead>
            <tr>
              <th>UNLOCK TIME</th>
              <th>EXPIRATION TIME</th>
              <th>SENDER</th>
              <th>TOKEN</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {airdrops.slice(0, showAirdrop).map((props, i) => (
              <RewardCard key={i} {...props} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="col-span-full flex justify-center">
        <button
          onClick={() => setAmountAirdrop(showAirdrop + DEFAULT_AMOUNT)}
          disabled={showAirdrop >= airdrops.length}
          className="btn btn-ghost flex self-center"
        >
          <ChevronDown className="h-4 w-4" /> View more
        </button>
      </div>
    </div>
  )
}
