'use client'

import { ReactNode } from 'react'

export default function NewTokenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="card rounded-3xl bg-base-100 shadow-xl p-4">{children}</div>
  )
}
