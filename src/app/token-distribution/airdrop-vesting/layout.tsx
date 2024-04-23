import { ReactNode } from 'react'

import MerkleDistributionHeader from './header'

export default function AirdropVestingLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex w-full h-full flex-col gap-8 ">
      <MerkleDistributionHeader />
      <div>{children}</div>
    </div>
  )
}
