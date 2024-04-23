import { ReactNode } from 'react'

import FarmingPanel from '../panel'
import FarmingNavigation from '../navigation'
import FarmInfo from './farmInfo'

export default function FarmDetailsLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full">
        <FarmingPanel />
      </div>
      <div className="col-span-full flex flex-row gap-2 overflow-auto no-scrollbar">
        <FarmingNavigation />
      </div>
      <div className="col-span-full">
        <FarmInfo />
      </div>
      <div className="card p-4 bg-base-100 col-span-full">{children}</div>
    </div>
  )
}
