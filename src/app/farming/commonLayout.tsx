'use client'
import { ReactNode } from 'react'

import FarmingNavigation from './navigation'
import FarmingPanel from './panel'
import FarmingSearch from './search'

export default function CommonLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-4 @container">
      <div className="col-span-full">
        <FarmingPanel />
      </div>
      <div className="col-span-full flex flex-row gap-2 overflow-auto no-scrollbar">
        <FarmingNavigation />
      </div>
      <div className="col-span-full">
        <FarmingSearch />
      </div>
      <div className="col-span-full">{children}</div>
    </div>
  )
}
