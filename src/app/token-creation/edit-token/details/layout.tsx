'use client'
import { ReactNode } from 'react'
import Link from 'next/link'

import { ArrowLeft, Settings } from 'lucide-react'

export default function TokenDetailsLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-full flex flex-row gap-2 items-center justify-between">
        <Link
          className="btn btn-circle btn-ghost btn-sm"
          href="/token-creation/edit-token/search"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="font-bold">Token Metadata</p>
        <button className="btn btn-circle btn-ghost btn-sm">
          <Settings className="h-4 w-4" />
        </button>
      </div>
      <div className="col-span-full">{children}</div>
    </div>
  )
}
