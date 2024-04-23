'use client'
import { Fragment, useState } from 'react'

import { ChevronDown } from 'lucide-react'
import RewardCard from './rewardCard'
import ExpandReward from './expandReward'

import { ReceiveItem } from './page'

const DEFAULT_AMOUNT = 4

type VestingListProps = {
  vesting: ReceiveItem[][]
  loading: boolean
}

export default function VestingList({ vesting, loading }: VestingListProps) {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)

  return (
    <div className="@container/vesting card bg-base-100 grid grid-cols-12 p-4 gap-6 justify-center">
      <div className="col-span-full flex">
        <p>
          Vesting receive
          <span className="ml-2">{vesting.length}</span>
        </p>
      </div>
      {loading && !vesting.length && (
        <div className="col-span-full text-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      )}

      {/* Mobile display */}
      <div className="col-span-full grid grid-cols-12 gap-4 @3xl/vesting:hidden">
        {vesting.slice(0, showAirdrop).map((campaign, i) => (
          <div key={i} className="col-span-full grid grid-cols-12 gap-4">
            {campaign.map((props: ReceiveItem, index) => (
              <div
                className="col-span-full"
                key={`${props.distributor}-${index}`}
              >
                <ExpandReward {...props} forceExpand={!index} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop display */}
      <div className="col-span-full hidden @3xl/vesting:block overflow-x-auto">
        <table className="table">
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
            {vesting.slice(0, showAirdrop).map((campaign, i) => (
              <Fragment key={i}>
                {campaign.map((props: ReceiveItem, index) => (
                  <RewardCard
                    key={`${props.distributor}-${index}`}
                    {...props}
                  />
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="col-span-full flex justify-center">
        <button
          onClick={() => setAmountAirdrop(showAirdrop + DEFAULT_AMOUNT)}
          disabled={showAirdrop >= vesting.length}
          className="btn btn-ghost flex self-center"
        >
          <ChevronDown className="h-4 w-4" /> View more
        </button>
      </div>
    </div>
  )
}
