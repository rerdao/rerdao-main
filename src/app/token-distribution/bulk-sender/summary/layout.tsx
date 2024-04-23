import { ReactNode } from 'react'

import Island from '@/components/island'

export default function SummaryBulkSenderLayout({
  children,
}: {
  children: ReactNode
}) {
  return <Island>{children}</Island>
}
