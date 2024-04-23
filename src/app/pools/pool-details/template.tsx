'use client'
import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { isAddress } from '@sentre/senswap'

import { usePoolAddress } from './params.hook'

export default function Template({ children }: { children: ReactNode }) {
  const poolAddress = usePoolAddress()
  const { push } = useRouter()

  if (!isAddress(poolAddress)) return push('/pools')
  return <div className="w-full">{children}</div>
}
