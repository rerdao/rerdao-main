'use client'
import { useState } from 'react'

import FreezeAndThaw from './freezeAndThaw'
import Fee from './fee'
import TransferOwnership from './transferOwnership'

enum Tab {
  Pause,
  Fee,
  Ownership,
}

export type PoolManagementProps = {
  poolAddress: string
}

export default function PoolManagement({ poolAddress }: PoolManagementProps) {
  const [tab, setTab] = useState<Tab>(Tab.Pause)

  return (
    <div role="tablist" className="tabs tabs-lifted">
      <input
        type="radio"
        name="pause"
        role="tab"
        className="tab"
        aria-label="Pause"
        onChange={(e) => e.target.checked && setTab(Tab.Pause)}
        checked={tab === Tab.Pause}
      />
      <div
        role="tabpanel"
        className="tab-content bg-base-100 border-base-300 rounded-box p-6"
      >
        <FreezeAndThaw poolAddress={poolAddress} />
      </div>

      <input
        type="radio"
        name="fee"
        role="tab"
        className="tab"
        aria-label="Fee"
        onChange={(e) => e.target.checked && setTab(Tab.Fee)}
        checked={tab === Tab.Fee}
      />
      <div
        role="tabpanel"
        className="tab-content bg-base-100 border-base-300 rounded-box p-6"
      >
        <Fee poolAddress={poolAddress} />
      </div>

      <input
        type="radio"
        name="ownership"
        role="tab"
        className="tab"
        aria-label="Ownership"
        onChange={(e) => e.target.checked && setTab(Tab.Ownership)}
        checked={tab === Tab.Ownership}
      />
      <div
        role="tabpanel"
        className="tab-content bg-base-100 border-base-300 rounded-box p-6"
      >
        <TransferOwnership poolAddress={poolAddress} />
      </div>
    </div>
  )
}
