import { ReactNode } from 'react'
import type { Metadata } from 'next'

import './index.scss'

export const metadata: Metadata = {
  title: 'Sentre Academy',
  description: 'From Zero To Hero in Solana.',
}

export default function AcademyLayout({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>
}
